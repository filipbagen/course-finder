import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
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
 * DELETE /api/schedule/course/:enrollmentId
 * Remove a course from the schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { enrollmentId: string } }
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await getAuthenticatedUser();
    const enrollmentId = params.enrollmentId;

    if (!enrollmentId) {
      return badRequest('Enrollment ID is required');
    }

    console.log('API: Removing enrollment with ID:', enrollmentId);

    // Use withPrisma wrapper for better database connection handling
    const result = await withPrisma(async (prismaClient) => {
      // Find the enrollment to delete
      const enrollment = await prismaClient.enrollment.findFirst({
        where: {
          id: enrollmentId,
          userId: user.id,
        },
        include: {
          course: true,
        },
      });

      if (!enrollment) {
        return {
          notFound: true,
          message: 'Enrollment not found or access denied',
        };
      }

      // Delete the enrollment
      await prismaClient.enrollment.delete({
        where: {
          id: enrollmentId,
        },
      });

      return {
        success: true,
        data: {
          enrollmentId,
          courseId: enrollment.courseId,
          semester: enrollment.semester,
          courseName: enrollment.course.name,
        },
      };
    });

    if (result.notFound) {
      return notFound(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse(result.data);
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error removing course from schedule:', error);

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Schedule remove error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to remove course from schedule. Please try again. (Ref: ${errorRef})`
    );
  }
}

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

        // Update the enrollment with semester
        const updatedEnrollment = await prismaClient.enrollment.update({
          where: {
            id: enrollment.id,
          },
          data: {
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

        // Create the final response with the period data explicitly included
        // Period isn't stored in database but is needed for UI state management
        return {
          success: true,
          course: {
            ...transformedCourse,
            enrollment: {
              id: updatedEnrollment.id,
              semester: updatedEnrollment.semester,
              userId: updatedEnrollment.userId,
              courseId: updatedEnrollment.courseId,
              period: period, // Include the period explicitly
            },
          },
        };
      },
      {
        // More aggressive retry pattern for schedule operations
      }
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    if (result.conflict) {
      return conflict(result.message);
    }

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
    const { courseId, semester } = validatedData;

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

        return {
          success: true,
          course: {
            ...transformedCourse,
            enrollment: {
              id: enrollment.id,
              semester: enrollment.semester,
              userId: enrollment.userId,
              courseId: enrollment.courseId,
            },
          },
        };
      },
      {
        // More aggressive retry pattern for schedule operations
      }
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    if (result.conflict) {
      return conflict(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse(result.course);
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

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
