import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

    // Check if enrollment already exists for this course and semester
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
        semester: semester,
      },
    });

    if (existingEnrollment) {
      return conflict('Enrollment already exists for this course and semester');
    }

    // Check if user is enrolled in this course in a different semester
    const existingCourseEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (existingCourseEnrollment) {
      // Update the existing enrollment with the new semester
      const updatedEnrollment = await prisma.enrollment.update({
        where: { id: existingCourseEnrollment.id },
        data: { semester: semester },
      });
      return createSuccessResponse({ enrollment: updatedEnrollment });
    }

    // Check for course exclusions
    const courseToEnroll = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!courseToEnroll) {
      return notFound('Course not found');
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        id: crypto.randomUUID(),
        userId: user.id,
        courseId: courseId,
        semester: semester,
      },
    });

    return createSuccessResponse({ enrollment });
  } catch (error) {
    console.error('Failed to create enrollment:', error);
    return internalServerError('Failed to create enrollment');
  }
}

export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<{ courses: any[] }>>> {
  try {
    const user = await getAuthenticatedUser();

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    // First get all enrollments
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
    });

    // Then get all courses for these enrollments
    const courseIds = enrollments.map((enrollment) => enrollment.courseId);
    const courses = await prisma.course.findMany({
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

    return createSuccessResponse({ courses: coursesWithEnrollmentData });
  } catch (error) {
    console.error('Failed to fetch enrollments:', error);
    return internalServerError('Failed to fetch enrollments');
  }
}

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

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment || existingEnrollment.userId !== user.id) {
      return notFound('Enrollment not found or access denied');
    }

    await prisma.enrollment.delete({
      where: { id: enrollmentId },
    });

    return createSuccessResponse({
      message: 'Enrollment deleted successfully',
    });
  } catch (error) {
    console.error('Failed to delete enrollment:', error);
    return internalServerError('Failed to delete enrollment');
  }
}

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

    const existingEnrollment = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });

    if (!existingEnrollment || existingEnrollment.userId !== user.id) {
      return notFound('Enrollment not found or access denied');
    }

    const updatedEnrollment = await prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        semester: newSemester,
      },
    });

    return createSuccessResponse({ updatedEnrollment });
  } catch (error) {
    console.error('Failed to update enrollment:', error);
    return internalServerError('Failed to update enrollment');
  }
}
