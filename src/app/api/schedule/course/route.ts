import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
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

/**
 * PUT /api/schedule/course
 * Update course placement in schedule
 */
export async function PUT(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validatedData = validateRequest(body, UpdateScheduleSchema);
    const { courseId, semester } = validatedData;

    // Find the enrollment to update
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId: courseId,
      },
    });

    if (!enrollment) {
      return notFound('Enrollment not found for this course');
    }

    // Update the enrollment
    const updatedEnrollment = await prisma.enrollment.update({
      where: {
        id: enrollment.id,
      },
      data: {
        semester,
      },
    });

    // Fetch the course separately
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return notFound('Course not found');
    }

    // Transform the course
    const transformedCourse = transformCourse(course);

    // Create the response with enrollment data
    return createSuccessResponse({
      ...transformedCourse,
      enrollment: {
        id: updatedEnrollment.id,
        semester: updatedEnrollment.semester,
        userId: updatedEnrollment.userId,
        courseId: updatedEnrollment.courseId,
      },
    });
  } catch (error) {
    console.error('Error updating course schedule:', error);
    return internalServerError('Failed to update course schedule');
  }
}

/**
 * POST /api/schedule/course
 * Add course to schedule
 */
export async function POST(
  request: NextRequest
): Promise<NextResponse<ApiResponse<any>>> {
  try {
    const user = await getAuthenticatedUser();

    const body = await request.json();
    const validatedData = validateRequest(body, UpdateScheduleSchema);
    const { courseId, semester } = validatedData;

    // Check if enrollment already exists
    const existingEnrollment = await prisma.enrollment.findFirst({
      where: {
        userId: user.id,
        courseId,
        semester,
      },
    });

    if (existingEnrollment) {
      return conflict('Already enrolled in this course for this semester');
    }

    // Create new enrollment
    const enrollment = await prisma.enrollment.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        courseId,
        semester,
      },
    });

    // Fetch the course separately
    const course = await prisma.course.findUnique({
      where: {
        id: courseId,
      },
    });

    if (!course) {
      return notFound('Course not found');
    }

    // Transform the course
    const transformedCourse = transformCourse(course);

    // Create the response with enrollment data
    return createSuccessResponse({
      ...transformedCourse,
      enrollment: {
        id: enrollment.id,
        semester: enrollment.semester,
        userId: enrollment.userId,
        courseId: enrollment.courseId,
      },
    });
  } catch (error) {
    console.error('Error adding course to schedule:', error);
    return internalServerError('Failed to add course to schedule');
  }
}
