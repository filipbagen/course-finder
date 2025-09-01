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
import { Prisma } from '@prisma/client';
import { randomUUID } from 'crypto';
import type { ApiResponse } from '@/types/api';

// Type for enrollment with course included
type EnrollmentWithCourse = Prisma.EnrollmentGetPayload<{
  include: {
    course: {
      include: {
        examinations: true;
      };
    };
  };
}>;

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
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
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
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
      },
    });

    return createSuccessResponse({
      id: updatedEnrollment.course.id,
      code: updatedEnrollment.course.code,
      name: updatedEnrollment.course.name,
      content: updatedEnrollment.course.content,
      credits: updatedEnrollment.course.credits,
      scheduledHours: updatedEnrollment.course.scheduledHours,
      selfStudyHours: updatedEnrollment.course.selfStudyHours,
      mainFieldOfStudy: updatedEnrollment.course.mainFieldOfStudy,
      advanced: updatedEnrollment.course.advanced,
      semester: updatedEnrollment.course.semester,
      period: updatedEnrollment.course.period,
      block: updatedEnrollment.course.block,
      campus: updatedEnrollment.course.campus,
      exclusions: updatedEnrollment.course.exclusions,
      offeredFor: updatedEnrollment.course.offeredFor,
      prerequisites: updatedEnrollment.course.prerequisites,
      recommendedPrerequisites:
        updatedEnrollment.course.recommendedPrerequisites,
      learningOutcomes: updatedEnrollment.course.learningOutcomes,
      teachingMethods: updatedEnrollment.course.teachingMethods,
      examinations: updatedEnrollment.course.examinations,
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
    const enrollment = (await prisma.enrollment.create({
      data: {
        id: randomUUID(),
        userId: user.id,
        courseId,
        semester,
      },
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
      },
    })) as EnrollmentWithCourse;

    return createSuccessResponse({
      id: enrollment.course.id,
      code: enrollment.course.code,
      name: enrollment.course.name,
      content: enrollment.course.content,
      credits: enrollment.course.credits,
      scheduledHours: enrollment.course.scheduledHours,
      selfStudyHours: enrollment.course.selfStudyHours,
      mainFieldOfStudy: enrollment.course.mainFieldOfStudy,
      advanced: enrollment.course.advanced,
      semester: enrollment.course.semester,
      period: enrollment.course.period,
      block: enrollment.course.block,
      campus: enrollment.course.campus,
      exclusions: enrollment.course.exclusions,
      offeredFor: enrollment.course.offeredFor,
      prerequisites: enrollment.course.prerequisites,
      recommendedPrerequisites: enrollment.course.recommendedPrerequisites,
      learningOutcomes: enrollment.course.learningOutcomes,
      teachingMethods: enrollment.course.teachingMethods,
      examinations: enrollment.course.examinations,
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
