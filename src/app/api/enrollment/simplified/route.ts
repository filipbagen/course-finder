import { NextResponse } from 'next/server';
import { prisma, withPrisma } from '@/lib/prisma';
import { getAuthenticatedUser, getOptionalUser } from '@/lib/auth';
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
import type { ApiResponse } from '@/types/api';

export const dynamic = 'force-dynamic';

/**
 * Simplified POST /api/enrollment/simplified
 * Optimized version with fewer database operations
 * Use this as a fallback if the main enrollment API is timing out
 */
export async function POST(
  request: Request
): Promise<NextResponse<ApiResponse<{ enrollment: any }>>> {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] Starting simplified enrollment creation`);

  try {
    // Get user with optional fallback - prevents auth failures
    let user;
    try {
      user = await getAuthenticatedUser();
    } catch (authError) {
      console.error(`[${requestId}] Auth error, trying fallback:`, authError);

      // Try to get user without throwing
      user = await getOptionalUser();

      // If still no user, return unauthorized
      if (!user) {
        console.error(`[${requestId}] Authentication failed:`, authError);
        return unauthorized('Authentication required');
      }
    }

    console.log(
      `[${requestId}] User authenticated: ${user.id.substring(0, 6)}...`
    );

    // Parse and validate request body
    let body;
    try {
      body = await request.json();
    } catch (parseError) {
      console.error(`[${requestId}] Failed to parse request body:`, parseError);
      return badRequest('Invalid JSON in request body');
    }

    const validation = enrollmentCreateSchema.safeParse(body);

    if (!validation.success) {
      console.error(
        `[${requestId}] Validation failed:`,
        validation.error.errors
      );
      return badRequest('Invalid request data', validation.error.errors);
    }

    const { courseId, semester } = validation.data;

    console.log(
      `[${requestId}] Creating enrollment for course ${courseId} in semester ${semester}`
    );

    // Use enhanced withPrisma with minimal operations and strict timeouts
    const result = await withPrisma(
      async (prismaClient) => {
        try {
          // Check if enrollment already exists (combined query)
          const existingEnrollment = await prismaClient.enrollment.findFirst({
            where: {
              userId: user.id,
              courseId: courseId,
            },
          });

          if (existingEnrollment) {
            // If it exists but with a different semester, update it
            if (existingEnrollment.semester !== semester) {
              console.log(
                `[${requestId}] Updating existing enrollment ${existingEnrollment.id}`
              );

              const updatedEnrollment = await prismaClient.enrollment.update({
                where: { id: existingEnrollment.id },
                data: { semester: semester },
              });

              return { updated: true, enrollment: updatedEnrollment };
            }

            // If it exists with the same semester, return it
            console.log(`[${requestId}] Enrollment already exists`);
            return { exists: true, enrollment: existingEnrollment };
          }

          // Fast path: Create new enrollment without additional checks
          console.log(`[${requestId}] Creating new enrollment`);
          const enrollment = await prismaClient.enrollment.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              courseId: courseId,
              semester: semester,
            },
          });

          return { created: true, enrollment };
        } catch (dbError) {
          // Detailed error logging
          console.error(`[${requestId}] Database operation failed:`, dbError);
          throw dbError;
        }
      },
      {
        // Higher retries but faster timeouts for better reliability
        maxRetries: 3,
      }
    );

    console.log(
      `[${requestId}] Enrollment operation completed:`,
      result.created ? 'created' : result.updated ? 'updated' : 'exists'
    );

    // Add cache control headers to prevent stale data
    const response = createSuccessResponse({ enrollment: result.enrollment });
    response.headers.set(
      'Cache-Control',
      'no-cache, no-store, must-revalidate'
    );
    response.headers.set('X-Request-ID', requestId);

    return response;
  } catch (error) {
    console.error(`[${requestId}] Failed to create enrollment:`, error);

    const errorResponse = internalServerError(
      `Failed to create enrollment. Please try again. (Ref: ${requestId})`
    );

    // Add request ID to the response for tracking
    errorResponse.headers.set('X-Request-ID', requestId);

    return errorResponse;
  }
}

/**
 * Simplified GET /api/enrollment/simplified
 * Optimized version with fewer database operations
 */
export async function GET(
  request: Request
): Promise<NextResponse<ApiResponse<{ courses: any[] }>>> {
  const requestId = Math.random().toString(36).substring(2, 10);
  console.log(`[${requestId}] Starting simplified enrollment fetch`);

  try {
    // Get user with optional fallback - prevents auth failures
    let user;
    try {
      user = await getAuthenticatedUser();
    } catch (authError) {
      console.error(`[${requestId}] Auth error, trying fallback:`, authError);

      // Try to get user without throwing
      user = await getOptionalUser();

      // If still no user, return empty list instead of error
      if (!user) {
        console.warn(
          `[${requestId}] No authenticated user, returning empty list`
        );
        return createSuccessResponse({ courses: [] });
      }
    }

    const url = new URL(request.url);
    const userId = url.searchParams.get('userId') || user.id;

    console.log(
      `[${requestId}] Fetching enrollments for user: ${userId.substring(
        0,
        6
      )}...`
    );

    // Use simpler query approach with better error handling
    try {
      // Direct query without transformation to minimize complexity
      const enrollments = await prisma.enrollment.findMany({
        where: { userId },
        include: {
          course: true,
        },
      });

      console.log(`[${requestId}] Found ${enrollments.length} enrollments`);

      // Simple transformation to expected format
      const courses = enrollments.map((enrollment) => ({
        ...enrollment.course,
        enrollment: {
          id: enrollment.id,
          semester: enrollment.semester,
        },
      }));

      // Add cache control headers
      const response = createSuccessResponse({ courses });
      response.headers.set(
        'Cache-Control',
        'private, max-age=30, stale-while-revalidate=60'
      );
      response.headers.set('X-Request-ID', requestId);

      return response;
    } catch (dbError) {
      console.error(`[${requestId}] Database error:`, dbError);
      throw dbError;
    }
  } catch (error) {
    console.error(`[${requestId}] Failed to fetch enrollments:`, error);

    // Generate a user-friendly error
    const errorResponse = internalServerError(
      `Failed to fetch enrollments. Please try again. (Ref: ${requestId})`
    );

    errorResponse.headers.set('X-Request-ID', requestId);

    return errorResponse;
  }
}
