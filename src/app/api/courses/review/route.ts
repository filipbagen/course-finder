import { NextRequest, NextResponse } from 'next/server';
import { getAuthenticatedUser } from '@/lib/auth';
import { ApiResponse } from '@/types/api';
import { CreateReviewRequest } from '@/types/types';
import { v4 as uuidv4 } from 'uuid';
import { prisma, withPrisma } from '@/lib/prisma';

// POST /api/courses/review - Create or update a review
export async function POST(request: NextRequest) {
  try {
    const user = await getAuthenticatedUser();
    const userId = user.id;

    const body: CreateReviewRequest = await request.json();
    const { rating, comment, courseId } = body;

    if (!rating || !courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Rating and course ID are required',
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
        },
        { status: 400 }
      );
    }

    // Use withPrisma wrapper for better connection handling
    const result = await withPrisma(async (prismaClient) => {
      // Check if the user is already enrolled in this course
      const enrollment = await prismaClient.enrollment.findFirst({
        where: {
          userId,
          courseId,
        },
      });

      if (!enrollment) {
        return {
          error: 'You can only review courses you are enrolled in',
          status: 403,
        };
      }

      // Check if user has already reviewed this course
      const existingReview = await prismaClient.review.findUnique({
        where: {
          userId_courseId: {
            userId,
            courseId,
          },
        },
      });

      let reviewResult;

      if (existingReview) {
        // Update existing review
        reviewResult = await prismaClient.review.update({
          where: {
            id: existingReview.id,
          },
          data: {
            rating,
            comment,
            updatedAt: new Date(),
          },
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
        });
      } else {
        // Create new review
        reviewResult = await prismaClient.review.create({
          data: {
            id: uuidv4(),
            rating,
            comment,
            userId,
            courseId,
            createdAt: new Date(),
            updatedAt: new Date(),
          },
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
        });
      }

      return { success: true, review: reviewResult };
    });

    // Handle custom error returned from withPrisma
    if (result.error) {
      return NextResponse.json(
        {
          success: false,
          error: result.error,
        },
        { status: result.status || 500 }
      );
    }

    // At this point, result.success is true and result.review is guaranteed to exist
    if (!result.review) {
      return NextResponse.json(
        {
          success: false,
          error: 'Failed to create or update review',
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
    };

    // Create response with caching headers for API consistency
    const jsonResponse = NextResponse.json(response);
    jsonResponse.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return jsonResponse;
  } catch (error) {
    console.error('Error creating review:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to create review';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
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
        initialBackoff: 100, // Start with 100ms
        maxBackoff: 1000, // Cap at 1 second
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
