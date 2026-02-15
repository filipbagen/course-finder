import { z } from 'zod'
import { createError } from '@/lib/errors'

/**
 * Zod validation schemas for API requests
 */

export const CreateEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  semester: z.number().int().min(1, 'Semester must be a positive integer'),
})

export const enrollmentCreateSchema = CreateEnrollmentSchema

export const enrollmentUpdateSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  newSemester: z.number().int().min(1, 'Semester must be a positive integer'),
})

export const UpdateScheduleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  semester: z.number().int().min(1, 'Semester must be a positive integer'),
  period: z.number().int().min(1).max(2, 'Period must be 1 or 2'),
})

export const CreateReviewSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  rating: z
    .number()
    .min(1)
    .max(5)
    .refine(
      (val) => {
        // Check if the value has only 0.5 increments
        return (val * 10) % 5 === 0
      },
      { message: 'Rating must be between 1 and 5 with 0.5 increments' },
    ),
  comment: z.string().optional(),
})

export const CourseSearchSchema = z.object({
  cursor: z.string().optional(),
  limit: z.coerce.number().int().positive().optional(),
  search: z.string().optional(),
  campus: z.string().optional(),
  mainFieldOfStudy: z.string().optional(),
  semester: z.string().optional(),
  period: z.string().optional(),
  block: z.string().optional(),
  studyPace: z.string().optional(),
  courseLevel: z.string().optional(),
  examinations: z.string().optional(), // Keep as string, parse in route
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
})

/**
 * Validate request body against a Zod schema
 */
export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data)
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))

      throw createError.validation('Validation failed', {
        errors: fieldErrors,
      })
    }
    throw error
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>,
): T {
  const params: Record<string, unknown> = {}

  for (const [key, value] of searchParams.entries()) {
    // Handle multiple values for the same key (like filter arrays)
    if (params[key]) {
      // If we already have this key, append values
      if (Array.isArray(params[key])) {
        params[key].push(value)
      } else {
        // Convert to array with both values
        params[key] = [params[key], value]
      }
    } else {
      params[key] = value
    }
  }

  try {
    return validateRequest(params, schema)
  } catch (error) {
    console.error('Validation error:', error)
    throw error
  }
}
