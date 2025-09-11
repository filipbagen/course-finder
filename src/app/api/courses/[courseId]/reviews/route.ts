import { NextRequest, NextResponse } from 'next/server';
import { getOptionalUser } from '@/lib/auth';
import { ApiResponse } from '@/types/api';
import { prisma, withPrisma } from '@/lib/prisma';

// Enable response caching for reviews
export const fetchCache = 'force-cache';

// GET /api/courses/{courseId}/reviews - Get all reviews for a course
export async function GET(
  request: NextRequest,
  context: { params: Promise<{ courseId: string }> }
) {
  try {
    // Authentication is optional for viewing reviews
    await getOptionalUser();

    // Access params safely - need to await in Next.js 15
    const params = await context.params;
    const courseId = params.courseId;

    // Debug logging
    console.log('Fetching reviews for courseId:', courseId);
    console.log('Database URL exists:', !!process.env.DATABASE_URL);
    console.log('Direct URL exists:', !!process.env.DIRECT_URL);

    // Verify the course exists and get reviews using withPrisma
    const result = await withPrisma(async (prisma) => {
      // First check if the course exists
      const course = await prisma.course.findUnique({
        where: { id: courseId },
      });

      if (!course) {
        return { notFound: true, reviews: [] };
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
      });

      return { course, reviews, notFound: false };
    });

    // Handle course not found
    if (result.notFound) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
        },
        { status: 404 }
      );
    }

    // Transform reviews to add User field for frontend compatibility
    const formattedReviews = result.reviews.map((review) => ({
      ...review,
      // Add User field with capitalized U for frontend consistency
      User: review.user,
    }));

    // Calculate average rating
    const averageRating = result.reviews.length
      ? result.reviews.reduce((sum, review) => sum + review.rating, 0) /
        result.reviews.length
      : 0;

    const response: ApiResponse<{
      reviews: typeof formattedReviews;
      averageRating: number;
    }> = {
      success: true,
      data: {
        reviews: formattedReviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    };

    // Create response with caching headers
    const jsonResponse = NextResponse.json(response);

    // Cache for 1 minute, stale-while-revalidate for 5 minutes
    jsonResponse.headers.set(
      'Cache-Control',
      'max-age=60, s-maxage=60, stale-while-revalidate=300'
    );

    return jsonResponse;
  } catch (error) {
    console.error('Error fetching reviews:', error);
    const errorMessage =
      error instanceof Error ? error.message : 'Failed to fetch reviews';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
      },
      { status: 500 }
    );
  }
}
