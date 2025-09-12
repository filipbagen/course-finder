import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { ApiResponse } from '@/types/api';
import { CreateReviewRequest } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import { prisma, withPrisma } from '@/lib/prisma';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

// POST /api/courses/review - Create or update a review
export async function POST(request: NextRequest) {
  // Generate a request ID for tracking
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${requestId}] Review submission started`);

  try {
    // Use a timeout promise to ensure we don't get stuck in auth
    const authUserPromise = getAuthenticatedUser();
    const timeoutPromise = new Promise((_, reject) =>
      setTimeout(() => reject(new Error('Auth timeout')), 2000)
    );

    const user = (await Promise.race([
      authUserPromise,
      timeoutPromise,
    ])) as Awaited<typeof authUserPromise>;
    const userId = user.id;

    console.log(
      `[${requestId}] Auth successful, user: ${userId.substring(0, 6)}...`
    );

    // Parse request with timeout protection
    const bodyPromise = request.json();
    const body: CreateReviewRequest = (await Promise.race([
      bodyPromise,
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request parsing timeout')), 1000)
      ),
    ])) as Awaited<typeof bodyPromise>;

    const { rating, comment, courseId } = body;

    if (!rating || !courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating and course ID are required',
          requestId,
        },
        { status: 400 }
      );
    }

    // Check if the rating is a valid number with up to one decimal place (0.5 increments)
    const ratingValue = parseFloat(rating.toString());
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
        { status: 400 }
      );
    }

    // Simplified database operations - using a dedicated transaction
    const result = await withPrisma(
      async (prismaClient) => {
        // Use a transaction to ensure atomicity and faster execution
        return await prismaClient.$transaction(
          async (tx) => {
            // Check if the user is already enrolled in this course - optimized query
            const enrollment = await tx.enrollment.findFirst({
              where: {
                userId,
                courseId,
              },
              select: { id: true }, // Only select what we need
            });

            if (!enrollment) {
              return {
                error: 'You can only review courses you are enrolled in',
                status: 403,
              };
            }

            // Check if user has already reviewed this course
            const existingReview = await tx.review.findUnique({
              where: {
                userId_courseId: {
                  userId,
                  courseId,
                },
              },
              select: { id: true }, // Minimize data transfer
            });

            let reviewResult;

            if (existingReview) {
              // Update existing review
              reviewResult = await tx.review.update({
                where: {
                  id: existingReview.id,
                },
                data: {
                  rating,
                  comment,
                  updatedAt: new Date(),
                },
                select: {
                  // Select only what we need
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                  updatedAt: true,
                  userId: true,
                  courseId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              });
            } else {
              // Create new review
              reviewResult = await tx.review.create({
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
                  // Select only what we need
                  id: true,
                  rating: true,
                  comment: true,
                  createdAt: true,
                  updatedAt: true,
                  userId: true,
                  courseId: true,
                  user: {
                    select: {
                      id: true,
                      name: true,
                      email: true,
                      image: true,
                    },
                  },
                },
              });
            }

            return { success: true, review: reviewResult };
          },
          {
            // Transaction options - aggressive timeout to prevent function timeout
            timeout: 3000, // 3 seconds max for the entire transaction
          }
        );
      },
      {
        maxRetries: 1, // Only retry once to avoid long waits
      }
    );

    // Handle custom error returned from withPrisma
    if (result.error) {
      console.log(`[${requestId}] Review submission error: ${result.error}`);
      return NextResponse.json(
        {
          success: false,
          error: result.error,
          requestId,
        },
        { status: result.status || 500 }
      );
    }

    // At this point, result.success is true and result.review is guaranteed to exist
    if (!result.review) {
      console.log(`[${requestId}] Review result missing review data`);
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create or update review',
          requestId,
        },
        { status: 500 }
      );
    }

    // Format review with User field for frontend compatibility
    const formattedReview = {
      ...result.review,
      User: result.review.user,
    };

    const response: ApiResponse<{ review: typeof formattedReview }> = {
      success: true,
      data: {
        review: formattedReview,
      },
      requestId,
    };

    // Create response with caching headers for API consistency
    const jsonResponse = NextResponse.json(response);
    jsonResponse.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    jsonResponse.headers.set('Pragma', 'no-cache');
    jsonResponse.headers.set('Expires', '0');

    console.log(`[${requestId}] Review submission successful`);
    return jsonResponse;
  } catch (error) {
    console.error(`[${requestId}] Error creating review:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create review';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        requestId,
      },
      { status: 500 }
    );
  }
}

// DELETE /api/courses/review?reviewId=xxx - Delete a review (only allowed for the review owner)
export async function DELETE(request: NextRequest) {
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${requestId}] Review deletion request started`);

  try {
    const user = await getAuthenticatedUser();
    const userId = user.id;

    const searchParams = request.nextUrl.searchParams;
    const reviewId = searchParams.get('reviewId');

    if (!reviewId) {
      console.log(`[${requestId}] Missing reviewId parameter`);
      return NextResponse.json(
        {
          success: false,
          error: 'Review ID is required',
        },
        { status: 400 }
      );
    }

    console.log(
      `[${requestId}] Deleting review ${reviewId} for user ${userId}`
    );

    // Use withPrisma with tighter timeout for review deletion
    const result = await withPrisma(
      async (prismaClient) => {
        // Check if the review exists and belongs to the user - use select to minimize data transfer
        const existingReview = await prismaClient.review.findFirst({
          where: {
            id: reviewId,
            userId,
          },
          select: { id: true }, // Only get the ID to verify existence
        });

        if (!existingReview) {
          console.log(`[${requestId}] Review not found or not owned by user`);
          return { notFound: true };
        }

        // Delete the review - optimized query
        await prismaClient.review.delete({
          where: {
            id: reviewId,
          },
        });

        console.log(`[${requestId}] Review deleted successfully`);
        return { success: true };
      },
      {
        maxRetries: 2, // Reduce retries for faster feedback
      }
    );

    if (result.notFound) {
      return NextResponse.json(
        {
          success: false,
          error: 'Review not found or not owned by user',
        },
        { status: 404 }
      );
    }

    // Add no-cache headers
    const response = NextResponse.json({
      success: true,
      message: 'Review deleted successfully',
      requestId,
    });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log(
      `[${requestId}] Review deletion request completed successfully`
    );
    return response;
  } catch (error) {
    console.error(`[${requestId}] Error deleting review:`, error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to delete review';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        requestId,
      },
      { status: 500 }
    );
  }
}
