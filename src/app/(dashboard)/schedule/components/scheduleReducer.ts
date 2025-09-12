import {
  ScheduleData,
  ScheduleState,
  ScheduleAction,
  ScheduleActions,
  MoveOperation,
  RemoveOperation,
} from '../types/schedule.types';
import { CourseWithEnrollment } from '@/types/types';

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
};

/**
 * Schedule Reducer
 *
 * Handles all schedule state transitions in a pure, predictable way.
 * Each action returns a new state object to maintain immutability.
 */
export function scheduleReducer(
  state: ScheduleState,
  action: ScheduleAction
): ScheduleState {
  switch (action.type) {
    case ScheduleActions.FETCH_SCHEDULE_START:
      return {
        ...state,
        loading: true,
        error: null,
      };

    case ScheduleActions.FETCH_SCHEDULE_SUCCESS:
      return {
        ...state,
        loading: false,
        error: null,
        schedule: action.payload,
        lastUpdated: new Date(),
      };

    case ScheduleActions.FETCH_SCHEDULE_ERROR:
      return {
        ...state,
        loading: false,
        error: action.payload,
      };

    case ScheduleActions.SET_DRAG_STATE:
      return {
        ...state,
        isDragging: action.payload.isDragging,
        draggedCourse: action.payload.draggedCourse,
      };

    case ScheduleActions.SET_ERROR:
      return {
        ...state,
        error: action.payload,
      };

    case ScheduleActions.MOVE_COURSE:
    case ScheduleActions.MOVE_COURSE_OPTIMISTIC:
      return {
        ...state,
        schedule: moveCourseInSchedule(state.schedule, action.payload),
        lastAction: action,
      };

    case ScheduleActions.MOVE_COURSE_REVERT:
      return {
        ...state,
        schedule: moveCourseInSchedule(state.schedule, action.payload),
        lastAction: null,
      };

    case ScheduleActions.REMOVE_COURSE:
    case ScheduleActions.REMOVE_COURSE_OPTIMISTIC:
      return {
        ...state,
        schedule: removeCourseFromSchedule(state.schedule, action.payload),
        lastAction: action,
      };

    case ScheduleActions.REMOVE_COURSE_REVERT:
      // We should reload the data in this case, as reverting a removal
      // requires adding the course back with all its original details
      return {
        ...state,
        lastAction: null,
      };

    case ScheduleActions.UPDATE_COURSE_REVIEWS:
      return {
        ...state,
        schedule: updateCourseReviews(state.schedule, action.payload),
      };

    default:
      return state;
  }
}

/**
 * Move a course between semesters/periods
 */
function moveCourseInSchedule(
  schedule: ScheduleData,
  operation: MoveOperation
): ScheduleData {
  const { courseId, fromSemester, fromPeriod, toSemester, toPeriod } =
    operation;

  // Create a deep copy of the schedule
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
  };

  // Get source and destination keys
  const fromSemesterKey = `semester${fromSemester}` as keyof ScheduleData;
  const toSemesterKey = `semester${toSemester}` as keyof ScheduleData;
  const fromPeriodKey = `period${fromPeriod}` as 'period1' | 'period2';
  const toPeriodKey = `period${toPeriod}` as 'period1' | 'period2';

  // Find the course in the source location
  const fromArray = newSchedule[fromSemesterKey][fromPeriodKey];
  const courseIndex = fromArray.findIndex((course) => course.id === courseId);
  if (courseIndex === -1) {
    console.warn('Course not found in source location:', courseId);
    return schedule;
  }

  const course = fromArray[courseIndex];

  // Check if this is a multi-period course
  const isMultiPeriod =
    course.period && Array.isArray(course.period) && course.period.length > 1;

  // Verify that the move is valid for the course
  // Courses in semester 7 and 9 can be moved between each other
  // Courses in semester 8 can only be moved within semester 8
  const currentSemester = course.enrollment.semester;
  const canMove79 =
    (currentSemester === 7 || currentSemester === 9) &&
    (toSemester === 7 || toSemester === 9);
  const stayIn8 = currentSemester === 8 && toSemester === 8;

  if (!(canMove79 || stayIn8)) {
    console.warn('Invalid semester move:', {
      from: currentSemester,
      to: toSemester,
      rule: 'Courses from semester 7 and 9 can only be moved between 7 and 9, courses from semester 8 can only stay in 8',
    });
    return schedule;
  }

  if (isMultiPeriod) {
    // For multi-period courses, remove from all periods in source semester
    // and add to all periods in destination semester
    course.period.forEach((period: number) => {
      if (period === 1 || period === 2) {
        const sourcePeriodKey = `period${period}` as 'period1' | 'period2';
        const destPeriodKey = `period${period}` as 'period1' | 'period2';

        // Remove from source semester
        const sourceArray = newSchedule[fromSemesterKey][sourcePeriodKey];
        const courseIdx = sourceArray.findIndex((c) => c.id === courseId);
        if (courseIdx !== -1) {
          sourceArray.splice(courseIdx, 1);
        }

        // Add to destination semester (avoid duplicates)
        const destArray = newSchedule[toSemesterKey][destPeriodKey];
        const exists = destArray.some((c) => c.id === courseId);
        if (!exists) {
          // Update the enrollment semester
          const updatedCourse = {
            ...course,
            enrollment: {
              ...course.enrollment,
              semester: toSemester,
            },
          };
          destArray.push(updatedCourse);
        }
      }
    });
  } else {
    // Single period course - normal move logic
    const [courseToMove] = fromArray.splice(courseIndex, 1);

    // Update the enrollment semester
    const updatedCourse = {
      ...courseToMove,
      enrollment: {
        ...courseToMove.enrollment,
        semester: toSemester,
      },
    };

    // Add to destination
    const toArray = newSchedule[toSemesterKey][toPeriodKey];
    toArray.push(updatedCourse);
  }

  return newSchedule;
}

/**
 * Remove a course from the schedule
 */
function removeCourseFromSchedule(
  schedule: ScheduleData,
  operation: RemoveOperation
): ScheduleData {
  const { enrollmentId } = operation;

  // Create a deep copy of the schedule
  const newSchedule: ScheduleData = {
    semester7: {
      period1: schedule.semester7.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
      period2: schedule.semester7.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
    },
    semester8: {
      period1: schedule.semester8.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
      period2: schedule.semester8.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
    },
    semester9: {
      period1: schedule.semester9.period1.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
      period2: schedule.semester9.period2.filter(
        (course) => course.enrollment?.id !== enrollmentId
      ),
    },
  };

  return newSchedule;
}

/**
 * Update course reviews in the schedule
 */
function updateCourseReviews(
  schedule: ScheduleData,
  reviewData: Array<{
    courseId: string;
    averageRating: number;
    count: number;
  }>
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
  };

  return newSchedule;
}
