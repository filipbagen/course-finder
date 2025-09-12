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

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

/**
 * DELETE /api/schedule/course/[enrollmentId]
 * Remove course from schedule with enhanced error handling and connection reliability
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
): Promise<NextResponse<ApiResponse<{ success: boolean }>>> {
  // Generate a unique request ID for tracking in logs
  const requestId = Math.random().toString(36).substring(2, 8);
  console.log(`[${requestId}] Course removal request started`);

  try {
    const { enrollmentId } = await params;
    console.log(`[${requestId}] Removing enrollment: ${enrollmentId}`);

    const user = await getAuthenticatedUser();
    console.log(`[${requestId}] Authenticated user: ${user.id}`);

    if (!enrollmentId) {
      console.log(`[${requestId}] Error: Missing enrollment ID`);
      return badRequest('Enrollment ID is required');
    }

    // Validate UUID format
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(enrollmentId)) {
      console.log(`[${requestId}] Invalid UUID format: ${enrollmentId}`);
      return badRequest('Invalid enrollment ID format');
    }

    // Use withPrisma wrapper with stricter timeouts for Vercel serverless environment
    const result = await withPrisma(
      async (prismaClient) => {
        // First check if enrollment exists and belongs to user - do this in a single query
        const enrollmentExists = await prismaClient.enrollment.findFirst({
          where: {
            id: enrollmentId,
            userId: user.id,
          },
          select: { id: true }, // Only select ID to minimize data transfer
        });

        if (!enrollmentExists) {
          console.log(
            `[${requestId}] Enrollment not found or not owned by user ${user.id}`
          );
          return {
            notFound: true,
            message: 'Enrollment not found or access denied',
          };
        }

        console.log(`[${requestId}] Deleting enrollment ${enrollmentId}`);

        // Delete the enrollment
        await prismaClient.enrollment.delete({
          where: {
            id: enrollmentId,
          },
        });

        console.log(`[${requestId}] Enrollment deleted successfully`);
        return { success: true };
      },
      {
        // More aggressive retry pattern for critical operations
        maxRetries: 2, // Lower retries for faster feedback
      }
    );

    if (result.notFound) {
      return notFound(result.message);
    }

    // Add cache control headers
    const response = createSuccessResponse({
      success: true,
      requestId, // Include the request ID for correlation
    });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');

    console.log(`[${requestId}] Course removal request completed successfully`);
    return response;
  } catch (error) {
    console.error(`[${requestId}] Error removing course from schedule:`, error);

    return internalServerError(
      `Failed to remove course from schedule. Please try again. (Ref: ${requestId})`
    );
  }
}
