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
      return {
        ...state,
        schedule: moveCourseInSchedule(state.schedule, action.payload),
        lastAction: action,
      };

    case ScheduleActions.REMOVE_COURSE:
      return {
        ...state,
        schedule: removeCourseFromSchedule(state.schedule, action.payload),
        lastAction: action,
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

  // Get source and destination arrays
  const fromSemesterKey = `semester${fromSemester}` as keyof ScheduleData;
  const toSemesterKey = `semester${toSemester}` as keyof ScheduleData;
  const fromPeriodKey = `period${fromPeriod}` as 'period1' | 'period2';
  const toPeriodKey = `period${toPeriod}` as 'period1' | 'period2';

  const fromArray = newSchedule[fromSemesterKey][fromPeriodKey];
  const toArray = newSchedule[toSemesterKey][toPeriodKey];

  // Find and remove the course from source
  const courseIndex = fromArray.findIndex((course) => course.id === courseId);
  if (courseIndex === -1) {
    console.warn('Course not found in source location:', courseId);
    return schedule;
  }

  const [course] = fromArray.splice(courseIndex, 1);

  // Add to destination
  toArray.push(course);

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
