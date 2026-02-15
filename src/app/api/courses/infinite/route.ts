import { NextRequest, NextResponse } from 'next/server'
import { withPrisma } from '@/lib/prisma'
import { infiniteError } from '@/lib/errors'
import { CourseSearchSchema, validateQueryParams } from '@/lib/validation'
import type { InfiniteResponse } from '@/types/api'
import { Course, TriState } from '@/types/types'
import { transformCourses } from '@/lib/transformers'

export const dynamic = 'force-dynamic'

// Improved in-memory cache with TTL and size management
interface CacheEntry {
  data: unknown
  timestamp: number
  ttl: number // Time to live in milliseconds
}

const searchCache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes
const MAX_CACHE_SIZE = 200 // Maximum number of cached queries

function getCacheKey(params: Record<string, unknown>): string {
  // Create a cache key from search parameters
  const keyParts = [
    params.search || '',
    params.campus || '',
    params.mainFieldOfStudy || '',
    params.semester || '',
    params.period || '',
    params.block || '',
    params.studyPace || '',
    params.courseLevel || '',
    params.sortBy || 'code',
    params.sortOrder || 'asc',
    params.limit || 20,
    params.cursor || '',
    // Include a version number to invalidate cache after schema changes
    'v1.1',
  ]
  return keyParts.join('|')
}

function getCachedResult(cacheKey: string): unknown | null {
  const entry = searchCache.get(cacheKey)
  if (!entry) return null

  if (Date.now() - entry.timestamp > entry.ttl) {
    searchCache.delete(cacheKey)
    return null
  }

  return entry.data
}

function setCachedResult(
  cacheKey: string,
  data: unknown,
  ttl = CACHE_TTL,
): void {
  // Limit cache size to prevent memory issues
  if (searchCache.size >= MAX_CACHE_SIZE) {
    // Find and delete the oldest entries
    const entries = Array.from(searchCache.entries())
      .sort((a, b) => a[1].timestamp - b[1].timestamp)
      .slice(0, Math.floor(MAX_CACHE_SIZE * 0.2)) // Remove oldest 20%

    for (const [key] of entries) {
      searchCache.delete(key)
    }
  }

  searchCache.set(cacheKey, {
    data,
    timestamp: Date.now(),
    ttl,
  })
}

/**
 * GET /api/courses/infinite
 * Infinite loading API for course search with enhanced reliability
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
      search,
      campus,
      mainFieldOfStudy,
      semester,
      period,
      block,
      studyPace,
      courseLevel,
      examinations,
      sortBy = 'code',
      sortOrder = 'asc',
    } = params

    const limit = Math.min(Math.max(rawLimit || 20, 1), 50)

    // Check cache for non-cursor requests to improve performance
    if (!cursor) {
      const cacheKey = getCacheKey(params)
      const cachedResult = getCachedResult(cacheKey)
      if (cachedResult) {
        // Add cache hit header for monitoring
        const response = NextResponse.json(cachedResult)
        response.headers.set('X-Cache', 'HIT')
        return response
      }
    }

    // Build where conditions
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const whereConditions: any = {}

    if (search) {
      // Optimize search by using prefix search for short terms
      const searchTerm = search.trim()
      if (searchTerm.length > 0) {
        const usePrefixSearch = searchTerm.length <= 3
        whereConditions.OR = [
          {
            name: usePrefixSearch
              ? { startsWith: searchTerm, mode: 'insensitive' }
              : { contains: searchTerm, mode: 'insensitive' },
          },
          {
            code: usePrefixSearch
              ? { startsWith: searchTerm, mode: 'insensitive' }
              : { contains: searchTerm, mode: 'insensitive' },
          },
        ]
      }
    }

    if (campus) {
      const campusValues = campus.split('|')
      whereConditions.campus =
        campusValues.length > 1 ? { in: campusValues } : campus
    }

    if (mainFieldOfStudy) {
      const fieldValues = mainFieldOfStudy.split(',')
      whereConditions.mainFieldOfStudy =
        fieldValues.length > 1
          ? { hasSome: fieldValues }
          : { has: mainFieldOfStudy }
    }

    if (semester) {
      const semesterValues = semester
        .split(',')
        .map((s) => BigInt(parseInt(s, 10)))
      whereConditions.semester =
        semesterValues.length > 1
          ? { hasSome: semesterValues }
          : { has: semesterValues[0] }
    }

    if (period) {
      const periodValues = period.split(',').map((p) => BigInt(parseInt(p, 10)))
      whereConditions.period =
        periodValues.length > 1
          ? { hasSome: periodValues }
          : { has: periodValues[0] }
    }

    if (block) {
      const blockValues = block.split(',').map((b) => BigInt(parseInt(b, 10)))
      whereConditions.block =
        blockValues.length > 1
          ? { hasSome: blockValues }
          : { has: blockValues[0] }
    }

    if (courseLevel) {
      const levelValues = courseLevel.split(',')
      if (
        levelValues.includes('Grundnivå') &&
        !levelValues.includes('Avancerad nivå')
      ) {
        whereConditions.advanced = false
      } else if (
        !levelValues.includes('Grundnivå') &&
        levelValues.includes('Avancerad nivå')
      ) {
        whereConditions.advanced = true
      }
    }

    // Examination filter logic
    const examinationMap: Record<string, string[]> = {
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

    const includeExaminationCodes: string[] = []
    const excludeExaminationCodes: string[] = []

    if (examinations) {
      try {
        const examinationState = JSON.parse(examinations) as Record<
          string,
          TriState
        >
        for (const [key, value] of Object.entries(examinationState)) {
          const codes = examinationMap[key] || [key]
          if (value === 'checked') {
            includeExaminationCodes.push(...codes)
          } else if (value === 'indeterminate') {
            excludeExaminationCodes.push(...codes)
          }
        }
      } catch (e) {
        console.error('Failed to parse examinations filter:', e)
      }
    }

    if (studyPace) {
      const paceValues = studyPace.split(',')
      if (paceValues.includes('Helfart') && !paceValues.includes('Halvfart')) {
        whereConditions.OR = [
          { period: { equals: [BigInt(1)] } },
          { period: { equals: [BigInt(2)] } },
        ]
      } else if (
        !paceValues.includes('Helfart') &&
        paceValues.includes('Halvfart')
      ) {
        whereConditions.AND = [
          { period: { has: BigInt(1) } },
          { period: { has: BigInt(2) } },
        ]
      }
    }

    // Build orderBy
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const orderBy: any = { [sortBy]: sortOrder }
    const orderByArray = [orderBy]
    if (sortBy !== 'code') {
      orderByArray.push({ code: 'asc' })
    }
    orderByArray.push({ id: 'asc' }) // Final tie-breaker

    // Build query options with essential fields only
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const queryOptions: any = {
      where: whereConditions,
      orderBy: orderByArray,
      take: limit + 1, // Take one extra to check if there's a next page
      skip: cursor ? 1 : 0, // Skip the cursor item if provided
      cursor: cursor ? { id: cursor } : undefined,
      select: {
        // Essential fields for course cards and search
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
        // Include rating data to avoid N+1 queries
        _count: {
          select: {
            review: true,
          },
        },
        review: {
          select: {
            rating: true,
          },
        },
        // EXCLUDE heavy JSON fields that are not needed for list view
        // - learningOutcomes, content, teachingMethods, prerequisites
        // - recommendedPrerequisites, examination, programInfo
        // - examiner, exclusions, scheduledHours, selfStudyHours
      },
    }

    // Generate a cache key for this search query
    const cacheKey = getCacheKey(params)

    // Use enhanced withPrisma wrapper for more reliable database operations
    const dbResult = await withPrisma(
      async (prismaClient) => {
        const courses = await prismaClient.course.findMany(queryOptions)

        // Get total count for this query (only when no cursor for performance)
        let totalCount = null
        if (!cursor) {
          const countQuery = await prismaClient.course.count({
            where: whereConditions,
          })
          totalCount = countQuery
        }

        return { courses, totalCount }
      },
      {
        // Use caching for better performance
        useCache: !cursor, // Only cache first page queries
        cacheKey: !cursor ? `query-${cacheKey}` : undefined,
        cacheTtl: 60, // 1 minute cache for database results
        // Configure retry pattern for this endpoint,
      },
    )

    const courses = dbResult.courses
    const totalCount = dbResult.totalCount

    // Transform data
    const filteredCourses = transformCourses(courses) as unknown as Course[]

    // Check if there's a next page
    const hasNextPage = filteredCourses.length > limit
    const items = hasNextPage
      ? filteredCourses.slice(0, limit)
      : filteredCourses
    const nextCursor = hasNextPage ? items[items.length - 1]?.id : null

    const result = {
      success: true,
      data: items,
      nextCursor,
      hasNextPage,
      totalCount,
      count: items.length,
    } as InfiniteResponse<Course>

    // Cache the result for non-cursor requests
    if (!cursor) {
      setCachedResult(cacheKey, result)
    }

    // Create response with cache control headers
    const response = NextResponse.json(result)
    response.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    )
    response.headers.set('X-Cache', 'MISS')

    return response
  } catch (error) {
    console.error('Error fetching courses:', error)

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10)
    console.error(`Courses infinite error (ref: ${errorRef}):`, error)

    const _errorMessage =
      error instanceof Error
        ? `Failed to fetch courses: ${error.message}`
        : 'An unknown error occurred'

    const errorResponse = infiniteError(
      'Failed to load courses. Please try again in a moment.',
      errorRef,
    )

    // No caching for error responses
    errorResponse.headers.set('Cache-Control', 'no-store, max-age=0')

    return errorResponse
  }
}
