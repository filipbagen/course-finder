import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createSuccessResponse,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/errors';
import type { ApiResponse } from '@/types/api';

export async function POST(
  request: Request
): Promise<
  NextResponse<ApiResponse<{ hasConflict: boolean; conflictingCourse?: any }>>
> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const { courseId } = body;

    if (!courseId) {
      return badRequest('courseId is required');
    }

    // Get the course to check
    const courseToCheck = await prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!courseToCheck) {
      return notFound('Course not found');
    }

    // Get all user's enrolled courses
    const userEnrollments = await prisma.enrollment.findMany({
      where: { userId: user.id },
      include: { course: true },
    });

    // Check if any enrolled course conflicts with the course being checked
    const conflictingEnrollment = userEnrollments.find((enrollment) => {
      const enrolledCourse = enrollment.course;
      // Check if the course to check excludes the enrolled course
      if (
        courseToCheck.exclusions &&
        courseToCheck.exclusions.includes(enrolledCourse.code)
      ) {
        return true;
      }
      // Check if the enrolled course excludes the course to check
      if (
        enrolledCourse.exclusions &&
        enrolledCourse.exclusions.includes(courseToCheck.code)
      ) {
        return true;
      }
      return false;
    });

    if (conflictingEnrollment) {
      return createSuccessResponse({
        hasConflict: true,
        conflictingCourse: {
          id: conflictingEnrollment.course.id,
          code: conflictingEnrollment.course.code,
          name: conflictingEnrollment.course.name,
        },
      });
    }

    return createSuccessResponse({ hasConflict: false });
  } catch (error) {
    console.error('Failed to check course conflicts:', error);
    return internalServerError('Failed to check course conflicts');
  }
}
