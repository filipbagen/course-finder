/**
 * Utility functions for transforming Prisma course data to JSON-safe formats.
 *
 * Prisma maps PostgreSQL `bigint` columns to JavaScript `bigint`, which is
 * not serializable with `JSON.stringify`. These helpers convert BigInt fields
 * to plain `number` before sending data to the client.
 */

/**
 * Shape of Prisma course records that may contain BigInt fields.
 * All BigInt fields are optional so the constraint works with partial selects.
 */
interface BigIntCourseFields {
  credits?: bigint | number
  scheduledHours?: bigint | number | null
  selfStudyHours?: bigint | number | null
  period?: (bigint | number)[]
  block?: (bigint | number)[]
  semester?: (bigint | number)[]
  // Index signature allows objects with arbitrary extra properties (e.g. id,
  // name, code) to satisfy this constraint even when they contain no BigInt
  // fields at all.
  [key: string]: unknown
}

/**
 * Transform BigInt values to numbers for JSON serialization.
 * Handles both full course records and partial `select` results.
 */
export function transformCourse<T extends BigIntCourseFields>(course: T): T
export function transformCourse<T extends BigIntCourseFields>(
  course: T | null,
): T | null
export function transformCourse<T extends BigIntCourseFields>(
  course: T | null,
): T | null {
  if (!course) return null

  return {
    ...course,
    ...(course.credits != null && { credits: Number(course.credits) }),
    ...(course.scheduledHours !== undefined && {
      scheduledHours:
        course.scheduledHours != null ? Number(course.scheduledHours) : null,
    }),
    ...(course.selfStudyHours !== undefined && {
      selfStudyHours:
        course.selfStudyHours != null ? Number(course.selfStudyHours) : null,
    }),
    ...(course.period && { period: course.period.map(Number) }),
    ...(course.block && { block: course.block.map(Number) }),
    ...(course.semester &&
      Array.isArray(course.semester) && {
        semester: course.semester.map(Number),
      }),
  } as T
}

/**
 * Transform an array of course records.
 */
export function transformCourses<T extends BigIntCourseFields>(
  courses: T[],
): T[] {
  return courses.map((course) => transformCourse(course))
}

/**
 * Shape of enrollment records that include a nested course relation.
 */
interface EnrollmentWithCourseRelation {
  course?: BigIntCourseFields | null
  [key: string]: unknown
}

/**
 * Transform enrollment data that includes a nested course relation.
 */
export function transformEnrollmentWithCourse<
  T extends EnrollmentWithCourseRelation,
>(enrollment: T | null): T | null {
  if (!enrollment) return null

  return {
    ...enrollment,
    ...(enrollment.course && {
      course: transformCourse(enrollment.course),
    }),
  } as T
}

/**
 * Transform an array of enrollments with nested course relations.
 */
export function transformEnrollmentsWithCourses<
  T extends EnrollmentWithCourseRelation,
>(enrollments: T[]): T[] {
  return enrollments
    .map((e) => transformEnrollmentWithCourse(e))
    .filter((e): e is T => e !== null)
}
