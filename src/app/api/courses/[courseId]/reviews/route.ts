import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getOptionalUser } from '@/lib/auth';
import { ApiResponse } from '@/types/api';

const prisma = new PrismaClient();

// GET /api/courses/{courseId}/reviews - Get all reviews for a course
export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
) {
  try {
    // Authentication is optional for viewing reviews
    await getOptionalUser();

    const courseId = params.courseId;

    if (!courseId) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course ID is required',
        },
        { status: 400 }
      );
    }

    // Verify the course exists
    const course = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      return NextResponse.json(
        {
          success: false,
          error: 'Course not found',
        },
        { status: 404 }
      );
    }

    // Get reviews for the course
    const reviews = await prisma.review.findMany({
      where: { courseId },
      include: {
        User: {
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

    // Calculate average rating
    const averageRating = reviews.length
      ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
      : 0;

    const response: ApiResponse<{
      reviews: typeof reviews;
      averageRating: number;
    }> = {
      success: true,
      data: {
        reviews,
        averageRating: parseFloat(averageRating.toFixed(1)),
      },
    };

    return NextResponse.json(response);
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
