import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { createSuccessResponse } from '@/lib/errors'

export const dynamic = 'force-dynamic'

/**
 * Endpoint to get unique field values for filtering courses
 * Returns unique values for mainFieldOfStudy, campus, etc.
 */
export async function GET(_request: NextRequest) {
  try {
    // Get all courses
    const courses = await prisma.course.findMany({
      select: {
        mainFieldOfStudy: true,
      },
      take: 500, // Limit to 500 courses for performance
    })

    // Extract and flatten all mainFieldOfStudy values
    const allFields = courses.flatMap((course) =>
      // Filter out any null or undefined values
      (course.mainFieldOfStudy || []).filter((field) => field),
    )

    // Get unique values and sort alphabetically
    const uniqueFields = [...new Set(allFields)].sort()

    // Return the unique values
    return NextResponse.json(
      createSuccessResponse({
        mainFieldOfStudy: uniqueFields,
      }),
    )
  } catch (error) {
    console.error('Error fetching fields:', error)
    // Return an empty success response instead of an error
    return NextResponse.json(
      createSuccessResponse({
        mainFieldOfStudy: [],
      }),
    )
  }
}
