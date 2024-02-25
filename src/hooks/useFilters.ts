// useFilters.ts
import { useState, useCallback } from 'react';
import { SelectedFilters } from '../types/types'; // import the type

export function useFilters(initialFilters: SelectedFilters) {
  const [selectedFilters, setSelectedFilters] =
    useState<SelectedFilters>(initialFilters);
  const [checkedStatus, setCheckedStatus] = useState<
    Record<string, Record<string | number, boolean>>
  >({});

  const handleFilterChange = useCallback(
    (filterType: keyof SelectedFilters, value: number | string) =>
      (checked: boolean) => {
        setSelectedFilters((prevFilters) => {
          const currentFilterValues = prevFilters[filterType] as (
            | number
            | string
          )[];
          if (checked) {
            return {
              ...prevFilters,
              [filterType]: [...currentFilterValues, value],
            };
          } else {
            return {
              ...prevFilters,
              [filterType]: currentFilterValues.filter(
                (item) => item !== value
              ),
            };
          }
        });

        setCheckedStatus((prevStatus) => ({
          ...prevStatus,
          [filterType]: { ...(prevStatus[filterType] || {}), [value]: checked },
        }));
      },
    []
  );

  const resetFilters = () => {
    setSelectedFilters(initialFilters);
    setCheckedStatus({});
  };

  return { selectedFilters, checkedStatus, handleFilterChange, resetFilters };
}
