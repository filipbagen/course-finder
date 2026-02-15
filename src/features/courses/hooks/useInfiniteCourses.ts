import { useState, useEffect, useCallback, useRef } from 'react'
import { Course, FilterState, TriState } from '@/types/types'
import { InfiniteResponse } from '@/types/api'

interface UseInfiniteCoursesParams {
  search?: string
  sortBy?: string
  sortOrder?: string
  limit?: number
  filters?: FilterState
}

interface UseInfiniteCoursesReturn {
  courses: Course[]
  loading: boolean
  error: string | null
  hasNextPage: boolean
  loadMore: () => void
  refresh: () => void
  totalCount: number | null
  isLoadingMore: boolean
}

export function useInfiniteCourses(
  params: UseInfiniteCoursesParams = {},
): UseInfiniteCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isLoadingMore, setIsLoadingMore] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [nextCursor, setNextCursor] = useState<string | null>(null)
  const [hasNextPage, setHasNextPage] = useState(false)
  const [totalCount, setTotalCount] = useState<number | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)

  const {
    search,
    sortBy = 'code',
    sortOrder = 'asc',
    limit = 20,
    filters,
  } = params

  const buildQueryParams = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams()

      if (cursor) params.set('cursor', cursor)
      params.set('limit', limit.toString())
      if (search) params.set('search', search)
      if (sortBy) params.set('sortBy', sortBy)
      if (sortOrder) params.set('sortOrder', sortOrder)

      if (filters) {
        if (filters.campus.length > 0) {
          params.set('campus', filters.campus.join('|'))
        }
        if (filters.mainFieldOfStudy.length > 0) {
          params.set('mainFieldOfStudy', filters.mainFieldOfStudy.join(','))
        }
        if (filters.semester.length > 0) {
          params.set('semester', filters.semester.join(','))
        }
        if (filters.period.length > 0) {
          params.set('period', filters.period.join(','))
        }
        if (filters.block.length > 0) {
          params.set('block', filters.block.join(','))
        }
        if (filters.studyPace.length > 0) {
          params.set('studyPace', filters.studyPace.join(','))
        }
        if (filters.courseLevel.length > 0) {
          params.set('courseLevel', filters.courseLevel.join(','))
        }

        const activeExaminationFilters = Object.entries(filters.examinations)
          .filter(([, state]) => state !== 'unchecked')
          .reduce(
            (acc, [key, state]) => {
              acc[key] = state
              return acc
            },
            {} as Record<string, TriState>,
          )

        if (Object.keys(activeExaminationFilters).length > 0) {
          params.set('examinations', JSON.stringify(activeExaminationFilters))
        }
      }

      return params.toString()
    },
    [search, sortBy, sortOrder, limit, filters],
  )

  const fetchCourses = useCallback(
    async (cursor?: string | null, isLoadMore = false) => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
      abortControllerRef.current = new AbortController()

      if (!isLoadMore) {
        setLoading(true)
        setError(null)
      } else {
        setIsLoadingMore(true)
      }

      try {
        const queryParams = buildQueryParams(cursor)
        const response = await fetch(`/api/courses/infinite?${queryParams}`, {
          signal: abortControllerRef.current.signal,
        })

        if (!response.ok) {
          let errorDetails = ''
          try {
            const errorResponse = await response.json()
            errorDetails = errorResponse.error || errorResponse.message || ''
          } catch {
            // Ignore if parsing fails
          }
          throw new Error(
            `HTTP error! status: ${response.status}${
              errorDetails ? ` - ${errorDetails}` : ''
            }`,
          )
        }

        const result: InfiniteResponse<Course> = await response.json()
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch courses')
        }

        const data = result.data || []
        if (isLoadMore) {
          setCourses((prev) => [...prev, ...data])
        } else {
          setCourses(data)
          if (result.totalCount !== null && result.totalCount !== undefined) {
            setTotalCount(result.totalCount)
          }
        }

        setNextCursor(result.nextCursor || null)
        setHasNextPage(result.hasNextPage)
        setError(null)
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          return // Request was aborted, ignore
        }
        const errorMessage =
          err instanceof Error ? err.message : 'Failed to fetch courses'
        setError(errorMessage)
      } finally {
        setLoading(false)
        setIsLoadingMore(false)
      }
    },
    [buildQueryParams],
  )

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && nextCursor) {
      fetchCourses(nextCursor, true)
    }
  }, [hasNextPage, isLoadingMore, nextCursor, fetchCourses])

  const refresh = useCallback(() => {
    setCourses([])
    setNextCursor(null)
    setHasNextPage(false)
    setTotalCount(null)
    fetchCourses(null, false)
  }, [fetchCourses])

  useEffect(() => {
    refresh()
  }, [search, sortBy, sortOrder, limit, filters, refresh])

  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }
    }
  }, [])

  return {
    courses,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh,
    totalCount,
    isLoadingMore,
  }
}
