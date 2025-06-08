'use client';

import { useState, useCallback, useEffect } from 'react';
import { FilterState } from '@/types/types';

const initialFilterState: FilterState = {
  semester: [],
  period: [],
  block: [],
  studyPace: [],
  courseLevel: [],
  mainFieldOfStudy: [],
  examinations: [],
  campus: [],
};

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [mobileFilters, setMobileFilters] =
    useState<FilterState>(initialFilterState);

  const handleFilterChange = useCallback(
    (
      filterType: keyof FilterState,
      value: string,
      isChecked: boolean,
      isMobile: boolean = false
    ) => {
      const updateFilters = (prev: FilterState) => {
        const updatedValues = isChecked
          ? [...prev[filterType], value]
          : prev[filterType].filter((v) => v !== value);

        return { ...prev, [filterType]: updatedValues };
      };

      if (isMobile) {
        setMobileFilters(updateFilters);
      } else {
        setFilters(updateFilters);
      }
    },
    []
  );

  const applyMobileFilters = useCallback(() => {
    setFilters(mobileFilters);
  }, [mobileFilters]);

  const resetMobileFilters = useCallback(() => {
    setMobileFilters(filters);
  }, [filters]);

  const resetAllFilters = useCallback(() => {
    setFilters(initialFilterState);
    setMobileFilters(initialFilterState);
  }, []);

  const hasActiveFilters = Object.values(filters).some(
    (filterArray) => filterArray.length > 0
  );

  return {
    filters,
    mobileFilters,
    handleFilterChange,
    applyMobileFilters,
    resetMobileFilters,
    resetAllFilters,
    hasActiveFilters,
  };
}
