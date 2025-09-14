import { NextRequest, NextResponse } from 'next/server';
import { withPrisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';
import {
  createSuccessResponse,
  badRequest,
  notFound,
  internalServerError,
} from '@/lib/errors';
import type { ApiResponse } from '@/types/api';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    // In Next.js 15, params is now a Promise that needs to be awaited
    const { enrollmentId } = await params;
    const user = await getAuthenticatedUser();

    if (!enrollmentId) {
      return badRequest('Enrollment ID is required');
    }

    // Use withPrisma wrapper for better database connection handling
    const result = await withPrisma(async (prismaClient) => {
      // Check if enrollment exists and belongs to user
      const enrollmentExists = await prismaClient.enrollment.findFirst({
        where: {
          id: enrollmentId,
          userId: user.id,
        },
        select: { id: true },
      });

      if (!enrollmentExists) {
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
    });

    if (result.notFound) {
      return notFound(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse({
      success: true,
      enrollmentId: enrollmentId, // Return the enrollment ID for client-side processing
      data: { success: true, enrollmentId: enrollmentId }, // Include data property for consistent API response
    });

    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    return response;
  } catch (error) {
    console.error('Error removing course from schedule:', error);
    return internalServerError(
      `Failed to remove course from schedule. Please try again.`
    );
  }
}
