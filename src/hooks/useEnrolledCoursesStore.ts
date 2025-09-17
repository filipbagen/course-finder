import { create } from 'zustand';
import { CourseWithEnrollment } from '@/types/types';
import { persist } from 'zustand/middleware';

interface EnrolledCoursesState {
  enrolledCourses: CourseWithEnrollment[];
  setEnrolledCourses: (courses: CourseWithEnrollment[]) => void;
  updateCourse: (
    courseId: string,
    updates: Partial<CourseWithEnrollment>
  ) => void;
  removeCourse: (enrollmentId: string) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
  lastUpdated: Date | null;
  version: number; // Used to track version for cache busting
}

export const useEnrolledCoursesStore = create<EnrolledCoursesState>()(
  persist(
    (set, get) => ({
      enrolledCourses: [],
      setEnrolledCourses: (courses) =>
        set({
          enrolledCourses: courses,
          lastUpdated: new Date(),
          version: get().version + 1,
        }),
      updateCourse: (courseId, updates) => {
        const courses = get().enrolledCourses;
        const updatedCourses = courses.map((course) =>
          course.id === courseId ? { ...course, ...updates } : course
        );
        set({
          enrolledCourses: updatedCourses,
          lastUpdated: new Date(),
          version: get().version + 1,
        });
      },
      removeCourse: (enrollmentId) => {
        const courses = get().enrolledCourses;
        const updatedCourses = courses.filter(
          (course) => course.enrollment?.id !== enrollmentId
        );
        set({
          enrolledCourses: updatedCourses,
          lastUpdated: new Date(),
          version: get().version + 1,
        });
      },
      loading: true,
      setLoading: (loading) => set({ loading }),
      error: null,
      setError: (error) => set({ error }),
      lastUpdated: null,
      version: 1, // Start at version 1
    }),
    {
      name: 'enrolled-courses-storage',
      // Only persist metadata, not the actual course data to avoid stale data issues
      partialize: (state) => ({
        lastUpdated: state.lastUpdated,
        version: state.version,
        // Don't persist enrolledCourses to avoid loading stale data on refresh
      }),
      // Clear persisted data on initialization to ensure fresh data from API
      onRehydrateStorage: () => (state) => {
        if (state) {
          // Clear any persisted course data on rehydration
          state.enrolledCourses = [];
          state.lastUpdated = null;
        }
      },
    }
  )
);
