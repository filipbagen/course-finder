'use client';

import { useEnrolledCoursesStore } from './useEnrolledCoursesStore';

// This hook now reads from the global store.
export function useUserEnrollments() {
  const { enrolledCourses, loading, error } = useEnrolledCoursesStore();

  return { enrolledCourses, loading, error };
}
