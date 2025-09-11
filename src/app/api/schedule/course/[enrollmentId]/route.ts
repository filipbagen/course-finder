import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createSuccessResponse,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/errors';
import type { ApiResponse } from '@/types/api';

/**
 * DELETE /api/schedule/course/[enrollmentId]
 * Remove course from schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  try {
    const { enrollmentId } = await params;

    const user = await getAuthenticatedUser();

    if (!enrollmentId) {
      return badRequest('Enrollment ID is required');
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(enrollmentId)) {
      console.log('Invalid UUID format:', enrollmentId);
      return badRequest('Invalid enrollment ID format');
    }

    // First check if enrollment exists at all
    const enrollmentExists = await prisma.enrollment.findUnique({
      where: { id: enrollmentId },
    });
    console.log('Enrollment exists in database:', !!enrollmentExists);
    if (enrollmentExists) {
      console.log('Enrollment userId:', enrollmentExists.userId);
      console.log('Authenticated userId:', user.id);
      console.log('User IDs match:', enrollmentExists.userId === user.id);
    }

    // Verify enrollment belongs to the user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: user.id,
      },
    });

    console.log('Found enrollment for user:', !!enrollment);

    if (!enrollment) {
      console.log(
        'Enrollment not found for user:',
        user.id,
        'enrollmentId:',
        enrollmentId
      );
      return notFound('Enrollment not found');
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return createSuccessResponse({ success: true });
  } catch (error) {
    console.error('Error removing course from schedule:', error);
    return internalServerError('Failed to remove course from schedule');
  }
}
