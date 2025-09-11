import { NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createSuccessResponse,
  unauthorized,
  badRequest,
  conflict,
  notFound,
  internalServerError,
} from '@/lib/errors';
import {
  enrollmentCreateSchema,
  enrollmentUpdateSchema,
} from '@/lib/validation';
import { transformCourse } from '@/lib/transformers';
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * POST /api/enrollment
 * Add a course to the user's schedule
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ enrollment: any }>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validation = enrollmentCreateSchema.safeParse(body);

    if (!validation.success) {
      return badRequest('Invalid request data', validation.error.errors);
    }

    const { courseId, semester } = validation.data;

    // Use enhanced withPrisma for better connection handling
    const result = await withPrisma(
      async (prismaClient) => {
        // Check if enrollment already exists for this course and semester
        const existingEnrollment = await prismaClient.enrollment.findFirst({
          where: {
            userId: user.id,
            courseId: courseId,
            semester: semester,
          },
        });

        if (existingEnrollment) {
          return {
            conflict: true,
            message: 'Enrollment already exists for this course and semester',
          };
        }

        // Check if user is enrolled in this course in a different semester
        const existingCourseEnrollment =
          await prismaClient.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: courseId,
            },
          });

        if (existingCourseEnrollment) {
          // Update the existing enrollment with the new semester
          const updatedEnrollment = await prismaClient.enrollment.update({
            where: { id: existingCourseEnrollment.id },
            data: { semester: semester },
          });
          return { updated: true, enrollment: updatedEnrollment };
        }

        // Check for course exclusions
        const courseToEnroll = await prismaClient.course.findUnique({
          where: { id: courseId },
        });

        if (!courseToEnroll) {
          return { notFound: true, message: 'Course not found' };
        }

        // Create new enrollment
        const enrollment = await prismaClient.enrollment.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            courseId: courseId,
            semester: semester,
          },
        });

        return { created: true, enrollment };
      },
      {
        maxRetries: 4, // More retries for critical user operation
        initialBackoff: 100,
      }
    );

    if (result.conflict) {
      return conflict(result.message);
    }

    if (result.notFound) {
      return notFound(result.message);
    }

    // Add cache control headers for enrollments to prevent stale data
    const response = createSuccessResponse({ enrollment: result.enrollment });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Failed to create enrollment:', error);

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Enrollment creation error (ref: ${errorRef}):`, error);

    const errorResponse = internalServerError(
      'Failed to create enrollment. Please try again.'
    );

    // Add error reference to the response for tracking
    const errorResponseData = await errorResponse.json();
    errorResponseData.ref = errorRef;

    return NextResponse.json(errorResponseData, {
      status: errorResponse.status,
    });
  }
}

/**
 * GET /api/enrollment
 * Fetch the user's enrolled courses
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<{ courses: any[] }>>> {
  try {
    const user = await getAuthenticatedUser();

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    // Use enhanced withPrisma with caching
    const result = await withPrisma(
      async (prismaClient) => {
        // First get all enrollments
        const enrollments = await prismaClient.enrollment.findMany({
          where: {
            userId: userId,
          },
        });

        // If no enrollments, return early
        if (enrollments.length === 0) {
          return { courses: [] };
        }

        // Then get all courses for these enrollments
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);
        const courses = await prismaClient.course.findMany({
          where: {
            id: {
              in: courseIds,
            },
          },
        });

        // Transform and merge the data
        const coursesWithEnrollmentData = enrollments
          .map((enrollment) => {
            const course = courses.find((c) => c.id === enrollment.courseId);
            if (!course) return null;

            const transformedCourse = transformCourse(course);

            return {
              ...transformedCourse,
              enrollment: {
                id: enrollment.id,
                semester: enrollment.semester,
              },
            };
          })
          .filter(Boolean); // Remove any null entries

        return { courses: coursesWithEnrollmentData };
      },
      {
        // Enable caching for GET operations
        useCache: true,
        cacheKey: `enrollments-${userId}`,
        cacheTtl: 60, // 1 minute cache
      }
    );

    // Add cache control headers
    const response = createSuccessResponse({ courses: result.courses });
    response.headers.set(
      'Cache-Control',
      'private, max-age=60, stale-while-revalidate=120'
    );

    return response;
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);

    // Generate an error reference
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Enrollment fetch error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to fetch enrollments. Please try again. (Ref: ${errorRef})`
    );
  }
}

/**
 * DELETE /api/enrollment
 * Remove a course from the user's schedule
 */
export async function DELETE(
  request: Request
): Promise<NextResponse<ApiResponse<{ message: string }>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const { enrollmentId } = body;

    if (!enrollmentId) {
      return badRequest('enrollmentId is required');
    }

    // Use enhanced withPrisma for better error handling
    const result = await withPrisma(
      async (prismaClient) => {
        const existingEnrollment = await prismaClient.enrollment.findUnique({
          where: { id: enrollmentId },
        });

        if (!existingEnrollment || existingEnrollment.userId !== user.id) {
          return { notFound: true };
        }

        await prismaClient.enrollment.delete({
          where: { id: enrollmentId },
        });

        return { success: true };
      },
      {
        maxRetries: 3,
        initialBackoff: 150,
      }
    );

    if (result.notFound) {
      return notFound('Enrollment not found or access denied');
    }

    // Add cache control headers
    const response = createSuccessResponse({
      message: 'Enrollment deleted successfully',
    });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Failed to delete enrollment:', error);

    // Generate an error reference
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Enrollment deletion error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to delete enrollment. Please try again. (Ref: ${errorRef})`
    );
  }
}

/**
 * PATCH /api/enrollment
 * Update a course enrollment (move between semesters)
 */
export async function PATCH(
  request: Request
): Promise<NextResponse<ApiResponse<{ updatedEnrollment: any }>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validation = enrollmentUpdateSchema.safeParse(body);

    if (!validation.success) {
      return badRequest('Invalid request data', validation.error.errors);
    }

    const { enrollmentId, newSemester } = validation.data;

    // Use enhanced withPrisma with more retries for critical operations
    const result = await withPrisma(
      async (prismaClient) => {
        // Get the existing enrollment
        const existingEnrollment = await prismaClient.enrollment.findUnique({
          where: { id: enrollmentId },
        });

        if (!existingEnrollment || existingEnrollment.userId !== user.id) {
          return { notFound: true };
        }

        // Check for existing enrollment in the target semester
        const existingInTargetSemester =
          await prismaClient.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: existingEnrollment.courseId,
              semester: newSemester,
              id: { not: enrollmentId }, // Exclude the current enrollment
            },
          });

        // If already enrolled in target semester, return conflict
        if (existingInTargetSemester) {
          return {
            conflict: true,
            message: 'Course is already enrolled in the target semester',
          };
        }

        // Update the enrollment with the new semester
        const updatedEnrollment = await prismaClient.enrollment.update({
          where: { id: enrollmentId },
          data: {
            semester: newSemester,
          },
        });

        return { success: true, updatedEnrollment };
      },
      {
        maxRetries: 4, // More retries for critical user operation
        initialBackoff: 100,
      }
    );

    if (result.notFound) {
      return notFound('Enrollment not found or access denied');
    }

    if (result.conflict) {
      return conflict(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse({
      updatedEnrollment: result.updatedEnrollment,
    });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Failed to update enrollment:', error);

    // Generate an error reference
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Enrollment update error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to update enrollment. Please try again. (Ref: ${errorRef})`
    );
  }
}
