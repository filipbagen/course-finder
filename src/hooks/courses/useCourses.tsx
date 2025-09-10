import { useState, useEffect, useCallback } from 'react';
import { Course, FilterState, TriState } from '@/types/types';

// This is a custom hook that fetches courses from the API, based on the search query, sort order, and filters.
export const useCourses = (
  searchQuery: string,
  sortOrder: string,
  filters: FilterState
) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch courses from the API based on the search query, sort order, and filters
  const fetchData = useCallback(async () => {
    const query = new URLSearchParams();
    if (searchQuery) query.append('q', searchQuery);
    if (sortOrder) query.append('sort', sortOrder);
    Object.entries(filters).forEach(([key, values]) => {
      if (key === 'examinations') {
        // Handle examinations separately as it's a Record<string, TriState>
        const examValues = Object.entries(values as Record<string, TriState>)
          .filter(([, state]) => state === 'checked')
          .map(([exam]) => exam);
        if (examValues.length) {
          query.append(key, examValues.join(','));
        }
      } else if (Array.isArray(values) && values.length) {
        query.append(key, values.join(','));
      }
    });
    try {
      const response = await fetch(`/api/search?${query.toString()}`);
      if (!response.ok)
        throw new Error('Failed to fetch: ' + response.statusText);
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoading(false);
    }
  }, [searchQuery, sortOrder, filters]); // Include all dependencies here

  useEffect(() => {
    fetchData().catch(console.error);
  }, [fetchData]); // Include fetchData as a dependency

  return { courses, loading };
};
