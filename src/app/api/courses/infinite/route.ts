import { NextRequest, NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma'
import { infiniteError } from '@/lib/errors'
import { CourseSearchSchema, validateQueryParams } from '@/lib/validation'
import type { InfiniteResponse } from '@/types/api'
import { Course, TriState } from '@/types/types'
import { transformCourses } from '@/lib/transformers'

export const dynamic = 'force-dynamic'

// ---------------------------------------------------------------------------
// Examination type code mapping (Swedish UI labels -> database codes)
// ---------------------------------------------------------------------------
const EXAMINATION_CODE_MAP: Readonly<Record<string, readonly string[]>> = {
  Inlämningsuppgift: ['UPG'],
  'Skriftlig tentamen': ['TEN', 'TENA'],
  Projektarbete: ['PRA', 'PROJ'],
  Laborationsarbete: ['LAB', 'LABA'],
  'Digital tentamen': ['DIT'],
  'Muntlig examination': ['MUN'],
  Kontrollskrivning: ['KTR'],
  Basgruppsarbete: ['BAS'],
  Hemtentamen: ['HEM'],
  Övrigt: ['DAK', 'MOM', 'ANN'],
  Seminarium: ['SEM'],
  Datorexamination: ['DAT'],
}

// ---------------------------------------------------------------------------
// Query building helpers
// ---------------------------------------------------------------------------

/**
 * Build Prisma `where` conditions from validated search parameters.
 *
 * All conditions are collected into an `AND` array so they compose safely --
 * this prevents the previous bug where `studyPace` silently overwrote the
 * `OR` condition set by `search`.
 */
function buildWhereConditions(params: {
  search?: string
  campus?: string
  mainFieldOfStudy?: string
  semester?: string
  period?: string
  block?: string
  studyPace?: string
  courseLevel?: string
  examinations?: string
}): Prisma.courseWhereInput {
  const conditions: Prisma.courseWhereInput[] = []

  // --- Text search (name or code) ---
  if (params.search) {
    const term = params.search.trim()
    if (term.length > 0) {
      const usePrefix = term.length <= 3
      conditions.push({
        OR: [
          {
            name: usePrefix
              ? { startsWith: term, mode: 'insensitive' as const }
              : { contains: term, mode: 'insensitive' as const },
          },
          {
            code: usePrefix
              ? { startsWith: term, mode: 'insensitive' as const }
              : { contains: term, mode: 'insensitive' as const },
          },
        ],
      })
    }
  }

  // --- Campus filter ---
  if (params.campus) {
    const values = params.campus.split('|')
    conditions.push({ campus: { in: values } })
  }

  // --- Field of study filter ---
  if (params.mainFieldOfStudy) {
    const values = params.mainFieldOfStudy.split(',')
    conditions.push({ mainFieldOfStudy: { hasSome: values } })
  }

  // --- Semester filter (BigInt[]) ---
  if (params.semester) {
    const values = params.semester
      .split(',')
      .map((s) => BigInt(parseInt(s, 10)))
    conditions.push({ semester: { hasSome: values } })
  }

  // --- Period filter (BigInt[]) ---
  if (params.period) {
    const values = params.period.split(',').map((p) => BigInt(parseInt(p, 10)))
    conditions.push({ period: { hasSome: values } })
  }

  // --- Block filter (BigInt[]) ---
  if (params.block) {
    const values = params.block.split(',').map((b) => BigInt(parseInt(b, 10)))
    conditions.push({ block: { hasSome: values } })
  }

  // --- Course level filter ---
  if (params.courseLevel) {
    const levels = params.courseLevel.split(',')
    const hasBasic = levels.includes('Grundnivå')
    const hasAdvanced = levels.includes('Avancerad nivå')
    // Only filter when exactly one level is selected; both = no filter
    if (hasBasic && !hasAdvanced) {
      conditions.push({ advanced: false })
    } else if (!hasBasic && hasAdvanced) {
      conditions.push({ advanced: true })
    }
  }

  // --- Study pace filter ---
  // "Helfart"  = full-pace, single-period course (period is [1] or [2])
  // "Halvfart" = half-pace, course spans both periods (period contains 1 AND 2)
  if (params.studyPace) {
    const paces = params.studyPace.split(',')
    const wantsFull = paces.includes('Helfart')
    const wantsHalf = paces.includes('Halvfart')
    if (wantsFull && !wantsHalf) {
      conditions.push({
        OR: [
          { period: { equals: [BigInt(1)] } },
          { period: { equals: [BigInt(2)] } },
        ],
      })
    } else if (!wantsFull && wantsHalf) {
      conditions.push({
        AND: [{ period: { has: BigInt(1) } }, { period: { has: BigInt(2) } }],
      })
    }
    // Both selected = no filter needed
  }

  // --- Examination filter (parsed, but NOT applied at query level) ---
  // The `examination` column is Json[] in PostgreSQL. Prisma cannot filter
  // inside JSON array elements with its query builder. Applying this filter
  // requires either raw SQL (jsonb_path_exists / @> operator) or
  // normalizing the examination data into a separate table.
  // TODO: Implement examination filtering via $queryRaw or schema change.
  if (params.examinations) {
    try {
      const examinationState = JSON.parse(params.examinations) as Record<
        string,
        TriState
      >
      const _includeCodes: string[] = []
      const _excludeCodes: string[] = []
      for (const [key, value] of Object.entries(examinationState)) {
        const codes = EXAMINATION_CODE_MAP[key] ?? [key]
        if (value === 'checked') _includeCodes.push(...codes)
        else if (value === 'indeterminate') _excludeCodes.push(...codes)
      }
      // Codes are parsed above but not yet used in `conditions`.
      // See the TODO comment above for the reason and path forward.
    } catch {
      // Malformed JSON from query param -- skip silently
    }
  }

  return conditions.length > 0 ? { AND: conditions } : {}
}

/**
 * Build a deterministic `orderBy` array for cursor-based pagination.
 * Always appends `code` and `id` as tie-breakers so cursor ordering is stable.
 */
function buildOrderBy(
  sortBy: string,
  sortOrder: 'asc' | 'desc',
): Prisma.courseOrderByWithRelationInput[] {
  const orderBy: Prisma.courseOrderByWithRelationInput[] = [
    { [sortBy]: sortOrder },
  ]
  if (sortBy !== 'code') orderBy.push({ code: 'asc' })
  orderBy.push({ id: 'asc' })
  return orderBy
}

// ---------------------------------------------------------------------------
// Fields selected for list view (excludes heavy JSON blobs)
// ---------------------------------------------------------------------------
const COURSE_LIST_SELECT = {
  id: true,
  code: true,
  name: true,
  campus: true,
  mainFieldOfStudy: true,
  period: true,
  block: true,
  semester: true,
  advanced: true,
  courseType: true,
  offeredFor: true,
  credits: true,
  exclusions: true,
  _count: { select: { review: true } },
  review: { select: { rating: true } },
} satisfies Prisma.courseSelect

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

/**
 * GET /api/courses/infinite
 *
 * Cursor-based infinite-loading endpoint for the course search page.
 */
export async function GET(
  request: NextRequest,
): Promise<NextResponse<InfiniteResponse<Course>>> {
  try {
    const { searchParams } = new URL(request.url)
    const params = validateQueryParams(searchParams, CourseSearchSchema)

    const {
      cursor,
      limit: rawLimit,
      sortBy = 'code',
      sortOrder = 'asc',
    } = params

    const limit = Math.min(Math.max(rawLimit || 20, 1), 50)
    const where = buildWhereConditions(params)
    const orderBy = buildOrderBy(sortBy, sortOrder)

    // Run the main query and count in parallel (count only on first page)
    const [courses, totalCount] = await Promise.all([
      prisma.course.findMany({
        where,
        orderBy,
        take: limit + 1, // fetch one extra to detect next page
        skip: cursor ? 1 : 0,
        cursor: cursor ? { id: cursor } : undefined,
        select: COURSE_LIST_SELECT,
      }),
      cursor ? Promise.resolve(null) : prisma.course.count({ where }),
    ])

    // Transform BigInt fields to plain numbers for JSON serialization
    const transformed = transformCourses(courses) as unknown as Course[]

    // Determine pagination
    const hasNextPage = transformed.length > limit
    const items = hasNextPage ? transformed.slice(0, limit) : transformed
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null

    const result: InfiniteResponse<Course> = {
      success: true,
      data: items,
      nextCursor,
      hasNextPage,
      totalCount,
      count: items.length,
    }

    const response = NextResponse.json(result)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    )
    return response
  } catch (error) {
    const errorRef = Math.random().toString(36).substring(2, 10)
    console.error(`Course search error (ref: ${errorRef}):`, error)

    const errorResponse = infiniteError(
      'Failed to load courses. Please try again in a moment.',
      errorRef,
    )
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0')
    return errorResponse
  }
}
