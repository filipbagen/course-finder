'use client'

import { useEffect, useRef } from 'react'
import { useEnrolledCoursesStore } from './useEnrolledCoursesStore'
import { useAuth } from '@/components/providers/AuthProvider'

/**
 * Hook that exposes the user's enrolled courses.
 *
 * Reads from the global Zustand store. If the store hasn't been populated yet
 * (e.g. the user navigated directly to the courses page without visiting the
 * schedule first), it fetches enrolled courses from `/api/enrollment` so that
 * features like exclusion-conflict detection work on every page.
 */
export function useUserEnrollments() {
  const { enrolledCourses, loading, error, setEnrolledCourses, setLoading } =
    useEnrolledCoursesStore()
  const { isAuthenticated } = useAuth()
  const fetchAttempted = useRef(false)

  useEffect(() => {
    // Only fetch when the store is still in its initial state (loading + empty)
    // and we haven't already tried fetching in this mount cycle.
    if (
      isAuthenticated &&
      enrolledCourses.length === 0 &&
      loading &&
      !fetchAttempted.current
    ) {
      fetchAttempted.current = true

      fetch('/api/enrollment', { credentials: 'include' })
        .then((res) => res.json())
        .then((data) => {
          if (data.success && data.data?.courses) {
            setEnrolledCourses(data.data.courses)
          }
          setLoading(false)
        })
        .catch((err) => {
          console.error('Failed to fetch enrollments:', err)
          setLoading(false)
        })
    } else if (!isAuthenticated && loading) {
      // Not logged in -- nothing to load
      setLoading(false)
    }
  }, [
    isAuthenticated,
    enrolledCourses.length,
    loading,
    setEnrolledCourses,
    setLoading,
  ])

  return { enrolledCourses, loading, error }
}
