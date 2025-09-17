import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma, clearUserCache } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createSuccessResponse,
  badRequest,
  notFound,
  conflict,
  internalServerError,
} from '@/lib/errors';
import { UpdateScheduleSchema, validateRequest } from '@/lib/validation';
import { randomUUID } from 'crypto';
import type { ApiResponse } from '@/types/api';
import { transformCourse } from '@/lib/transformers';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

/**
 * PUT /api/schedule/course
 * Update course placement in schedule with enhanced error handling
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validatedData = validateRequest(body, UpdateScheduleSchema);
    const { courseId, semester, period } = validatedData;

    console.log('API: Updating course schedule:', {
      courseId,
      semester,
      period,
    });

    // Use withPrisma wrapper for better database connection handling
    const result = await withPrisma(
      async (prismaClient) => {
        // Find the enrollment to update
        const enrollment = await prismaClient.enrollment.findFirst({
          where: {
            userId: user.id,
            courseId: courseId,
          },
        });

        if (!enrollment) {
          return {
            notFound: true,
            message: 'Enrollment not found for this course',
          };
        }

        // Check if enrollment already exists in the target semester
        const existingInTargetSemester =
          await prismaClient.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: courseId,
              semester: semester,
              id: { not: enrollment.id }, // Exclude the current enrollment
            },
          });

        if (existingInTargetSemester) {
          return {
            conflict: true,
            message: 'Already enrolled in this course for this semester',
          };
        }

        // Update the enrollment with the new semester
        const updatedEnrollment = await prismaClient.enrollment.update({
          where: {
            id: enrollment.id,
          },
          data: {
            semester: semester, // Update to the new semester
          },
          include: {
            course: true, // Include the course data directly
          },
        });

        if (!updatedEnrollment.course) {
          return { notFound: true, message: 'Course not found' };
        }

        // Transform the course
        const transformedCourse = transformCourse(updatedEnrollment.course);

        if (!transformedCourse) {
          return { notFound: true, message: 'Failed to transform course data' };
        }

        // Use the course's actual period data
        const coursePeriod =
          transformedCourse.period && Array.isArray(transformedCourse.period)
            ? transformedCourse.period
            : [1]; // Default to period 1 if undefined

        // Create the final response with the correct period data
        return {
          success: true,
          course: {
            ...transformedCourse,
            enrollment: {
              id: updatedEnrollment.id,
              semester: updatedEnrollment.semester,
              userId: updatedEnrollment.userId,
              courseId: updatedEnrollment.courseId,
              // Use the course's actual period data
              period: coursePeriod,
            },
          },
        };
      }
      // Removed caching options - schedule updates should always be fresh
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    if (result.conflict) {
      return conflict(result.message);
    }

    // Clear any cached schedule data for this user to ensure fresh data on next fetch
    clearUserCache(user.id);

    // Add cache control headers
    const response = createSuccessResponse(result.course);
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error updating course schedule:', error);

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Schedule update error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to update course schedule. Please try again. (Ref: ${errorRef})`
    );
  }
}

/**
 * POST /api/schedule/course
 * Add course to schedule with enhanced error handling
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validatedData = validateRequest(body, UpdateScheduleSchema);
    const { courseId, semester, period } = validatedData;

    // Use withPrisma wrapper for better database connection handling
    const result = await withPrisma(
      async (prismaClient) => {
        // Check if enrollment already exists
        const existingEnrollment = await prismaClient.enrollment.findFirst({
          where: {
            userId: user.id,
            courseId,
            semester,
          },
        });

        if (existingEnrollment) {
          return {
            conflict: true,
            message: 'Already enrolled in this course for this semester',
          };
        }

        // Create new enrollment
        const enrollment = await prismaClient.enrollment.create({
          data: {
            id: randomUUID(),
            userId: user.id,
            courseId,
            semester,
          },
        });

        // Fetch the course separately
        const course = await prismaClient.course.findUnique({
          where: {
            id: courseId,
          },
        });

        if (!course) {
          return { notFound: true, message: 'Course not found' };
        }

        // Transform the course
        const transformedCourse = transformCourse(course);

        if (!transformedCourse) {
          return { notFound: true, message: 'Failed to transform course data' };
        }

        // Use the course's actual period data
        const coursePeriod =
          transformedCourse.period && Array.isArray(transformedCourse.period)
            ? transformedCourse.period
            : [1]; // Default to period 1 if undefined

        return {
          success: true,
          course: {
            ...transformedCourse,
            enrollment: {
              id: enrollment.id,
              semester: enrollment.semester,
              userId: enrollment.userId,
              courseId: enrollment.courseId,
              // Use the course's actual period data
              period: coursePeriod,
            },
          },
        };
      }
      // Removed caching options - schedule updates should always be fresh
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    if (result.conflict) {
      return conflict(result.message);
    }

    // Clear any cached schedule data for this user to ensure fresh data on next fetch
    clearUserCache(user.id);

    // Add cache control headers
    const response = createSuccessResponse(result.course);
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error adding course to schedule:', error);

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Schedule add course error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to add course to schedule. Please try again. (Ref: ${errorRef})`
    );
  }
}
