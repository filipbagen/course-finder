'use client'

import { useState, useCallback } from 'react'
import { FilterState, TriState } from '@/types/types'

const initialFilterState: FilterState = {
  semester: [],
  period: [],
  block: [],
  studyPace: [],
  courseLevel: [],
  mainFieldOfStudy: [],
  examinations: {},
  campus: [],
}

export function useFilters() {
  const [filters, setFilters] = useState<FilterState>(initialFilterState)
  const [mobileFilters, setMobileFilters] =
    useState<FilterState>(initialFilterState)

  const handleFilterChange = useCallback(
    (
      filterType: keyof FilterState,
      value: string,
      newState: TriState | boolean,
      isMobile: boolean = false,
    ) => {
      const updateFilters = (prev: FilterState): FilterState => {
        const newFilters = { ...prev }

        if (filterType === 'examinations') {
          const newExaminations = { ...newFilters.examinations }
          // Ensure newState is a valid TriState for examinations
          if (newState === 'checked' || newState === 'indeterminate') {
            newExaminations[value] = newState
          } else {
            delete newExaminations[value] // Treat false or 'unchecked' as removal
          }
          return { ...newFilters, examinations: newExaminations }
        } else {
          const currentValues = newFilters[filterType] as string[]
          const isChecked = newState === 'checked' || newState === true
          const updatedValues = isChecked
            ? [...currentValues, value]
            : currentValues.filter((v) => v !== value)
          return { ...newFilters, [filterType]: updatedValues }
        }
      }

      if (isMobile) {
        setMobileFilters(updateFilters)
      } else {
        setFilters(updateFilters)
      }
    },
    [],
  )

  const applyMobileFilters = useCallback(() => {
    setFilters(mobileFilters)
  }, [mobileFilters])

  const syncMobileFilters = useCallback(() => {
    setMobileFilters(filters)
  }, [filters])

  const resetMobileFilters = useCallback(() => {
    setMobileFilters(filters)
  }, [filters])

  const resetAllFilters = useCallback(() => {
    setFilters(initialFilterState)
    setMobileFilters(initialFilterState)
  }, [])

  const hasActiveFilters =
    Object.values(filters).some(
      (filterValue) =>
        (Array.isArray(filterValue) && filterValue.length > 0) ||
        (typeof filterValue === 'object' &&
          Object.keys(filterValue).length > 0),
    ) || Object.keys(filters.examinations).length > 0

  return {
    filters,
    mobileFilters,
    handleFilterChange,
    applyMobileFilters,
    resetMobileFilters,
    resetAllFilters,
    hasActiveFilters,
    syncMobileFilters,
  }
}
