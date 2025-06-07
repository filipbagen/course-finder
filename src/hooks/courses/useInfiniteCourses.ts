import { useState, useEffect, useCallback, useRef } from 'react';
import { Course } from '@/types/types';

interface UseInfiniteCoursesParams {
  search?: string;
  campus?: string;
  mainFieldOfStudy?: string;
  semester?: string;
  sortBy?: string;
  sortOrder?: string;
  limit?: number;
}

interface CourseResponse {
  items: Course[];
  nextCursor: string | null;
  hasNextPage: boolean;
  totalCount: number | null;
  count: number;
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
    sortBy = 'code',
    sortOrder = 'asc',
    limit = 20,
  } = params;

  const buildQueryParams = useCallback(
    (cursor?: string | null) => {
      const params = new URLSearchParams();

      if (cursor) params.set('cursor', cursor);
      params.set('limit', limit.toString());
      if (search) params.set('search', search);
      if (campus) params.set('campus', campus);
      if (mainFieldOfStudy) params.set('mainFieldOfStudy', mainFieldOfStudy);
      if (semester) params.set('semester', semester);
      if (sortBy) params.set('sortBy', sortBy);
      if (sortOrder) params.set('sortOrder', sortOrder);

      return params.toString();
    },
    [search, campus, mainFieldOfStudy, semester, sortBy, sortOrder, limit]
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

        const data: CourseResponse = await response.json();

        if (isLoadMore) {
          setCourses((prev) => [...prev, ...data.items]);
        } else {
          setCourses(data.items);
          if (data.totalCount !== null) {
            setTotalCount(data.totalCount);
          }
        }

        setNextCursor(data.nextCursor);
        setHasNextPage(data.hasNextPage);
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
  }, [search, campus, mainFieldOfStudy, semester, sortBy, sortOrder, limit]);

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
