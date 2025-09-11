import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth';
import { transformCourse } from '@/lib/transformers';

// Stale while revalidate caching for schedule
export const revalidate = 30; // Revalidate cache every 30 seconds

/**
 * GET /api/schedule
 * Fetch user's schedule data with enhanced reliability
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    // Get userId from query params for viewing other users' schedules
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Use target user ID if provided, otherwise use authenticated user
    const userId = targetUserId || authenticatedUser.id;
    
    // Create a cache key based on user ID
    const cacheKey = `schedule-${userId}`;

    // Use enhanced withPrisma wrapper with caching for better performance
    const result = await withPrisma(async (prismaClient) => {
      // First, fetch enrollments
      const enrollments = await prismaClient.enrollment.findMany({
        where: {
          userId: userId,
          // Filter for semesters 7, 8, 9 which are the focus of this schedule view
          semester: {
            in: [7, 8, 9],
          },
        },
        orderBy: [{ semester: 'asc' }],
      });

      // If no enrollments, return early to save an unnecessary query
      if (enrollments.length === 0) {
        return { enrollments: [], courses: [] };
      }

      // Get all course IDs from enrollments
      const courseIds = enrollments.map((enrollment) => enrollment.courseId);

      // Fetch courses separately
      const courses = await prismaClient.course.findMany({
        where: {
          id: {
            in: courseIds,
          },
        },
      });

      return { enrollments, courses };
    }, {
      // Enable caching for this operation with a 1 minute TTL
      useCache: true,
      cacheKey,
      cacheTtl: 60,
      // More aggressive retry pattern for schedule which is critical functionality
      maxRetries: 4,
      initialBackoff: 100,
    });

    // Transform courses
    const transformedCourses = result.courses.map((course) =>
      transformCourse(course)
    );

    // Match enrollments with courses
    const enrollmentsWithCourses = result.enrollments
      .map((enrollment) => {
        const course = transformedCourses.find(
          (c) => c?.id === enrollment.courseId
        );

        return {
          id: enrollment.id,
          semester: enrollment.semester,
          // Use period 1 as default since we don't have it in the schema
          period: 1,
          // Default values for backward compatibility
          status: 'enrolled',
          grade: null,
          enrolledAt: new Date(),
          course: course || null,
        };
      })
      .filter((item) => item.course !== null);

    // Create a response with proper cache headers
    const response = createSuccessResponse(
      { enrollments: enrollmentsWithCourses },
      'Schedule fetched successfully'
    );

    // Set caching headers for browsers and CDNs
    if (response instanceof NextResponse) {
      response.headers.set(
        'Cache-Control',
        'public, s-maxage=30, stale-while-revalidate=300'
      );
    }

    return response;
  } catch (error) {
    // Include a random error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Schedule error reference: ${errorRef}`, error);
    
    const errorResponse = handleApiError(error);
    
    // Add the error reference to the response
    if (errorResponse instanceof NextResponse) {
      const body = await errorResponse.json();
      body.ref = errorRef;
      
      // Create a new response with the modified body and same status
      const newResponse = NextResponse.json(body, { 
        status: errorResponse.status,
        headers: {
          // No caching for error responses
          'Cache-Control': 'no-store'
        }
      });
      
      return newResponse;
    }
    
    return errorResponse;
  }
}
