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
import { useAuth } from '@/components/providers/AuthProvider';
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
  const { user, loading: authLoading, isAuthenticated } = useAuth();

  /**
   * Load schedule data from API
   */
  const loadScheduleData = useCallback(async () => {
    // Set loading state first to show loading indicators
    dispatch({ type: ScheduleActions.FETCH_SCHEDULE_START });
    setLoading(true);

    // Clear any previous errors
    dispatch({ type: ScheduleActions.SET_ERROR, payload: null });
    setError('');

    try {
      // Fetch schedule data
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
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load schedule';
      console.error('Schedule fetch error:', error);

      dispatch({
        type: ScheduleActions.FETCH_SCHEDULE_ERROR,
        payload: errorMessage,
      });

      setError(errorMessage);
      setLoading(false);

      // Show a user-friendly error toast
      toast.error(`Error loading schedule: ${errorMessage}`);
    }
  }, [userId, setEnrolledCourses, setLoading, setError]);

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
        console.log('ScheduleProvider: Moving course:', {
          courseId,
          fromSemester,
          fromPeriod,
          toSemester,
          toPeriod,
        });

        // First, optimistically update the UI for smoother UX
        dispatch({
          type: ScheduleActions.MOVE_COURSE_OPTIMISTIC,
          payload: {
            courseId,
            fromSemester,
            fromPeriod,
            toSemester,
            toPeriod,
          },
        });

        // Then update via API
        const updatedCourse = await ScheduleService.updateCourseSchedule({
          courseId,
          semester: toSemester,
          period: toPeriod,
        });

        console.log('ScheduleProvider: API update successful:', updatedCourse);

        // Show success message
        toast.success('Course moved successfully');

        // Important: Reload schedule data to ensure database and UI are in sync
        await loadScheduleData();
      } catch (error) {
        console.error('ScheduleProvider: Error moving course:', error);

        // Revert the optimistic update
        dispatch({
          type: ScheduleActions.MOVE_COURSE_REVERT,
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

        // Reload data on error to ensure state consistency
        await loadScheduleData();
      }
    },
    [readonly, loadScheduleData, dispatch]
  );

  /**
   * Handle course removal
   */
  const handleCourseRemoval = useCallback(
    async (enrollmentId: string) => {
      if (readonly) return;

      console.log(
        'ScheduleProvider: handleCourseRemoval called with enrollmentId:',
        enrollmentId
      );

      try {
        // First apply optimistic UI update
        dispatch({
          type: ScheduleActions.REMOVE_COURSE_OPTIMISTIC,
          payload: { enrollmentId },
        });

        // Then perform the API call
        await ScheduleService.removeCourseFromSchedule(enrollmentId);

        // Immediately update the enrolled courses store to remove the course
        const currentEnrolledCourses =
          useEnrolledCoursesStore.getState().enrolledCourses;

        const updatedCourses = currentEnrolledCourses.filter(
          (course) => course.enrollment.id !== enrollmentId
        );

        setEnrolledCourses(updatedCourses);

        toast.success('Course removed from schedule');

        // Important: Reload full schedule data to ensure database and UI are in sync
        await loadScheduleData();
      } catch (error) {
        console.error('ScheduleProvider: Error removing course:', error);

        // Revert the optimistic update
        dispatch({
          type: ScheduleActions.REMOVE_COURSE_REVERT,
          payload: { enrollmentId },
        });

        // Provide a user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove course';

        toast.error(errorMessage);

        // Reload schedule data to ensure state consistency
        await loadScheduleData();
      }
    },
    [readonly, loadScheduleData, setEnrolledCourses, dispatch]
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

    if (
      state.lastAction &&
      (state.lastAction.type === ScheduleActions.MOVE_COURSE ||
        state.lastAction.type === ScheduleActions.REMOVE_COURSE)
    ) {
      handleAsyncAction();
    }
  }, [state.lastAction, handleCourseMove, handleCourseRemoval]);

  // Load initial data
  useEffect(() => {
    console.log('Loading schedule data for userId:', userId);
    loadScheduleData();
  }, [loadScheduleData, userId]);

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
