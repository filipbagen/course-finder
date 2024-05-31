import { useState, useEffect } from 'react';
import { Course, FilterState } from '@/app/utilities/types';

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
  const fetchData = async () => {
    const query = new URLSearchParams();
    if (searchQuery) query.append('q', searchQuery);
    if (sortOrder) query.append('sort', sortOrder);

    // Append each filter to the query string
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) {
        query.append(key, values.join(','));
      }
    });

    // Fetch courses from the API
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
  };

  return { courses, loading };
};
