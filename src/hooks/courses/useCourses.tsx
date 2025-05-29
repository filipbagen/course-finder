import { useState, useEffect, useCallback } from 'react';
import { Course, FilterState } from '@/types/types';

// This is a custom hook that fetches courses from the API, based on the search query, sort order, and filters.
export const useCourses = (
  searchQuery: string,
  sortOrder: string,
  filters: FilterState
) => {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    fetchData().catch(console.error);
  }, [searchQuery, sortOrder, filters]);

  // Fetch courses from the API based on the search query, sort order, and filters
  const fetchData = useCallback(async () => {
    const query = new URLSearchParams();
    if (searchQuery) query.append('q', searchQuery);
    if (sortOrder) query.append('sort', sortOrder);
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) {
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
