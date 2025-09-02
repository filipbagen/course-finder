import { useState, useEffect } from 'react';

interface UseFieldsReturn {
  mainFieldOfStudy: string[];
  loading: boolean;
  error: string | null;
}

/**
 * Hook to fetch available field values for filtering
 * This provides dynamic filter options based on actual course data
 */
export function useFields(): UseFieldsReturn {
  const [mainFieldOfStudy, setMainFieldOfStudy] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchFields = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses/fields');

        if (!response.ok) {
          console.error('Field API response not OK:', response.status);
          setMainFieldOfStudy([]);
          return;
        }

        const data = await response.json();

        if (data.success && data.data && data.data.mainFieldOfStudy) {
          setMainFieldOfStudy(data.data.mainFieldOfStudy);
        } else {
          console.warn('Unexpected API response format:', data);
          // Instead of throwing an error, just set empty array and log warning
          setMainFieldOfStudy([]);
        }
      } catch (err) {
        console.error('Error fetching fields:', err);
        // Don't set error state, just log it and continue with empty array
        setMainFieldOfStudy([]);
      } finally {
        setLoading(false);
      }
    };

    fetchFields();
  }, []);

  return { mainFieldOfStudy, loading, error };
}
