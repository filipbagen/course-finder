import {
  ScheduleData,
  ScheduleState,
  ScheduleAction,
  ScheduleActions,
  MoveOperation,
  RemoveOperation,
} from '../types/schedule.types'
import { CourseWithEnrollment } from '@/types/types'

export const initialScheduleState: ScheduleState = {
  schedule: {
    semester7: { period1: [], period2: [] },
    semester8: { period1: [], period2: [] },
    semester9: { period1: [], period2: [] },
  },
  loading: false,
  error: null,
  readonly: false,
  isDragging: false,
  draggedCourse: null,
  lastUpdated: null,
  lastAction: null,
  pendingOperations: [], // Track operations in progress
}

/**
 * Schedule Reducer
 *
 * Handles all schedule state transitions in a pure, predictable way.
 * Each action returns a new state object to maintain immutability.
 */
export function scheduleReducer(
  state: ScheduleState,
  action: ScheduleAction,
): ScheduleState {
  // console.log(`Schedule Reducer: Handling action ${action.type}`, action);

  switch (action.type) {
    case ScheduleActions.FETCH_SCHEDULE_START:
      return {
        ...state,
        loading: true,
        error: null,
      }

    case ScheduleActions.FETCH_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        schedule: action.payload,
        lastUpdated: new Date(),
        // Clear any pending operations when we get fresh data
        pendingOperations: [],
      }

    case ScheduleActions.FETCH_SCHEDULE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      }

    case ScheduleActions.SET_DRAG_STATE:
      return {
        ...state,
        isDragging: action.payload.isDragging,
        draggedCourse: action.payload.draggedCourse,
      }

    case ScheduleActions.MOVE_COURSE: {
      // This action triggers the async operation in the useEffect
      return {
        ...state,
        lastAction: action,
      }
    }

    case ScheduleActions.REMOVE_COURSE: {
      // This action triggers the async operation in the useEffect
      return {
        ...state,
        lastAction: action,
      }
    }

    case ScheduleActions.MOVE_COURSE_OPTIMISTIC: {
      // Track this operation as pending
      const pendingOperations = [
        ...state.pendingOperations,
        {
          type: 'move' as const,
          id: action.payload.courseId,
          data: action.payload,
        },
      ]

      return {
        ...state,
        schedule: moveCourseInSchedule(state.schedule, action.payload),
        lastAction: action,
        pendingOperations,
      }
    }

    case ScheduleActions.MOVE_COURSE_SUCCESS: {
      // Remove this operation from pending
      const pendingOperations = state.pendingOperations.filter(
        (op) => !(op.type === 'move' && op.id === action.payload.courseId),
      )

      // Update the schedule with the actual course data from the API
      const updatedSchedule = updateCourseInSchedule(
        state.schedule,
        action.payload.course,
      )

      return {
        ...state,
        schedule: updatedSchedule,
        pendingOperations,
        lastAction: null, // Clear the last action
        lastUpdated: new Date(),
      }
    }

    case ScheduleActions.MOVE_COURSE_REVERT: {
      // Remove this operation from pending
      const pendingOperations = state.pendingOperations.filter(
        (op) => !(op.type === 'move' && op.id === action.payload.courseId),
      )

      return {
        ...state,
        schedule: moveCourseInSchedule(state.schedule, action.payload),
        lastAction: null, // Clear the last action
        pendingOperations,
      }
    }

    case ScheduleActions.REMOVE_COURSE_OPTIMISTIC: {
      // Track this operation as pending
      const pendingOperations = [
        ...state.pendingOperations,
        {
          type: 'remove' as const,
          id: action.payload.enrollmentId,
          data: action.payload,
        },
      ]

      return {
        ...state,
        schedule: removeCourseFromSchedule(state.schedule, action.payload),
        lastAction: action,
        pendingOperations,
      }
    }

    case ScheduleActions.REMOVE_COURSE_SUCCESS: {
      // Remove this operation from pending
      const pendingOperations = state.pendingOperations.filter(
        (op) =>
          !(op.type === 'remove' && op.id === action.payload.enrollmentId),
      )

      return {
        ...state,
        pendingOperations,
        lastAction: null, // Clear the last action
        lastUpdated: new Date(),
      }
    }

    case ScheduleActions.REMOVE_COURSE_REVERT: {
      // Get the original course data to add back
      const originalData = state.pendingOperations.find(
        (op) => op.type === 'remove' && op.id === action.payload.enrollmentId,
      )?.data

      // Remove this operation from pending
      const pendingOperations = state.pendingOperations.filter(
        (op) =>
          !(op.type === 'remove' && op.id === action.payload.enrollmentId),
      )

      // If we don't have the original data, we need to fetch the schedule again
      if (!originalData) {
        return {
          ...state,
          pendingOperations,
          lastAction: null, // Clear the last action
        }
      }

      // Otherwise, we can add the course back
      return {
        ...state,
        schedule: addCourseBackToSchedule(
          state.schedule,
          action.payload.courseToRestore,
        ),
        pendingOperations,
        lastAction: null, // Clear the last action
      }
    }

    case ScheduleActions.UPDATE_COURSE_REVIEWS:
      return {
        ...state,
        schedule: updateCourseReviews(state.schedule, action.payload),
      }

    default:
      return state
  }
}

/**
 * Add a course back to the schedule (for reverting removals)
 */
function addCourseBackToSchedule(
  schedule: ScheduleData,
  course: CourseWithEnrollment | null,
): ScheduleData {
  if (!course || !course.enrollment) {
    // console.warn('Cannot add course back: Missing course data');
    return schedule
  }

  // Create a deep copy of the schedule
  const newSchedule = JSON.parse(JSON.stringify(schedule)) as ScheduleData

  const semester = course.enrollment.semester
  const period = course.enrollment.period || [1]

  // Determine which arrays to add the course to
  const semesterKey = `semester${semester}` as keyof ScheduleData

  if (Array.isArray(period)) {
    period.forEach((p) => {
      if (p === 1 || p === 2) {
        const periodKey = `period${p}` as 'period1' | 'period2'
        newSchedule[semesterKey][periodKey].push(course)
      }
    })
  } else if (period === 1 || period === 2) {
    const periodKey = `period${period}` as 'period1' | 'period2'
    newSchedule[semesterKey][periodKey].push(course)
  }

  return newSchedule
}

/**
 * Update a course in the schedule with new data (without moving it)
 */
function updateCourseInSchedule(
  schedule: ScheduleData,
  updatedCourse: CourseWithEnrollment,
): ScheduleData {
  // Create a deep copy of the schedule
  const newSchedule: ScheduleData = JSON.parse(JSON.stringify(schedule))

  const semester = updatedCourse.enrollment.semester
  const semesterKey = `semester${semester}` as keyof ScheduleData

  // Update the course in all periods where it appears
  ;['period1', 'period2'].forEach((periodKey) => {
    const periodArray =
      newSchedule[semesterKey][periodKey as 'period1' | 'period2']
    const courseIndex = periodArray.findIndex((c) => c.id === updatedCourse.id)

    if (courseIndex !== -1) {
      periodArray[courseIndex] = updatedCourse
    }
  })

  return newSchedule
}
/**
 * Move a course between semesters/periods
 */
function moveCourseInSchedule(
  schedule: ScheduleData,
  operation: MoveOperation,
): ScheduleData {
  const { courseId, fromSemester, fromPeriod, toSemester, toPeriod } = operation

  // Create a completely new schedule object to ensure React detects the change
  const newSchedule: ScheduleData = {
    semester7: {
      period1: [...schedule.semester7.period1],
      period2: [...schedule.semester7.period2],
    },
    semester8: {
      period1: [...schedule.semester8.period1],
      period2: [...schedule.semester8.period2],
    },
    semester9: {
      period1: [...schedule.semester9.period1],
      period2: [...schedule.semester9.period2],
    },
  }

  // Get source and destination keys
  const fromSemesterKey = `semester${fromSemester}` as keyof ScheduleData
  const toSemesterKey = `semester${toSemester}` as keyof ScheduleData

  // Find the course in the source location
  // Since courses can be in multiple periods, we need to find it in any period
  let course: CourseWithEnrollment | null = null
  let fromPeriodKey: 'period1' | 'period2' | null = null

  if (Array.isArray(fromPeriod)) {
    // For multi-period courses, check all periods
    for (const period of fromPeriod) {
      if (period === 1 || period === 2) {
        const periodKey = `period${period}` as 'period1' | 'period2'
        const foundCourse = newSchedule[fromSemesterKey][periodKey].find(
          (c) => c.id === courseId,
        )
        if (foundCourse) {
          course = foundCourse
          fromPeriodKey = periodKey
          break
        }
      }
    }
  } else {
    // Single period
    if (fromPeriod === 1 || fromPeriod === 2) {
      const periodKey = `period${fromPeriod}` as 'period1' | 'period2'
      course =
        newSchedule[fromSemesterKey][periodKey].find(
          (c) => c.id === courseId,
        ) || null
      fromPeriodKey = periodKey
    }
  }

  if (!course || !fromPeriodKey) {
    console.warn('Course not found in source location:', courseId)
    return newSchedule // Return the new schedule even if course not found
  }

  // Check if this is a multi-period course
  const isMultiPeriod =
    course.period && Array.isArray(course.period) && course.period.length > 1

  // Verify that the move is valid for the course
  // Courses in semester 7 and 9 can be moved between each other
  // Courses in semester 8 can only be moved within semester 8
  const currentSemester = course.enrollment.semester
  const canMove79 =
    (currentSemester === 7 || currentSemester === 9) &&
    (toSemester === 7 || toSemester === 9)
  const stayIn8 = currentSemester === 8 && toSemester === 8

  if (!(canMove79 || stayIn8)) {
    console.warn('Invalid semester move:', {
      from: currentSemester,
      to: toSemester,
      rule: 'Courses from semester 7 and 9 can only be moved between 7 and 9, courses from semester 8 can only stay in 8',
    })
    return newSchedule // Return the new schedule even if move is invalid
  }

  if (isMultiPeriod) {
    // For multi-period courses, remove from all periods in source semester
    // and add to all periods in destination semester
    course.period.forEach((period: number) => {
      if (period === 1 || period === 2) {
        const sourcePeriodKey = `period${period}` as 'period1' | 'period2'
        const destPeriodKey = `period${period}` as 'period1' | 'period2'

        // Remove from source semester
        const sourceArray = newSchedule[fromSemesterKey][sourcePeriodKey]
        const courseIdx = sourceArray.findIndex((c) => c.id === courseId)
        if (courseIdx !== -1) {
          sourceArray.splice(courseIdx, 1)
        }

        // Add to destination semester (avoid duplicates)
        const destArray = newSchedule[toSemesterKey][destPeriodKey]
        const exists = destArray.some((c) => c.id === courseId)
        if (!exists) {
          // Update the enrollment semester
          const updatedCourse = {
            ...course,
            enrollment: {
              ...course.enrollment,
              semester: toSemester,
            },
          }
          destArray.push(updatedCourse)
        }
      }
    })
  } else {
    // Single period course - remove from source and add to destination
    const fromArray = newSchedule[fromSemesterKey][fromPeriodKey]
    const courseIndex = fromArray.findIndex((c) => c.id === courseId)
    if (courseIndex !== -1) {
      const [courseToMove] = fromArray.splice(courseIndex, 1)
      if (!courseToMove) return newSchedule

      // Update the enrollment semester
      const updatedCourse = {
        ...courseToMove,
        semester: courseToMove.semester ?? [],
        enrollment: {
          ...courseToMove.enrollment,
          semester: toSemester,
        },
      }

      // Add to destination
      if (Array.isArray(toPeriod)) {
        // For multi-period destination, add to all periods
        toPeriod.forEach((period) => {
          if (period === 1 || period === 2) {
            const toPeriodKey = `period${period}` as 'period1' | 'period2'
            const toArray = newSchedule[toSemesterKey][toPeriodKey]
            toArray.push(updatedCourse)
          }
        })
      } else {
        // Single period destination
        if (toPeriod === 1 || toPeriod === 2) {
          const toPeriodKey = `period${toPeriod}` as 'period1' | 'period2'
          const toArray = newSchedule[toSemesterKey][toPeriodKey]
          toArray.push(updatedCourse)
        }
      }
    }
  }

  return newSchedule
}

/**
 * Remove a course from the schedule
 */
function removeCourseFromSchedule(
  schedule: ScheduleData,
  operation: RemoveOperation,
): ScheduleData {
  const { enrollmentId } = operation

  // Create a deep copy of the schedule
  const newSchedule: ScheduleData = {
    semester7: {
      period1: schedule.semester7.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
      period2: schedule.semester7.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
    },
    semester8: {
      period1: schedule.semester8.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
      period2: schedule.semester8.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
    },
    semester9: {
      period1: schedule.semester9.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
      period2: schedule.semester9.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId,
      ),
    },
  }

  return newSchedule
}

/**
 * Update course reviews in the schedule
 */
function updateCourseReviews(
  schedule: ScheduleData,
  reviewData: Array<{
    courseId: string
    averageRating: number
    count: number
  }>,
): ScheduleData {
  // Create a deep copy of the schedule
  const newSchedule: ScheduleData = {
    semester7: {
      period1: schedule.semester7.period1.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
      period2: schedule.semester7.period2.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
    },
    semester8: {
      period1: schedule.semester8.period1.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
      period2: schedule.semester8.period2.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
    },
    semester9: {
      period1: schedule.semester9.period1.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
      period2: schedule.semester9.period2.map((course) => ({
        ...course,
        reviewStats:
          reviewData.find((r) => r.courseId === course.id) || undefined,
      })),
    },
  }

  return newSchedule
}
