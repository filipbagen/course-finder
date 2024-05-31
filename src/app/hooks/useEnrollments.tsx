import { useState, useEffect } from 'react';
import { Course } from '@/app/utilities/types';

// This is a custom hook that fetches the enrollments, from one user, from the API.
export const useEnrollments = () => {
  const [enrollments, setEnrollments] = useState<Course[]>([]);

  useEffect(() => {
    fetchEnrollments().catch(console.error);
  }, []);

  // Fetch the enrollments from the API
  const fetchEnrollments = async () => {
    try {
      const response = await fetch(`/api/enrollment`);
      if (!response.ok)
        throw new Error('Failed to fetch enrollments: ' + response.statusText);
      const data = await response.json();
      setEnrollments(data.courses);
    } catch (error) {
      console.error('Failed to fetch enrollments:', error);
    }
  };

  return { enrollments };
};
