import { NextRequest, NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
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
 * Remove course from schedule with enhanced error handling and connection reliability
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

    // Use withPrisma wrapper for better database connection handling
    const result = await withPrisma(
      async (prismaClient) => {
        // First check if enrollment exists at all
        const enrollmentExists = await prismaClient.enrollment.findUnique({
          where: { id: enrollmentId },
        });

        if (!enrollmentExists) {
          return { notFound: true, message: 'Enrollment not found' };
        }

        // Verify enrollment belongs to the user
        if (enrollmentExists.userId !== user.id) {
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

        return { success: true };
      },
      {
        // More aggressive retry pattern for critical operations
        maxRetries: 4,
        initialBackoff: 100,
      }
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse({ success: true });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );

    return response;
  } catch (error) {
    console.error('Error removing course from schedule:', error);

    // Generate an error reference for tracking
    const errorRef = Math.random().toString(36).substring(2, 10);
    console.error(`Schedule remove course error (ref: ${errorRef}):`, error);

    return internalServerError(
      `Failed to remove course from schedule. Please try again. (Ref: ${errorRef})`
    );
  }
}
