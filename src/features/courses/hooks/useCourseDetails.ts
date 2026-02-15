'use client'

import { useState, useCallback } from 'react'
import { Course } from '@/types/types'

export function useCourseDetails() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourseDetails = useCallback(
    async (courseId: string): Promise<Course | null> => {
      setLoading(true)
      setError(null)

      try {
        const response = await fetch(`/api/courses/${courseId}/details`)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new Error(
            errorData.error || `HTTP error! status: ${response.status}`,
          )
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch course details')
        }

        return result.data
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch course details'
        setError(errorMessage)
        return null
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  return {
    loading,
    error,
    fetchCourseDetails,
  }
}
