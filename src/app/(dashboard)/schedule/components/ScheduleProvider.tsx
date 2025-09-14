'use client';

import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScheduleService } from '../services/scheduleService';
import { toast } from 'sonner';
import { useEnrolledCoursesStore } from '@/hooks/useEnrolledCoursesStore';
import { useAuth } from '@/components/providers/AuthProvider';
import { CourseWithEnrollment } from '@/types/types';

interface ScheduleContextType {
  loading: boolean;
  error: string | null;
  loadSchedule: () => Promise<void>;
  moveCourse: (
    courseId: string,
    fromSemester: number,
    toSemester: number,
    period: number
  ) => Promise<void>;
  removeCourse: (enrollmentId: string) => Promise<void>;
  refreshSchedule: () => Promise<void>;
}

const ScheduleContext = createContext<ScheduleContextType | null>(null);

interface ScheduleProviderProps {
  children: React.ReactNode;
  userId?: string;
  readonly?: boolean;
}

export function ScheduleProvider({
  children,
  userId,
  readonly = false,
}: ScheduleProviderProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { setEnrolledCourses, removeCourse: removeFromStore } =
    useEnrolledCoursesStore();
  const { user } = useAuth();

  const loadSchedule = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const scheduleData = await ScheduleService.fetchSchedule(userId);

      const allCourses = [
        ...scheduleData.semester7.period1,
        ...scheduleData.semester7.period2,
        ...scheduleData.semester8.period1,
        ...scheduleData.semester8.period2,
        ...scheduleData.semester9.period1,
        ...scheduleData.semester9.period2,
      ];

      setEnrolledCourses(allCourses);
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : 'Failed to load schedule';
      setError(errorMessage);
      toast.error(`Error loading schedule: ${errorMessage}`);
    } finally {
      setLoading(false);
    }
  }, [userId, setEnrolledCourses]);

  const moveCourse = useCallback(
    async (
      courseId: string,
      fromSemester: number,
      toSemester: number,
      period: number
    ) => {
      if (readonly) return;

      setLoading(true);
      setError(null);

      try {
        console.log('Moving course:', {
          courseId,
          fromSemester,
          toSemester,
          period,
        });

        const updatedCourse = await ScheduleService.updateCourseSchedule({
          courseId,
          semester: toSemester,
          period,
        });

        console.log('Course moved successfully:', updatedCourse);

        // Update the enrolled courses store
        const currentCourses =
          useEnrolledCoursesStore.getState().enrolledCourses;
        const updatedCourses = currentCourses.map((course) =>
          course.id === courseId
            ? {
                ...course,
                enrollment: {
                  ...course.enrollment,
                  semester: toSemester,
                },
              }
            : course
        );
        setEnrolledCourses(updatedCourses);

        toast.success('Course moved successfully');
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to move course';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error moving course:', err);
      } finally {
        setLoading(false);
      }
    },
    [readonly, setEnrolledCourses]
  );

  const removeCourse = useCallback(
    async (enrollmentId: string) => {
      if (readonly) return;

      setLoading(true);
      setError(null);

      try {
        console.log('Removing course with enrollmentId:', enrollmentId);

        const result = await ScheduleService.removeCourseFromSchedule(
          enrollmentId
        );

        if (result.success || result.alreadyRemoved) {
          // Update the store
          removeFromStore(enrollmentId);
          toast.success('Course removed from schedule');
        } else {
          throw new Error('Failed to remove course');
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to remove course';
        setError(errorMessage);
        toast.error(errorMessage);
        console.error('Error removing course:', err);
      } finally {
        setLoading(false);
      }
    },
    [readonly, removeFromStore]
  );

  const refreshSchedule = useCallback(async () => {
    await loadSchedule();
  }, [loadSchedule]);

  const contextValue: ScheduleContextType = {
    loading,
    error,
    loadSchedule,
    moveCourse,
    removeCourse,
    refreshSchedule,
  };

  return (
    <ScheduleContext.Provider value={contextValue}>
      {children}
    </ScheduleContext.Provider>
  );
}

export function useSchedule(): ScheduleContextType {
  const context = useContext(ScheduleContext);

  if (!context) {
    throw new Error('useSchedule must be used within a ScheduleProvider');
  }

  return context;
}
