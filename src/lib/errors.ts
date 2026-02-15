import { NextResponse } from 'next/server'
import { ApiResponse, ApiErrorCode, HttpStatus } from '@/types/api'

/**
 * Custom error class for application-specific errors
 */
export class AppError extends Error {
  public readonly code: string
  public readonly statusCode: number
  public readonly details?: unknown

  constructor(
    message: string,
    code: string = ApiErrorCode.INTERNAL_ERROR,
    statusCode: number = HttpStatus.INTERNAL_SERVER_ERROR,
    details?: unknown,
  ) {
    super(message)
    this.name = 'AppError'
    this.code = code
    this.statusCode = statusCode
    this.details = details

    // Ensure the stack trace points to where the error was thrown
    Error.captureStackTrace(this, this.constructor)
  }
}

/**
 * Predefined error creators for common scenarios
 */
export const createError = {
  unauthorized: (message = 'Unauthorized') =>
    new AppError(message, ApiErrorCode.UNAUTHORIZED, HttpStatus.UNAUTHORIZED),

  forbidden: (message = 'Forbidden') =>
    new AppError(message, ApiErrorCode.FORBIDDEN, HttpStatus.FORBIDDEN),

  notFound: (message = 'Resource not found') =>
    new AppError(message, ApiErrorCode.NOT_FOUND, HttpStatus.NOT_FOUND),

  badRequest: (message = 'Bad request', details?: unknown) =>
    new AppError(
      message,
      ApiErrorCode.BAD_REQUEST,
      HttpStatus.BAD_REQUEST,
      details,
    ),

  conflict: (message = 'Conflict') =>
    new AppError(message, ApiErrorCode.CONFLICT, HttpStatus.CONFLICT),

  validation: (message = 'Validation error', details?: unknown) =>
    new AppError(
      message,
      ApiErrorCode.VALIDATION_ERROR,
      HttpStatus.BAD_REQUEST,
      details,
    ),

  internal: (message = 'Internal server error', details?: unknown) =>
    new AppError(
      message,
      ApiErrorCode.INTERNAL_ERROR,
      HttpStatus.INTERNAL_SERVER_ERROR,
      details,
    ),
}

/**
 * Handle and format errors consistently across all API routes
 */
export function handleApiError(error: unknown): NextResponse<ApiResponse> {
  console.error('API Error:', error)

  if (error instanceof AppError) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        data: null,
      } as ApiResponse,
      { status: error.statusCode },
    )
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string }

    switch (prismaError.code) {
      case 'P2002':
        return NextResponse.json(
          {
            success: false,
            error: 'A record with this information already exists',
            data: null,
          } as ApiResponse,
          { status: HttpStatus.CONFLICT },
        )
      case 'P2025':
        return NextResponse.json(
          {
            success: false,
            error: 'Record not found',
            data: null,
          } as ApiResponse,
          { status: HttpStatus.NOT_FOUND },
        )
      default:
        return NextResponse.json(
          {
            success: false,
            error: 'Database error occurred',
            data: null,
          } as ApiResponse,
          { status: HttpStatus.INTERNAL_SERVER_ERROR },
        )
    }
  }

  // Handle unknown errors
  const message =
    error instanceof Error ? error.message : 'An unexpected error occurred'

  return NextResponse.json(
    {
      success: false,
      error: message,
      data: null,
    } as ApiResponse,
    { status: HttpStatus.INTERNAL_SERVER_ERROR },
  )
}

/**
 * Create success response
 */
export function createSuccessResponse<T>(
  data: T,
  message?: string,
  status: number = HttpStatus.OK,
): NextResponse<ApiResponse<T>> {
  return NextResponse.json(
    {
      success: true,
      data,
      message,
    } as ApiResponse<T>,
    { status },
  )
}

/**
 * Async error handler wrapper for API routes
 */
export function withErrorHandler<T extends unknown[], R>(
  handler: (...args: T) => Promise<R>,
) {
  return async (...args: T): Promise<R | NextResponse<ApiResponse>> => {
    try {
      return await handler(...args)
    } catch (error) {
      return handleApiError(error)
    }
  }
}

/**
 * Validate required fields in request body
 */
export function validateRequiredFields(
  body: Record<string, unknown>,
  requiredFields: string[],
): void {
  const missingFields = requiredFields.filter(
    (field) =>
      body[field] === undefined || body[field] === null || body[field] === '',
  )

  if (missingFields.length > 0) {
    throw createError.badRequest(
      `Missing required fields: ${missingFields.join(', ')}`,
      { missingFields },
    )
  }
}

/**
 * Shorthand error response creators
 */
export const unauthorized = (message?: string) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Unauthorized',
      data: null,
    } as ApiResponse,
    { status: HttpStatus.UNAUTHORIZED },
  )

export const forbidden = (message?: string) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Forbidden',
      data: null,
    } as ApiResponse,
    { status: HttpStatus.FORBIDDEN },
  )

export const notFound = (message?: string) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Not found',
      data: null,
    } as ApiResponse,
    { status: HttpStatus.NOT_FOUND },
  )

export const badRequest = (message?: string, details?: unknown) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Bad request',
      data: details,
    } as ApiResponse,
    { status: HttpStatus.BAD_REQUEST },
  )

export const conflict = (message?: string) =>
  NextResponse.json(
    { success: false, error: message || 'Conflict', data: null } as ApiResponse,
    { status: HttpStatus.CONFLICT },
  )

export const internalServerError = (message?: string) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Internal server error',
      data: null,
    } as ApiResponse,
    { status: HttpStatus.INTERNAL_SERVER_ERROR },
  )

/**
 * Create infinite error response
 */
export const infiniteError = (message?: string, errorRef?: string) =>
  NextResponse.json(
    {
      success: false,
      error: message || 'Internal server error',
      ref: errorRef,
      data: [],
      hasNextPage: false,
      count: 0,
    },
    { status: HttpStatus.INTERNAL_SERVER_ERROR },
  )
