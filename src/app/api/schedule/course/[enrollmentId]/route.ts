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

    // Verify enrollment belongs to the user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: user.id,
      },
    });

    if (!enrollment) {
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
