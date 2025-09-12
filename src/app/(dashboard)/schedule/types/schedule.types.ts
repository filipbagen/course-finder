import { CourseWithEnrollment } from '@/types/types';

/**
 * Schedule-specific types for the schedule page components
 */

export interface ScheduleCourse extends CourseWithEnrollment {
  // Extend with schedule-specific properties if needed
  reviewStats?: {
    averageRating: number;
    count: number;
  };
}

export interface SemesterData {
  period1: CourseWithEnrollment[];
  period2: CourseWithEnrollment[];
}

export interface ScheduleData {
  semester7: SemesterData;
  semester8: SemesterData;
  semester9: SemesterData;
}

export interface ScheduleUpdate {
  courseId: string;
  semester: number;
  period: number;
}

export interface MoveOperation {
  courseId: string;
  fromSemester: number;
  fromPeriod: number;
  toSemester: number;
  toPeriod: number;
}

export interface RemoveOperation {
  enrollmentId: string;
}

// Action types for the reducer
export enum ScheduleActions {
  FETCH_SCHEDULE_START = 'FETCH_SCHEDULE_START',
  FETCH_SCHEDULE_SUCCESS = 'FETCH_SCHEDULE_SUCCESS',
  FETCH_SCHEDULE_ERROR = 'FETCH_SCHEDULE_ERROR',
  MOVE_COURSE = 'MOVE_COURSE',
  MOVE_COURSE_OPTIMISTIC = 'MOVE_COURSE_OPTIMISTIC',
  MOVE_COURSE_REVERT = 'MOVE_COURSE_REVERT',
  REMOVE_COURSE = 'REMOVE_COURSE',
  REMOVE_COURSE_OPTIMISTIC = 'REMOVE_COURSE_OPTIMISTIC',
  REMOVE_COURSE_REVERT = 'REMOVE_COURSE_REVERT',
  SET_DRAG_STATE = 'SET_DRAG_STATE',
  SET_ERROR = 'SET_ERROR',
  UPDATE_COURSE_REVIEWS = 'UPDATE_COURSE_REVIEWS',
}

export interface ScheduleAction {
  type: ScheduleActions;
  payload?: any;
}

export interface DragState {
  isDragging: boolean;
  draggedCourse: CourseWithEnrollment | null;
}

export interface ScheduleState {
  schedule: ScheduleData;
  loading: boolean;
  error: string | null;
  readonly: boolean;
  isDragging: boolean;
  draggedCourse: CourseWithEnrollment | null;
  lastUpdated: Date | null;
  lastAction: ScheduleAction | null;
}

export interface ScheduleContextType {
  state: ScheduleState;
  dispatch: React.Dispatch<ScheduleAction>;
  refreshSchedule: () => Promise<void>;
}

export interface ScheduleGridProps {
  readonly?: boolean;
  showStatistics?: boolean;
}

export interface SemesterBlockProps {
  semester: number;
  period: number;
  courses: ScheduleCourse[];
  readonly?: boolean;
  loading?: boolean;
}

export interface CourseCardScheduleProps {
  course: ScheduleCourse;
  readonly?: boolean;
  onRemove?: (enrollmentId: string) => void;
}
