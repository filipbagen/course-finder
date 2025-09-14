import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth';
import { transformCourse } from '@/lib/transformers';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

// Stale while revalidate caching for schedule
export const revalidate = 30; // Revalidate cache every 30 seconds

/**
 * GET /api/schedule
 * Fetch user's schedule data with enhanced reliability
 */
export async function GET(request: NextRequest) {
  // Create a request ID for tracing this specific request in logs
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`Schedule API request started (${requestId})`);

  try {
    const authenticatedUser = await getAuthenticatedUser();
    console.log(`User authenticated: ${authenticatedUser.id} (${requestId})`);

    // Get userId from query params for viewing other users' schedules
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Use target user ID if provided, otherwise use authenticated user
    const userId = targetUserId || authenticatedUser.id;
    console.log(`Using userId: ${userId} (${requestId})`);

    // Create a cache key based on user ID
    const cacheKey = `schedule-${userId}`;

    // Use enhanced withPrisma wrapper with caching for better performance
    const result = await withPrisma(
      async (prismaClient) => {
        console.log(`withPrisma callback started (${requestId})`);

        // First, fetch enrollments
        console.log(
          `Fetching enrollments for userId: ${userId} (${requestId})`
        );
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

        console.log(`Found ${enrollments.length} enrollments (${requestId})`);

        // If no enrollments, return early to save an unnecessary query
        if (enrollments.length === 0) {
          console.log(`No enrollments found, returning early (${requestId})`);
          return { enrollments: [], courses: [] };
        }

        // Get all course IDs from enrollments
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);
        console.log(`Fetching ${courseIds.length} courses (${requestId})`);

        // Fetch courses separately
        const courses = await prismaClient.course.findMany({
          where: {
            id: {
              in: courseIds,
            },
          },
        });

        console.log(`Found ${courses.length} courses (${requestId})`);

        return { enrollments, courses };
      },
      {
        // Enable caching for this operation with a 1 minute TTL
        useCache: true,
        cacheKey,
        cacheTtl: 60,
      }
    );

    console.log(`withPrisma operation completed (${requestId})`);

    // Transform courses
    const transformedCourses = result.courses.map((course) =>
      transformCourse(course)
    );

    console.log(
      `Transformed ${transformedCourses.length} courses (${requestId})`
    );

    // Match enrollments with courses
    const enrollmentsWithCourses = result.enrollments
      .map((enrollment) => {
        const course = transformedCourses.find(
          (c) => c?.id === enrollment.courseId
        );

        if (!course) {
          console.warn(`Course not found for enrollment ${enrollment.id}`);
          return null;
        }

        // Use the course's actual period data instead of hardcoding period 1
        const coursePeriod =
          course.period && Array.isArray(course.period) ? course.period : [1]; // Default to period 1 if undefined

        return {
          id: enrollment.id,
          semester: enrollment.semester,
          // Use the course's period data - this is crucial for correct placement
          period: coursePeriod,
          userId: enrollment.userId,
          courseId: enrollment.courseId,
          status: 'enrolled',
          grade: null,
          enrolledAt: new Date(),
          course: course,
        };
      })
      .filter((item) => item !== null);

    console.log(
      `Matched ${enrollmentsWithCourses.length} enrollments with courses (${requestId})`
    );

    // Create a response with proper cache headers
    const response = createSuccessResponse(
      {
        enrollments: enrollmentsWithCourses,
        requestId, // Include request ID for client-side debugging
      },
      'Schedule fetched successfully'
    );

    // Set caching headers for browsers and CDNs
    if (response instanceof NextResponse) {
      response.headers.set('Cache-Control', 'no-cache, private');
    }

    console.log(`Schedule API request completed successfully (${requestId})`);

    return response;
  } catch (error) {
    // Include a random error reference for tracking
    console.error(`Schedule error reference: ${requestId}`, error);

    // Add more detailed error information
    let errorDetails = '';
    if (error instanceof Error) {
      errorDetails = error.message;
      console.error(`Error message: ${error.message}`);
      console.error(`Error stack: ${error.stack}`);
    }

    // Create a detailed error response with debugging information
    const errorResponse = NextResponse.json(
      {
        success: false,
        message: 'Failed to fetch schedule',
        error: errorDetails || 'Unknown error',
        ref: requestId,
        timestamp: new Date().toISOString(),
      },
      {
        status: 500,
        headers: {
          // No caching for error responses
          'Cache-Control': 'no-store',
        },
      }
    );

    return errorResponse;
  }
}
