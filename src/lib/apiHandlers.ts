import { NextRequest, NextResponse } from 'next/server';
import { handleApiError } from '@/lib/errors';
import { ApiResponse } from '@/types/api';
import { getAuthenticatedUser as authUser } from '@/lib/auth';

/**
 * A higher-order function that wraps API route handlers with consistent error handling
 *
 * @param handler The API route handler function
 * @returns A wrapped function with error handling
 */
export function withApiErrorHandling<T>(
  handler: (
    request: NextRequest,
    ...args: any[]
  ) => Promise<NextResponse<ApiResponse<T>>>
) {
  return async (request: NextRequest, ...args: any[]) => {
    try {
      return await handler(request, ...args);
    } catch (error) {
      return handleApiError(error);
    }
  };
}

/**
 * Reusable route guard for authenticated endpoints
 * Combines authentication check with error handling
 */
export function createProtectedRouteHandler<T>(
  handler: (
    request: NextRequest,
    user: { id: string; email: string },
    ...args: any[]
  ) => Promise<NextResponse<ApiResponse<T>>>
) {
  return withApiErrorHandling(async (request: NextRequest, ...args: any[]) => {
    // Use the imported auth function
    const user = await authUser();
    return handler(request, user, ...args);
  });
}
