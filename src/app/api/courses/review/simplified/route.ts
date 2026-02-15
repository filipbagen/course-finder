import { NextRequest, NextResponse } from 'next/server'
import { getAuthenticatedUser } from '@/lib/auth'
import { ApiResponse } from '@/types/api'
import { CreateReviewRequest } from '@/types/types'
import { v4 as uuidv4 } from 'uuid'
import { prisma } from '@/lib/prisma'

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic'

// POST /api/courses/review/simplified - Create or update a review with minimal operations
export async function POST(request: NextRequest) {
  // Generate a request ID for tracking
  const requestId = Math.random().toString(36).substring(2, 8)
  console.log(`[${requestId}] Simplified review submission started`)

  try {
    // Use a timeout promise to ensure we don't get stuck in auth
    const authUserPromise = getAuthenticatedUser()
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 2000),
    )

    const user = (await Promise.race([
      authUserPromise,
      timeoutPromise,
    ])) as Awaited<typeof authUserPromise>
    const userId = user.id

    console.log(
      `[${requestId}] Auth successful, user: ${userId.substring(0, 6)}...`,
    )

    // Parse request with timeout protection
    const bodyPromise = request.json()
    const body: CreateReviewRequest = (await Promise.race([
      bodyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request parsing timeout')), 1000),
      ),
    ])) as Awaited<typeof bodyPromise>

    const { rating, comment, courseId } = body

    if (!rating || !courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating and course ID are required',
          requestId,
        },
        { status: 400 },
      )
    }

    // Check if the rating is a valid number with up to one decimal place (0.5 increments)
    const ratingValue = parseFloat(rating.toString())
    if (
      isNaN(ratingValue) ||
      ratingValue < 1 ||
      ratingValue > 5 ||
      (ratingValue * 10) % 5 !== 0 // Ensures only 0.5 increments
    ) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating must be between 1 and 5 with 0.5 increments',
          requestId,
        },
        { status: 400 },
      )
    }

    // Simplified direct database access - avoiding extra queries
    try {
      // Direct query - more efficient than transactions in serverless
      const existingReview = await prisma.review.findFirst({
        where: {
          userId,
          courseId,
        },
        select: { id: true },
      })

      // Check enrollment in a separate optional query
      // Making this a "best effort" check to prevent timeouts
      let isEnrolled = true
      try {
        const enrollment = await prisma.enrollment.findFirst({
          where: {
            userId,
            courseId,
          },
          select: { id: true },
        })
        isEnrolled = !!enrollment
      } catch (err) {
        console.warn(
          `[${requestId}] Enrollment check failed, proceeding anyway:`,
          err,
        )
      }

      if (!isEnrolled) {
        return NextResponse.json(
          {
            success: false,
            error: 'You can only review courses you are enrolled in',
            requestId,
          },
          { status: 403 },
        )
      }

      let _result
      if (existingReview) {
        // Update existing review - minimal fields
        _result = await prisma.review.update({
          where: {
            id: existingReview.id,
          },
          data: {
            rating,
            comment,
            updatedAt: new Date(),
          },
          select: {
            id: true,
            rating: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      } else {
        // Create new review - minimal fields
        _result = await prisma.review.create({
          data: {
            id: uuidv4(),
            rating,
            comment,
            userId,
            courseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
          select: {
            id: true,
            rating: true,
            createdAt: true,
            updatedAt: true,
          },
        })
      }

      console.log(
        `[${requestId}] Review ${
          existingReview ? 'updated' : 'created'
        } successfully`,
      )

      // Simplified response - avoiding complex joins that might timeout
      const response: ApiResponse = {
        success: true,
        message: `Review ${
          existingReview ? 'updated' : 'created'
        } successfully`,
        requestId,
      }

      // Create response with caching headers for API consistency
      const jsonResponse = NextResponse.json(response)
      jsonResponse.headers.set(
        'Cache-Control',
        'no-cache, no-store, must-revalidate',
      )
      jsonResponse.headers.set('Pragma', 'no-cache')
      jsonResponse.headers.set('Expires', '0')

      return jsonResponse
    } catch (dbError) {
      console.error(`[${requestId}] Database operation failed:`, dbError)
      throw new Error('Database operation failed')
    }
  } catch (error) {
    console.error(`[${requestId}] Error creating review:`, error)
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create review'

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        requestId,
      },
      { status: 500 },
    )
  }
}
