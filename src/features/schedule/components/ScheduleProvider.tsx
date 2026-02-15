'use client'

import React, {
  createContext,
  useContext,
  useReducer,
  useEffect,
  useCallback,
} from 'react'
import { ScheduleContextType, ScheduleActions } from '../types/schedule.types'
import { scheduleReducer, initialScheduleState } from './scheduleReducer'
import { ScheduleService } from '../services/scheduleService'
import { toast } from 'sonner'
import { useEnrolledCoursesStore } from '@/hooks/useEnrolledCoursesStore'
import { useAuth } from '@/components/providers/AuthProvider'
import { CourseWithEnrollment } from '@/types/types'

const ScheduleContext = createContext<ScheduleContextType | null>(null)

interface ScheduleProviderProps {
  children: React.ReactNode
  userId?: string // For viewing other users' schedules
  readonly?: boolean // For read-only mode
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
  })
  const {
    setEnrolledCourses,
    setLoading,
    setError,
    removeCourse,
    _updateCourse,
  } = useEnrolledCoursesStore()
  const {
    user: _user,
    loading: _authLoading,
    isAuthenticated: _isAuthenticated,
  } = useAuth()

  /**
   * Load schedule data from API and sync with Zustand store
   */
  const loadScheduleData = useCallback(async () => {
    if (!userId) return

    try {
      setLoading(true)
      setError(null)

      // Clear any stale persisted data before loading fresh data
      // This ensures we don't have conflicts between persisted and fresh data
      const freshScheduleData = await ScheduleService.fetchSchedule(userId)

      // Transform schedule data to flat array for Zustand store
      const allCourses: CourseWithEnrollment[] = [
        ...freshScheduleData.semester7.period1,
        ...freshScheduleData.semester7.period2,
        ...freshScheduleData.semester8.period1,
        ...freshScheduleData.semester8.period2,
        ...freshScheduleData.semester9.period1,
        ...freshScheduleData.semester9.period2,
      ]

      // Update Zustand store with fresh data (this will also persist to localStorage)
      setEnrolledCourses(allCourses)

      // Update reducer state
      dispatch({
        type: ScheduleActions.FETCH_SCHEDULE_SUCCESS,
        payload: freshScheduleData,
      })

      setLoading(false)
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Failed to load schedule'
      // console.error('Schedule fetch error:', error);

      dispatch({
        type: ScheduleActions.FETCH_SCHEDULE_ERROR,
        payload: errorMessage,
      })

      setError(errorMessage)
      setLoading(false)

      // Show a user-friendly error toast
      toast.error(`Error loading schedule: ${errorMessage}`)
    }
  }, [userId, setEnrolledCourses, setLoading, setError])

  /**
   * Handle course movement with optimistic updates
   */
  const handleCourseMove = useCallback(
    async (
      courseId: string,
      fromSemester: number,
      fromPeriod: number[],
      toSemester: number,
      toPeriod: number[],
    ) => {
      if (readonly) return

      try {
        // console.log('ScheduleProvider: Moving course:', {
        //   courseId,
        //   fromSemester,
        //   fromPeriod,
        //   toSemester,
        //   toPeriod,
        // });

        // The optimistic update has already happened in ScheduleContainer
        // Now perform the API call asynchronously
        const updatedCourse = await ScheduleService.updateCourseSchedule({
          courseId,
          semester: toSemester,
          period: fromPeriod, // Keep as array for service interface, service will handle conversion
        })

        // console.log('ScheduleProvider: API update successful:', updatedCourse);

        // Show success message
        toast.success('Course moved successfully')

        // Mark the operation as successful in the reducer
        dispatch({
          type: ScheduleActions.MOVE_COURSE_SUCCESS,
          payload: {
            courseId,
            course: updatedCourse,
          },
        })

        // Clear the last action to prevent re-triggering
        dispatch({ type: ScheduleActions.SET_ERROR, payload: null })

        // Update the enrolled courses store with the updated course data
        const currentEnrolledCourses =
          useEnrolledCoursesStore.getState().enrolledCourses
        const courseToUpdate = currentEnrolledCourses.find(
          (course) => course.id === courseId,
        )

        if (courseToUpdate) {
          // Update the enrolled courses store directly
          const updatedCourses = currentEnrolledCourses.map((course) =>
            course.id === courseId
              ? {
                  ...course,
                  enrollment: {
                    ...course.enrollment,
                    semester: toSemester,
                    // Keep the original period - don't update it
                  },
                }
              : course,
          )
          setEnrolledCourses(updatedCourses)
        }
      } catch (error) {
        // console.error('ScheduleProvider: Error moving course:', error);

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
        })

        const errorMessage =
          error instanceof Error ? error.message : 'Failed to move course'
        dispatch({
          type: ScheduleActions.SET_ERROR,
          payload: errorMessage,
        })
        toast.error(errorMessage)

        // Clear the last action on error
        dispatch({ type: ScheduleActions.SET_ERROR, payload: null })

        // Reload data on error to ensure state consistency
        await loadScheduleData()
      }
    },
    [readonly, loadScheduleData, dispatch, setEnrolledCourses],
  )

  /**
   * Handle course removal
   */
  const handleCourseRemoval = useCallback(
    async (enrollmentId: string) => {
      if (readonly) return

      // Find the course before removing it so we can restore if needed
      const currentEnrolledCourses =
        useEnrolledCoursesStore.getState().enrolledCourses
      const courseToRemove = currentEnrolledCourses.find(
        (course) => course.enrollment?.id === enrollmentId,
      )

      try {
        // The optimistic update has already happened in SemesterBlock
        // Now perform the API call asynchronously
        const result =
          await ScheduleService.removeCourseFromSchedule(enrollmentId)
        // console.log('ScheduleProvider: Course removal API result:', result);

        // If the API reports the course was already removed or was removed successfully
        if (result.success || result.alreadyRemoved) {
          // Update the Zustand store
          removeCourse(enrollmentId)

          // Mark the operation as successful in the reducer
          dispatch({
            type: ScheduleActions.REMOVE_COURSE_SUCCESS,
            payload: { enrollmentId },
          })

          // Clear the last action to prevent re-triggering
          dispatch({ type: ScheduleActions.SET_ERROR, payload: null })

          // Show success toast
          toast.success('Course removed from schedule')
        } else {
          throw new Error('Failed to remove course: Unknown error')
        }
      } catch (error) {
        // console.error('ScheduleProvider: Error removing course:', error);

        // Revert the optimistic update
        dispatch({
          type: ScheduleActions.REMOVE_COURSE_REVERT,
          payload: {
            enrollmentId,
            courseToRestore: courseToRemove,
          },
        })

        // Provide a user-friendly error message
        const errorMessage =
          error instanceof Error ? error.message : 'Failed to remove course'

        toast.error(errorMessage)

        // Clear the last action on error
        dispatch({ type: ScheduleActions.SET_ERROR, payload: null })

        // Reload schedule data to ensure state consistency
        await loadScheduleData()
      }
    },
    [readonly, loadScheduleData, dispatch, removeCourse],
  )

  /**
   * Refresh schedule data
   */
  const refreshSchedule = useCallback(async () => {
    // Force clear any cached data in localStorage
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('enrolled-courses-storage')
      } catch {
        // Ignore localStorage errors
      }
    }

    // Force reload data from API
    await loadScheduleData()
  }, [loadScheduleData])

  // Set up effect to handle async operations triggered by dispatch
  useEffect(() => {
    if (
      state.lastAction &&
      (state.lastAction.type === ScheduleActions.MOVE_COURSE ||
        state.lastAction.type === ScheduleActions.REMOVE_COURSE)
    ) {
      const lastAction = state.lastAction
      const payload = lastAction.payload

      if (lastAction.type === ScheduleActions.MOVE_COURSE && payload) {
        const { courseId, fromSemester, fromPeriod, toSemester, toPeriod } =
          payload
        // Execute the async operation without blocking the UI
        handleCourseMove(
          courseId,
          fromSemester,
          fromPeriod,
          toSemester,
          toPeriod,
        ).catch((error) => {
          console.error('Async course move failed:', error)
        })
      }

      if (lastAction.type === ScheduleActions.REMOVE_COURSE && payload) {
        // Execute the async operation without blocking the UI
        handleCourseRemoval(payload.enrollmentId).catch((error) => {
          console.error('Async course removal failed:', error)
        })
      }
    }
  }, [state.lastAction, handleCourseMove, handleCourseRemoval])

  // Load initial data
  useEffect(() => {
    // Clear any stale persisted data on initial load
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('enrolled-courses-storage')
      } catch {
        // Ignore localStorage errors in case it's disabled
      }
    }

    // console.log('Loading schedule data for userId:', userId);
    loadScheduleData()
  }, [loadScheduleData, userId])

  // Detect pending operations and force a refresh if needed
  useEffect(() => {
    // Only refresh if there are pending operations and no recent activity
    if (state.pendingOperations.length > 0) {
      const lastActivity = state.lastUpdated || new Date(0)
      const timeSinceLastActivity = Date.now() - lastActivity.getTime()

      // Only refresh if it's been more than 10 seconds since last activity
      // and we haven't refreshed in the last 30 seconds
      if (timeSinceLastActivity > 10000) {
        // console.log(
        //   'Found stale pending operations, refreshing schedule...',
        //   state.pendingOperations
        // );
        loadScheduleData()
      }
    }
  }, [state.pendingOperations, state.lastUpdated, loadScheduleData])

  const contextValue: ScheduleContextType = {
    state,
    dispatch,
    refreshSchedule,
  }

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  )
}

/**
 * Hook to use schedule context
 */
export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext)

  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider')
  }

  return context
}
