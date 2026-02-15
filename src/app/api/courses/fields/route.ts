import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

/**
 * GET /api/courses/fields
 *
 * Returns unique field-of-study values for the filter UI.
 * Fetches ALL courses (not a subset) so no fields are missed.
 */
export async function GET(_request: NextRequest) {
  try {
    const courses = await prisma.course.findMany({
      select: { mainFieldOfStudy: true },
    })

    const uniqueFields = [
      ...new Set(
        courses.flatMap((c) => (c.mainFieldOfStudy ?? []).filter(Boolean)),
      ),
    ].sort()

    return NextResponse.json({
      success: true,
      data: { mainFieldOfStudy: uniqueFields },
    })
  } catch (error) {
    console.error('Error fetching fields:', error)
    return NextResponse.json({
      success: true,
      data: { mainFieldOfStudy: [] },
    })
  }
}
