'use client'

import React, { useEffect, useMemo, useState } from 'react'
import CourseCard from '@/features/courses/components/CourseCard'
import { useInfiniteCourses } from '@/features/courses/hooks/useInfiniteCourses'
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver'
import { FilterState } from '@/types/types'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { RefreshCw, Loader2, Filter } from 'lucide-react'
import type { CourseSortColumn } from '@/lib/validation'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface InfiniteCoursesListProps {
  isAuthenticated: boolean
  search?: string
  sortBy?: string
  sortOrder?: string
  filters?: FilterState
  onMobileFilterOpen?: () => void
}

type SortOption = CourseSortColumn

// ---------------------------------------------------------------------------
// Small sub-components
// ---------------------------------------------------------------------------

const CourseCardSkeleton = () => (
  <div className="space-y-3">
    <div className="rounded-lg border p-6">
      <div className="mb-4 flex items-start justify-between">
        <div className="flex-1 space-y-2">
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <Skeleton className="h-8 w-8 rounded" />
      </div>
      <div className="space-y-3">
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/3" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-4 w-4" />
          <Skeleton className="h-4 w-1/4" />
        </div>
        <div className="flex items-center justify-between pt-2">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  </div>
)

const LoadingSpinner = () => (
  <div className="flex items-center justify-center py-4">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Laddar fler kurser...</span>
    </div>
  </div>
)

const LoadMoreTrigger = ({
  onLoadMore,
  isLoading,
}: {
  onLoadMore: () => void
  isLoading: boolean
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
    enabled: !isLoading,
  })

  useEffect(() => {
    if (isIntersecting && !isLoading) {
      onLoadMore()
    }
  }, [isIntersecting, isLoading, onLoadMore])

  return (
    <div ref={ref} className="py-8">
      {isLoading && <LoadingSpinner />}
    </div>
  )
}

// ---------------------------------------------------------------------------
// CourseListToolbar -- single source of truth for sorting / filter controls
// ---------------------------------------------------------------------------

interface CourseListToolbarProps {
  /** Text shown on the left side (e.g. "Visar 42 kurser" or "Laddar...") */
  statusText: string
  sortBy: SortOption
  sortOrder: 'asc' | 'desc'
  onSortByChange: (value: SortOption) => void
  onSortOrderToggle: () => void
  hasActiveFilters: boolean
  onMobileFilterOpen?: () => void
  /** Optional error text shown inline (only on desktop row). */
  inlineError?: string | null
}

/**
 * Responsive toolbar with sort controls + optional filter button.
 *
 * Three responsive layouts that all render from the same data:
 * - xs (< sm):  controls row, then status text below
 * - sm-lg:      status text left, controls right (filter button visible)
 * - lg+:        status text left, controls right (filter button hidden,
 *               desktop sidebar is visible)
 */
const CourseListToolbar = ({
  statusText,
  sortBy,
  sortOrder,
  onSortByChange,
  onSortOrderToggle,
  hasActiveFilters,
  onMobileFilterOpen,
  inlineError,
}: CourseListToolbarProps) => {
  const filterButton = onMobileFilterOpen && (
    <Button
      variant="outline"
      size="sm"
      onClick={onMobileFilterOpen}
      className="h-8 gap-2 px-3 lg:hidden"
    >
      <Filter className="h-4 w-4" />
      Filter
      {hasActiveFilters && (
        <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
          •
        </span>
      )}
    </Button>
  )

  const sortControls = (
    <div className="flex items-center gap-2 text-sm">
      <span className="text-xs text-muted-foreground">Sortera efter:</span>
      <Select
        value={sortBy}
        onValueChange={(v: string) => onSortByChange(v as SortOption)}
      >
        <SelectTrigger className="h-8 w-32 text-xs">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="code">Kurskod</SelectItem>
          <SelectItem value="name">Namn</SelectItem>
          <SelectItem value="credits">Poäng</SelectItem>
          <SelectItem value="semester">Termin</SelectItem>
        </SelectContent>
      </Select>
      <Button
        variant="ghost"
        size="sm"
        onClick={onSortOrderToggle}
        className="h-8 px-2 text-xs"
      >
        {sortOrder === 'asc' ? '↑' : '↓'}
      </Button>
    </div>
  )

  const statusSpan = (
    <span className="text-sm text-muted-foreground">{statusText}</span>
  )

  return (
    <>
      {/* xs (< sm): controls row, status text below */}
      <div className="space-y-4 sm:hidden">
        <div className="flex items-center justify-between gap-4">
          {filterButton}
          {sortControls}
        </div>
        {statusSpan}
      </div>

      {/* sm – lg: status left, controls right */}
      <div className="hidden items-center justify-between sm:flex lg:hidden">
        {statusSpan}
        <div className="flex items-center gap-4">
          {filterButton}
          {sortControls}
        </div>
      </div>

      {/* lg+: status left, controls right (filter button auto-hidden via lg:hidden) */}
      <div className="hidden items-center justify-between lg:flex">
        <div className="flex items-center gap-4">
          {statusSpan}
          {inlineError && (
            <span className="text-sm text-destructive">{inlineError}</span>
          )}
        </div>
        <div className="flex items-center gap-4">
          {filterButton}
          {sortControls}
        </div>
      </div>
    </>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function InfiniteCoursesList({
  isAuthenticated,
  search,
  sortBy,
  sortOrder,
  filters,
  onMobileFilterOpen,
}: InfiniteCoursesListProps) {
  const [currentSortBy, setCurrentSortBy] = useState<SortOption>(
    (sortBy as SortOption) || 'code',
  )
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(
    (sortOrder as 'asc' | 'desc') || 'asc',
  )

  const {
    courses,
    loading,
    error,
    hasNextPage,
    loadMore,
    refresh,
    totalCount,
    isLoadingMore,
  } = useInfiniteCourses({
    search,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
    filters,
    limit: 20,
  })

  const coursesDisplay = useMemo(() => {
    return courses.map((course) => (
      <CourseCard
        key={`course-${course.id}`}
        course={course}
        isAuthenticated={isAuthenticated}
        variant="default"
        className="flex h-full flex-col justify-between"
      />
    ))
  }, [courses, isAuthenticated])

  const hasActiveFilters = useMemo(() => {
    if (!filters) return false
    return (Object.keys(filters) as Array<keyof FilterState>).some((key) => {
      const filterValue = filters[key]
      if (key === 'examinations') {
        return Object.values(filterValue).some((state) => state !== 'unchecked')
      }
      return Array.isArray(filterValue) && filterValue.length > 0
    })
  }, [filters])

  // Track whether the first response has arrived so we can distinguish
  // "still loading" from "truly empty results".
  const [hasReceivedResponse, setHasReceivedResponse] = useState(false)

  useEffect(() => {
    setHasReceivedResponse(false)
  }, [search, filters])

  useEffect(() => {
    if (!loading && !isLoadingMore) {
      setHasReceivedResponse(true)
    }
  }, [loading, isLoadingMore])

  // Shared toolbar props
  const toolbarBase = {
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
    onSortByChange: setCurrentSortBy,
    onSortOrderToggle: () =>
      setCurrentSortOrder((o) => (o === 'asc' ? 'desc' : 'asc')),
    hasActiveFilters,
    onMobileFilterOpen,
  } satisfies Omit<CourseListToolbarProps, 'statusText'>

  // ---- Loading state (initial, no courses yet) ----
  if (
    ((loading || isLoadingMore) && courses.length === 0) ||
    (!hasReceivedResponse && courses.length === 0)
  ) {
    const loadingText =
      loading || isLoadingMore
        ? search
          ? `Söker efter "${search}"...`
          : 'Laddar kurser...'
        : 'Söker efter kurser...'

    return (
      <div className="space-y-6">
        <CourseListToolbar {...toolbarBase} statusText={loadingText} />

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  }

  // ---- Error state (no courses loaded at all) ----
  if (error && courses.length === 0) {
    return (
      <div className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            Fel vid hämtning av kurser: {error}
          </AlertDescription>
        </Alert>
        <div className="flex justify-center">
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="mr-2 h-4 w-4" />
            Försök igen
          </Button>
        </div>
      </div>
    )
  }

  // ---- Empty state ----
  if (
    !loading &&
    !isLoadingMore &&
    courses.length === 0 &&
    !error &&
    hasReceivedResponse
  ) {
    return (
      <div className="space-y-6">
        <CourseListToolbar
          {...toolbarBase}
          statusText={`Visar 0${totalCount !== null ? ` av ${totalCount}` : ''} kurser`}
        />

        <div className="py-8 text-center">
          <h3 className="mb-2 text-lg font-medium text-foreground">
            Inga kurser hittades
          </h3>
          <p className="mb-4 text-muted-foreground">
            {hasActiveFilters
              ? 'Inga kurser matchar dina filterkriterier.'
              : 'Det verkar som att det inte finns några kurser att visa just nu.'}
          </p>
          {hasActiveFilters && (
            <Button onClick={refresh} variant="outline">
              <RefreshCw className="mr-2 h-4 w-4" />
              Rensa filter
            </Button>
          )}
        </div>
      </div>
    )
  }

  // ---- Normal state (courses loaded) ----
  const displayCount = totalCount ?? courses.length

  return (
    <div className="space-y-6">
      <CourseListToolbar
        {...toolbarBase}
        statusText={`Visar ${displayCount} kurser`}
        inlineError={error ? 'Fel vid hämtning av fler kurser' : null}
      />

      {/* Course grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
        {coursesDisplay}
      </div>

      {/* Load more trigger */}
      {hasNextPage && (
        <LoadMoreTrigger onLoadMore={loadMore} isLoading={isLoadingMore} />
      )}

      {/* End message */}
      {!hasNextPage && courses.length > 0 && (
        <div className="py-8 text-center text-muted-foreground">
          <p>Du har nått slutet av kurslistan</p>
          {totalCount !== null && (
            <p className="mt-1 text-sm">Totalt {totalCount} kurser visade</p>
          )}
        </div>
      )}
    </div>
  )
}
