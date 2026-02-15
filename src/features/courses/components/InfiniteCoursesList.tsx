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

interface InfiniteCoursesListProps {
  isAuthenticated: boolean
  search?: string
  sortBy?: string
  sortOrder?: string
  filters?: FilterState
  onMobileFilterOpen?: () => void
}

type SortOption = 'code' | 'name'

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

export function InfiniteCoursesList({
  isAuthenticated,
  search,
  sortBy,
  sortOrder,
  filters,
  onMobileFilterOpen,
}: InfiniteCoursesListProps) {
  const [totalCoursesInDb, setTotalCoursesInDb] = useState<number | null>(null)
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

  useEffect(() => {
    const fetchTotalCount = async () => {
      try {
        const response = await fetch('/api/courses/count')
        const data = await response.json()
        if (data.success) {
          setTotalCoursesInDb(data.totalCount)
        }
      } catch (error) {
        console.error('Failed to fetch total course count:', error)
      }
    }
    fetchTotalCount()
  }, [])

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

  // Check if any filters are active (excluding search)
  const hasActiveFilters = useMemo(() => {
    if (filters) {
      return (Object.keys(filters) as Array<keyof FilterState>).some((key) => {
        const filterValue = filters[key]
        if (key === 'examinations') {
          return Object.values(filterValue).some(
            (state) => state !== 'unchecked',
          )
        }
        return Array.isArray(filterValue) && filterValue.length > 0
      })
    }
    return false
  }, [filters])

  // Track if we've received a definitive response (either data or confirmed empty)
  const [hasReceivedResponse, setHasReceivedResponse] = useState(false)

  // Reset response state when search/filters change
  useEffect(() => {
    setHasReceivedResponse(false)
  }, [search, filters])

  // Mark as received response when we get data or finish loading
  useEffect(() => {
    if (!loading && !isLoadingMore) {
      setHasReceivedResponse(true)
    }
  }, [loading, isLoadingMore])

  // Always show skeletons if this is the initial load and we have no courses yet
  if (
    ((loading || isLoadingMore) && courses.length === 0) ||
    (!hasReceivedResponse && courses.length === 0)
  ) {
    return (
      <div className="space-y-6">
        {/* Mobile Layout - Filter/Sort buttons first, then loading text */}
        <div className="space-y-4 lg:hidden">
          {/* Small screens: controls first, then text below */}
          <div className="space-y-4 sm:hidden">
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button - only show on mobile */}
              {onMobileFilterOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMobileFilterOpen}
                  className="h-8 gap-2 px-3"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      •
                    </span>
                  )}
                </Button>
              )}

              {/* Sorting Controls */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">
                  Sortera efter:
                </span>
                <Select
                  value={currentSortBy}
                  onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                  onClick={() =>
                    setCurrentSortOrder(
                      currentSortOrder === 'asc' ? 'desc' : 'asc',
                    )
                  }
                  className="h-8 px-2 text-xs"
                >
                  {currentSortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>

            {/* Loading text below buttons on very small screens */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {loading || isLoadingMore
                  ? search
                    ? `Söker efter "${search}"...`
                    : 'Laddar kurser...'
                  : 'Söker efter kurser...'}
              </span>
            </div>
          </div>

          {/* Medium screens: text on left, controls on right */}
          <div className="hidden items-center justify-between sm:flex">
            {/* Loading text on the left */}
            <div className="flex items-center gap-4 text-sm text-muted-foreground">
              <span>
                {loading || isLoadingMore
                  ? search
                    ? `Söker efter "${search}"...`
                    : 'Laddar kurser...'
                  : 'Söker efter kurser...'}
              </span>
            </div>

            {/* Filter and Sort controls on the right */}
            <div className="flex items-center gap-4">
              {/* Mobile Filter Button - only show on mobile */}
              {onMobileFilterOpen && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onMobileFilterOpen}
                  className="h-8 gap-2 px-3"
                >
                  <Filter className="h-4 w-4" />
                  Filter
                  {hasActiveFilters && (
                    <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                      •
                    </span>
                  )}
                </Button>
              )}

              {/* Sorting Controls */}
              <div className="flex items-center gap-2 text-sm">
                <span className="text-xs text-muted-foreground">
                  Sortera efter:
                </span>
                <Select
                  value={currentSortBy}
                  onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                  onClick={() =>
                    setCurrentSortOrder(
                      currentSortOrder === 'asc' ? 'desc' : 'asc',
                    )
                  }
                  className="h-8 px-2 text-xs"
                >
                  {currentSortOrder === 'asc' ? '↑' : '↓'}
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop Layout - Loading text and controls in one row */}
        <div className="hidden items-center justify-between lg:flex">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              {loading || isLoadingMore
                ? search
                  ? `Söker efter "${search}"...`
                  : 'Laddar kurser...'
                : 'Söker efter kurser...'}
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Button - only show on mobile */}
            {onMobileFilterOpen && (
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
            )}

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted-foreground">
                Sortera efter:
              </span>
              <Select
                value={currentSortBy}
                onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                onClick={() =>
                  setCurrentSortOrder(
                    currentSortOrder === 'asc' ? 'desc' : 'asc',
                  )
                }
                className="h-8 px-2 text-xs"
              >
                {currentSortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        {/* Skeleton cards with same responsive grid as regular cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-2 lg:gap-6 xl:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    )
  } // Error state
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

  // Empty state - only show when we've confirmed there are no courses after loading
  if (
    !loading &&
    !isLoadingMore &&
    courses.length === 0 &&
    !error &&
    hasReceivedResponse
  ) {
    return (
      <div className="space-y-6">
        {/* Results summary with sorting and view controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Visar 0{totalCoursesInDb !== null && ` av ${totalCoursesInDb}`}{' '}
              kurser
            </span>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Button - only show on mobile */}
            {onMobileFilterOpen && (
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
            )}

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted-foreground">
                Sortera efter:
              </span>
              <Select
                value={currentSortBy}
                onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                onClick={() =>
                  setCurrentSortOrder(
                    currentSortOrder === 'asc' ? 'desc' : 'asc',
                  )
                }
                className="h-8 px-2 text-xs"
              >
                {currentSortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

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

  return (
    <div className="space-y-6">
      {/* Mobile Layout - Filter/Sort buttons first, then course count */}
      <div className="space-y-4 lg:hidden">
        {/* Small screens: text below controls */}
        <div className="space-y-4 sm:hidden">
          <div className="flex items-center justify-between">
            {/* Mobile Filter Button */}
            {onMobileFilterOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMobileFilterOpen}
                className="h-8 gap-2 px-3"
              >
                <Filter className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    •
                  </span>
                )}
              </Button>
            )}

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted-foreground">
                Sortera efter:
              </span>
              <Select
                value={currentSortBy}
                onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                onClick={() =>
                  setCurrentSortOrder(
                    currentSortOrder === 'asc' ? 'desc' : 'asc',
                  )
                }
                className="h-8 px-2 text-xs"
              >
                {currentSortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>

          {/* Course count below buttons on very small screens */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Visar {totalCount ?? courses.length}
              {totalCoursesInDb !== null && ` av ${totalCoursesInDb}`} kurser
            </span>
          </div>
        </div>

        {/* Medium screens: text on left, controls on right */}
        <div className="hidden items-center justify-between sm:flex">
          {/* Course count on the left */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>
              Visar {totalCount ?? courses.length}
              {totalCoursesInDb !== null && ` av ${totalCoursesInDb}`} kurser
            </span>
          </div>

          {/* Filter and Sort controls on the right */}
          <div className="flex items-center gap-4">
            {/* Mobile Filter Button */}
            {onMobileFilterOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMobileFilterOpen}
                className="h-8 gap-2 px-3"
              >
                <Filter className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 rounded-full bg-primary px-1.5 py-0.5 text-xs text-primary-foreground">
                    •
                  </span>
                )}
              </Button>
            )}

            {/* Sorting Controls */}
            <div className="flex items-center gap-2 text-sm">
              <span className="text-xs text-muted-foreground">
                Sortera efter:
              </span>
              <Select
                value={currentSortBy}
                onValueChange={(value: SortOption) => setCurrentSortBy(value)}
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
                onClick={() =>
                  setCurrentSortOrder(
                    currentSortOrder === 'asc' ? 'desc' : 'asc',
                  )
                }
                className="h-8 px-2 text-xs"
              >
                {currentSortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop Layout - Course count and controls in one row */}
      <div className="hidden items-center justify-between lg:flex">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Visar {totalCount ?? courses.length}
            {totalCoursesInDb !== null && ` av ${totalCoursesInDb}`} kurser
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Filter Button - only show on mobile */}
          {onMobileFilterOpen && (
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
          )}

          {error && (
            <div className="text-sm text-destructive">
              Fel vid hämtning av fler kurser
            </div>
          )}

          {/* Sorting Controls */}
          <div className="flex items-center gap-2 text-sm">
            <span className="text-xs text-muted-foreground">
              Sortera efter:
            </span>
            <Select
              value={currentSortBy}
              onValueChange={(value: SortOption) => setCurrentSortBy(value)}
            >
              <SelectTrigger className="h-8 w-32 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="code">Kurskod</SelectItem>
                <SelectItem value="name">Namn</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc')
              }
              className="h-8 px-2 text-xs"
            >
              {currentSortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Courses display - responsive grid */}
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
            <p className="mt-1 text-sm">
              Totalt {totalCount} av {totalCoursesInDb} kurser visade
            </p>
          )}
        </div>
      )}
    </div>
  )
}
