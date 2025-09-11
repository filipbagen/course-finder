import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth';
import { ScheduleResponse } from '@/types/types';
import { transformCourse } from '@/lib/transformers';

/**
 * GET /api/schedule
 * Fetch user's schedule data
 */
export async function GET(request: NextRequest) {
  try {
    const authenticatedUser = await getAuthenticatedUser();

    // Get userId from query params for viewing other users' schedules
    const { searchParams } = new URL(request.url);
    const targetUserId = searchParams.get('userId');

    // Use target user ID if provided, otherwise use authenticated user
    const userId = targetUserId || authenticatedUser.id;

    // Use withPrisma wrapper for better database connection handling
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
    });

    // Transform courses
    const transformedCourses = result.courses.map((course) => transformCourse(course));

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

    return createSuccessResponse(
      { enrollments: enrollmentsWithCourses },
      'Schedule fetched successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
