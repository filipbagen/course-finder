/**
 * Utility functions for transforming data from the database to client-safe formats
 */

import { Course } from '@/types/types';

/**
 * Transform BigInt values to numbers for JSON serialization
 * Handles both individual courses and arrays of courses
 */
export function transformCourse<T extends Record<string, any>>(
  course: T | null
): T | null {
  if (!course) return null;

  return {
    ...course,
    id: course.id !== undefined ? course.id.toString() : undefined,
    credits: course.credits !== undefined ? Number(course.credits) : undefined,
    scheduledHours:
      course.scheduledHours !== undefined && course.scheduledHours !== null
        ? Number(course.scheduledHours)
        : null,
    selfStudyHours:
      course.selfStudyHours !== undefined && course.selfStudyHours !== null
        ? Number(course.selfStudyHours)
        : null,
    period:
      course.period && Array.isArray(course.period)
        ? course.period.map((p: any) => Number(p))
        : course.period,
    block:
      course.block && Array.isArray(course.block)
        ? course.block.map((b: any) => Number(b))
        : course.block,
    semester:
      course.semester !== undefined
        ? Array.isArray(course.semester)
          ? course.semester.map((s: any) => Number(s))
          : typeof course.semester === 'object'
          ? Number(course.semester)
          : course.semester
        : undefined,
  } as T;
}

/**
 * Transform an array of courses
 */
export function transformCourses<T extends Record<string, any>>(
  courses: T[]
): T[] {
  return courses.map((course) => transformCourse(course) as T);
}

/**
 * Transform enrollment data with courses
 */
export function transformEnrollmentWithCourse(enrollment: any): any {
  if (!enrollment) return null;

  return {
    ...enrollment,
    course: transformCourse(enrollment.course),
  };
}

/**
 * Transform enrollments with courses
 */
export function transformEnrollmentsWithCourses(enrollments: any[]): any[] {
  return enrollments.map(transformEnrollmentWithCourse);
}
