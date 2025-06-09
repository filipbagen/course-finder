import { z } from 'zod';
import { createError } from '@/lib/errors';

/**
 * Zod validation schemas for API requests
 */

export const CreateEnrollmentSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  semester: z.number().int().min(1, 'Semester must be a positive integer'),
});

export const enrollmentCreateSchema = CreateEnrollmentSchema;

export const enrollmentUpdateSchema = z.object({
  enrollmentId: z.string().min(1, 'Enrollment ID is required'),
  newSemester: z.number().int().min(1, 'Semester must be a positive integer'),
});

export const UpdateScheduleSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  semester: z.number().int().min(1, 'Semester must be a positive integer'),
  period: z.number().int().min(1).max(2, 'Period must be 1 or 2'),
});

export const CreateReviewSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  rating: z.number().min(1).max(5, 'Rating must be between 1 and 5'),
  comment: z.string().optional(),
});

export const CourseSearchSchema = z.object({
  search: z.string().optional(),
  campus: z.string().optional(),
  mainFieldOfStudy: z.string().optional(),
  semester: z.string().optional(),
  period: z.string().optional(),
  block: z.string().optional(),
  studyPace: z.string().optional(),
  courseLevel: z.string().optional(),
  examinations: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).optional(),
  limit: z.number().int().min(1).max(100).optional(),
  cursor: z.string().optional(),
});

/**
 * Validate request body against a Zod schema
 */
export function validateRequest<T>(data: unknown, schema: z.ZodSchema<T>): T {
  try {
    return schema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const fieldErrors = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }));

      throw createError.validation('Validation failed', {
        errors: fieldErrors,
      });
    }
    throw error;
  }
}

/**
 * Validate query parameters against a Zod schema
 */
export function validateQueryParams<T>(
  searchParams: URLSearchParams,
  schema: z.ZodSchema<T>
): T {
  const params: Record<string, any> = {};

  for (const [key, value] of searchParams.entries()) {
    // Convert numeric strings to numbers
    if (/^\d+$/.test(value)) {
      params[key] = parseInt(value, 10);
    } else {
      params[key] = value;
    }
  }

  return validateRequest(params, schema);
}
