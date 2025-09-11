'use client';

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react';
import {
  ScheduleContextType,
  ScheduleState,
  ScheduleActions,
} from '../types/schedule.types';
import { scheduleReducer, initialScheduleState } from './scheduleReducer';
import { ScheduleService } from '../services/scheduleService';
import { toast } from 'sonner';
import { useEnrolledCoursesStore } from '@/hooks/useEnrolledCoursesStore';
import { CourseWithEnrollment } from '@/types/types';

const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps {
  children: React.ReactNode;
  userId?: string; // For viewing other users' schedules
  readonly?: boolean; // For read-only mode
}

/**
 * Schedule Provider Component
 *
 * Provides schedule state management using React's useReducer for predictable state updates.
 * Implements SOLID principles:
 * - Single Responsibility: Manages only schedule state
 * - Open/Closed: Extensible through actions and services
 * - Dependency Inversion: Depends on abstractions (services)
 */
export function ScheduleProvider({
  children,
  userId,
  readonly = false,
}: ScheduleProviderProps) {
  const [state, dispatch] = useReducer(scheduleReducer, {
    ...initialScheduleState,
    readonly,
  });
  const { setEnrolledCourses, setLoading, setError } =
    useEnrolledCoursesStore();

  /**
   * Load reviews for enrolled courses
   */
  const loadReviewsForCourses = useCallback(
    async (courses: CourseWithEnrollment[]) => {
      try {
        // Fetch reviews for all enrolled courses in parallel
        const reviewPromises = courses.map(async (course) => {
          try {
            const response = await fetch(`/api/courses/${course.id}/reviews`);
            if (response.ok) {
              const result = await response.json();
              if (result.success) {
                return {
                  courseId: course.id,
                  averageRating: result.data.averageRating,
                  count: result.data.reviews.length,
                };
              }
            }
          } catch (error) {
            console.error(
              `Failed to load reviews for course ${course.id}:`,
              error
            );
          }
          return null;
        });

        const reviewResults = await Promise.all(reviewPromises);
        const validReviews = reviewResults.filter((result) => result !== null);

        // Update schedule with review data
        dispatch({
          type: ScheduleActions.UPDATE_COURSE_REVIEWS,
          payload: validReviews,
        });
      } catch (error) {
        console.error('Failed to load reviews for courses:', error);
      }
    },
    []
  );

  /**
   * Load schedule data from API
   */
  const loadScheduleData = useCallback(async () => {
    dispatch({ type: ScheduleActions.FETCH_SCHEDULE_START });
    setLoading(true);

    try {
      const scheduleData = await ScheduleService.fetchSchedule(userId);
      dispatch({
        type: ScheduleActions.FETCH_SCHEDULE_SUCCESS,
        payload: scheduleData,
      });
      const allCourses = [
        ...scheduleData.semester7.period1,
        ...scheduleData.semester7.period2,
        ...scheduleData.semester8.period1,
        ...scheduleData.semester8.period2,
        ...scheduleData.semester9.period1,
        ...scheduleData.semester9.period2,
      ];
      setEnrolledCourses(allCourses);
      setLoading(false);

      // Load reviews for all enrolled courses
      await loadReviewsForCourses(allCourses);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load schedule';
      dispatch({
        type: ScheduleActions.FETCH_SCHEDULE_ERROR,
        payload: errorMessage,
      });
      setError(errorMessage);
      setLoading(false);
      toast.error(errorMessage);
    }
  }, [userId, setEnrolledCourses, setLoading, setError, loadReviewsForCourses]);

  /**
   * Handle course movement with optimistic updates
   */
  const handleCourseMove = useCallback(
    async (
      courseId: string,
      fromSemester: number,
      fromPeriod: number,
      toSemester: number,
      toPeriod: number
    ) => {
      if (readonly) return;

      try {
        // Update via API
        await ScheduleService.updateCourseSchedule({
          courseId,
          semester: toSemester,
          period: toPeriod,
        });

        toast.success('Course moved successfully');
      } catch (error) {
        // Revert the optimistic update
        dispatch({
          type: ScheduleActions.MOVE_COURSE,
          payload: {
            courseId,
            fromSemester: toSemester,
            fromPeriod: toPeriod,
            toSemester: fromSemester,
            toPeriod: fromPeriod,
          },
        });

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to move course';
        dispatch({
          type: ScheduleActions.SET_ERROR,
          payload: errorMessage,
        });
        toast.error(errorMessage);
      }
    },
    [readonly]
  );

  /**
   * Handle course removal
   */
  const handleCourseRemoval = useCallback(
    async (enrollmentId: string) => {
      if (readonly) return;

      try {
        await ScheduleService.removeCourseFromSchedule(enrollmentId);
        toast.success('Course removed from schedule');
      } catch (error) {
        // Reload data on error to restore state
        await loadScheduleData();

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove course';
        toast.error(errorMessage);
      }
    },
    [readonly, loadScheduleData]
  );

  /**
   * Refresh schedule data
   */
  const refreshSchedule = useCallback(async () => {
    await loadScheduleData();
  }, [loadScheduleData]);

  // Set up effect to handle async operations triggered by dispatch
  useEffect(() => {
    const handleAsyncAction = async () => {
      const lastAction = state.lastAction;

      if (
        lastAction?.type === ScheduleActions.MOVE_COURSE &&
        lastAction.payload
      ) {
        const { courseId, fromSemester, fromPeriod, toSemester, toPeriod } =
          lastAction.payload;
        await handleCourseMove(
          courseId,
          fromSemester,
          fromPeriod,
          toSemester,
          toPeriod
        );
      }

      if (
        lastAction?.type === ScheduleActions.REMOVE_COURSE &&
        lastAction.payload
      ) {
        await handleCourseRemoval(lastAction.payload.enrollmentId);
      }
    };

    if (state.lastAction) {
      handleAsyncAction();
    }
  }, [state.lastAction, handleCourseMove, handleCourseRemoval]);

  // Load initial data
  useEffect(() => {
    loadScheduleData();
  }, [loadScheduleData]);

  const contextValue: ScheduleContextType = {
    state,
    dispatch,
    refreshSchedule,
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}

/**
 * Hook to use schedule context
 */
export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }

  return context;
}
