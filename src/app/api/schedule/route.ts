import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { getAuthenticatedUser } from '@/lib/auth';
import { ScheduleResponse } from '@/types/types';

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

    // Fetch user's enrollments with course data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
        // Filter for semesters 7, 8, 9 which are the focus of this schedule view
        semester: {
          in: [7, 8, 9],
        },
      },
      include: {
        course: {
          include: {
            examinations: true,
          },
        },
      },
      orderBy: [{ semester: 'asc' }, { course: { name: 'asc' } }],
    });

    const scheduleData = {
      enrollments: enrollments.map((enrollment) => ({
        id: enrollment.id,
        semester: enrollment.semester,
        period: 1, // Default period since it's not in the schema
        status: 'enrolled', // Default status since it's not in the schema
        grade: null, // No grade field in schema
        enrolledAt: new Date(), // Default date since it's not in the schema
        course: {
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
        },
      })),
    };

    return createSuccessResponse(scheduleData, 'Schedule fetched successfully');
  } catch (error) {
    return handleApiError(error);
  }
}
