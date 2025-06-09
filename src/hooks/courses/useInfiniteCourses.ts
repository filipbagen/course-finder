import { useState, useEffect, useCallback, useRef } from 'react';
import { Course, FilterState } from '@/types/types';
import { InfiniteResponse } from '@/types/api';

interface UseInfiniteCoursesParams {
  search?: string;
  campus?: string;
  mainFieldOfStudy?: string;
  semester?: string;
  period?: string;
  block?: string;
  studyPace?: string;
  courseLevel?: string;
  examinations?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
  filters?: FilterState;
}

interface UseInfiniteCoursesReturn {
  courses: Course[];
  loading: boolean;
  error: string | null;
  hasNextPage: boolean;
  loadMore: () => void;
  refresh: () => void;
  totalCount: number | null;
  isLoadingMore: boolean;
}

export function useInfiniteCourses(
  params: UseInfiniteCoursesParams = {}
): UseInfiniteCoursesReturn {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasNextPage, setHasNextPage] = useState(false);
  const [totalCount, setTotalCount] = useState<number | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const {
    search,
    campus,
    mainFieldOfStudy,
    semester,
    period,
    block,
    studyPace,
    courseLevel,
    examinations,
    sortBy = 'code',
    sortOrder = 'asc',
    limit = 20,
    filters,
  } = params;

  const buildQueryParams = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams();

      if (cursor) params.set('cursor', cursor);
      params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);

      // Use filters object if provided, otherwise fall back to individual params
      if (filters) {
        if (filters.campus.length > 0) {
          params.set('campus', filters.campus.join(','));
        }
        if (filters.mainFieldOfStudy.length > 0) {
          params.set('mainFieldOfStudy', filters.mainFieldOfStudy.join(','));
        }
        if (filters.semester.length > 0) {
          params.set('semester', filters.semester.join(','));
        }
        if (filters.period.length > 0) {
          params.set('period', filters.period.join(','));
        }
        if (filters.block.length > 0) {
          params.set('block', filters.block.join(','));
        }
        if (filters.studyPace.length > 0) {
          params.set('studyPace', filters.studyPace.join(','));
        }
        if (filters.courseLevel.length > 0) {
          params.set('courseLevel', filters.courseLevel.join(','));
        }
        if (filters.examinations.length > 0) {
          params.set('examinations', filters.examinations.join(','));
        }
      } else {
        // Legacy individual parameter support
        if (campus) params.set('campus', campus);
        if (mainFieldOfStudy) params.set('mainFieldOfStudy', mainFieldOfStudy);
        if (semester) params.set('semester', semester);
        if (period) params.set('period', period);
        if (block) params.set('block', block);
        if (studyPace) params.set('studyPace', studyPace);
        if (courseLevel) params.set('courseLevel', courseLevel);
        if (examinations) params.set('examinations', examinations);
      }

      return params.toString();
    },
    [
      search,
      campus,
      mainFieldOfStudy,
      semester,
      period,
      block,
      studyPace,
      courseLevel,
      examinations,
      sortBy,
      sortOrder,
      limit,
      filters,
    ]
  );

  const fetchCourses = useCallback(
    async (cursor?: string | null, isLoadMore = false) => {
      try {
        // Cancel previous request
        if (abortControllerRef.current) {
          abortControllerRef.current.abort();
        }

        // Create new abort controller
        abortControllerRef.current = new AbortController();

        if (!isLoadMore) {
          setLoading(true);
          setError(null);
        } else {
          setIsLoadingMore(true);
        }

        const queryParams = buildQueryParams(cursor);
        const response = await fetch(`/api/courses/infinite?${queryParams}`, {
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result: InfiniteResponse<Course> = await response.json();

        // Handle API error response
        if (!result.success) {
          throw new Error(result.error || 'Failed to fetch courses');
        }

        // Extract data from the standardized response
        const data = result.data || [];

        if (isLoadMore) {
          setCourses((prev) => [...prev, ...data]);
        } else {
          setCourses(data);
          if (result.totalCount !== null && result.totalCount !== undefined) {
            setTotalCount(result.totalCount);
          }
        }

        setNextCursor(result.nextCursor || null);
        setHasNextPage(result.hasNextPage);
        setError(null);
      } catch (err) {
        if (err instanceof Error && err.name === 'AbortError') {
          // Request was aborted, ignore
          return;
        }

        console.error('Error fetching courses:', err);
        setError(
          err instanceof Error ? err.message : 'Failed to fetch courses'
        );
      } finally {
        setLoading(false);
        setIsLoadingMore(false);
      }
    },
    [buildQueryParams]
  );

  const loadMore = useCallback(() => {
    if (hasNextPage && !isLoadingMore && nextCursor) {
      fetchCourses(nextCursor, true);
    }
  }, [hasNextPage, isLoadingMore, nextCursor, fetchCourses]);

  const refresh = useCallback(() => {
    setCourses([]);
    setNextCursor(null);
    setHasNextPage(false);
    setTotalCount(null);
    fetchCourses(null, false);
  }, [fetchCourses]);

  // Initial fetch and refetch when parameters change
  useEffect(() => {
    refresh();
  }, [
    search,
    campus,
    mainFieldOfStudy,
    semester,
    period,
    block,
    studyPace,
    courseLevel,
    examinations,
    sortBy,
    sortOrder,
    limit,
    filters,
  ]);

  // Cleanup
  useEffect(() => {
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    courses,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh,
    totalCount,
    isLoadingMore,
  };
}
