import { NextRequest, NextResponse } from 'next/server'
import { getOptionalUser } from '@/lib/auth'
import { ApiResponse } from '@/types/api'
import { withPrisma } from '@/lib/prisma'

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic'

// Stale while revalidate caching for reviews
export const revalidate = 60 // Revalidate cache every 60 seconds

/**
 * GET /api/courses/{courseId}/reviews - Get all reviews for a course
 * Uses robust connection handling with caching and stale-while-revalidate
 */
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> },
) {
  try {
    // Authentication is optional for viewing reviews
    await getOptionalUser()

    // Access params safely - need to await in Next.js 15
    const params = await context.params
    const courseId = params.courseId

    // Generate a cache key for this request
    const cacheKey = `reviews-${courseId}`

    // Use enhanced withPrisma with caching for better performance and reliability
    const result = await withPrisma(
      async (prisma) => {
        // First check if the course exists
        const course = await prisma.course.findUnique({
          where: { id: courseId },
        })

        if (!course) {
          return { notFound: true, reviews: [] }
        }

        // Get reviews for the course with user data
        const reviews = await prisma.review.findMany({
          where: { courseId },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                image: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        })

        return { course, reviews, notFound: false }
      },
      {
        // Enable caching for this operation with a 2 minute TTL
        useCache: true,
        cacheKey,
        cacheTtl: 120,
      },
    )

    // Handle course not found
    if (result.notFound) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
        },
        { status: 404 },
      )
    }

    // Transform reviews to add User field for frontend compatibility
    const formattedReviews = result.reviews.map((review) => ({
      ...review,
      // Add User field with capitalized U for frontend consistency
      User: review.user,
    }))

    // Calculate average rating
    const averageRating = result.reviews.length
      ? result.reviews.reduce((sum, review) => sum + review.rating, 0) /
        result.reviews.length
      : 0

    const response: ApiResponse<{
      reviews: typeof formattedReviews
      averageRating: number
    }> = {
      success: true,
      data: {
        reviews: formattedReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    }

    // Create response with proper cache headers
    const jsonResponse = NextResponse.json(response)

    // Use Next.js 15 recommended Cache-Control pattern
    // Public cache for 60 seconds, stale while revalidate for 5 minutes
    jsonResponse.headers.set(
      'Cache-Control',
      'public, s-maxage=60, stale-while-revalidate=300',
    )

    return jsonResponse
  } catch (error) {
    console.error('Error fetching reviews:', error)
    const _errorMessage =
      error instanceof Error
        ? `Failed to fetch reviews: ${error.message}`
        : 'Failed to fetch reviews'

    // Include a random error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10)
    console.error(`Reviews error reference: ${errorRef}`)

    return NextResponse.json(
      {
        success: false,
        error: 'Failed to load reviews. Please try again in a moment.',
        ref: errorRef,
      },
      {
        status: 500,
        // No caching for error responses
        headers: {
          'Cache-Control': 'no-store, max-age=0',
        },
      },
    )
  }
}
