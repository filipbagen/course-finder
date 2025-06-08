'use client';

import React, { useEffect, useMemo, useState } from 'react';
import CourseCard from '@/components/course/CourseCard';
import { useInfiniteCourses } from '@/hooks/courses/useInfiniteCourses';
import { useIntersectionObserver } from '@/hooks/useIntersectionObserver';
import { FilterState } from '@/types/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { RefreshCw, Loader2, Filter } from 'lucide-react';

interface InfiniteCoursesListProps {
  isAuthenticated: boolean;
  search?: string;
  campus?: string;
  mainFieldOfStudy?: string;
  semester?: string;
  sortBy?: string;
  sortOrder?: string;
  filters?: FilterState;
  onMobileFilterOpen?: () => void;
}

type SortOption = 'code' | 'name' | 'credits' | 'semester';

const CourseCardSkeleton = () => (
  <div className="space-y-3">
    <div className="p-6 border rounded-lg">
      <div className="flex justify-between items-start mb-4">
        <div className="space-y-2 flex-1">
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
        <div className="flex justify-between items-center pt-2">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>
      </div>
    </div>
  </div>
);

const LoadingSpinner = () => (
  <div className="flex justify-center items-center py-8">
    <div className="flex items-center gap-2 text-muted-foreground">
      <Loader2 className="h-5 w-5 animate-spin" />
      <span>Laddar kurser...</span>
    </div>
  </div>
);

const LoadMoreTrigger = ({
  onLoadMore,
  isLoading,
}: {
  onLoadMore: () => void;
  isLoading: boolean;
}) => {
  const { ref, isIntersecting } = useIntersectionObserver({
    threshold: 0.1,
    rootMargin: '200px',
    enabled: !isLoading,
  });

  useEffect(() => {
    if (isIntersecting && !isLoading) {
      onLoadMore();
    }
  }, [isIntersecting, isLoading, onLoadMore]);

  return (
    <div ref={ref} className="py-8">
      {isLoading && <LoadingSpinner />}
    </div>
  );
};

export function InfiniteCoursesList({
  isAuthenticated,
  search,
  campus,
  mainFieldOfStudy,
  semester,
  sortBy,
  sortOrder,
  filters,
  onMobileFilterOpen,
}: InfiniteCoursesListProps) {
  const [currentSortBy, setCurrentSortBy] = useState<SortOption>(
    (sortBy as SortOption) || 'code'
  );
  const [currentSortOrder, setCurrentSortOrder] = useState<'asc' | 'desc'>(
    (sortOrder as 'asc' | 'desc') || 'asc'
  );

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
    campus,
    mainFieldOfStudy,
    semester,
    sortBy: currentSortBy,
    sortOrder: currentSortOrder,
    filters,
    limit: 20,
  });

  const coursesDisplay = useMemo(() => {
    return courses.map((course) => (
      <CourseCard
        key={course.id}
        course={course}
        isAuthenticated={isAuthenticated}
        variant="default"
      />
    ));
  }, [courses, isAuthenticated]);

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    if (search) return true;
    if (campus || mainFieldOfStudy || semester) return true;
    if (filters) {
      return Object.values(filters).some(
        (filterArray: string[]) => filterArray.length > 0
      );
    }
    return false;
  }, [search, campus, mainFieldOfStudy, semester, filters]);

  // Loading state for initial load
  if (loading && courses.length === 0) {
    return (
      <div className="space-y-6">
        {/* Results summary with sorting and view controls */}
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span>Laddar kurser...</span>
          </div>

          <div className="flex items-center gap-4">
            {/* Mobile Filter Button - only show on mobile */}
            {onMobileFilterOpen && (
              <Button
                variant="outline"
                size="sm"
                onClick={onMobileFilterOpen}
                className="lg:hidden h-8 px-3 gap-2"
              >
                <Filter className="h-4 w-4" />
                Filter
                {hasActiveFilters && (
                  <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
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
                <SelectTrigger className="w-32 h-8 text-xs">
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
                    currentSortOrder === 'asc' ? 'desc' : 'asc'
                  )
                }
                className="h-8 px-2 text-xs"
              >
                {currentSortOrder === 'asc' ? '↑' : '↓'}
              </Button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <CourseCardSkeleton key={i} />
          ))}
        </div>
      </div>
    );
  }

  // Error state
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
            <RefreshCw className="h-4 w-4 mr-2" />
            Försök igen
          </Button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!loading && courses.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-foreground mb-2">
          Inga kurser hittades
        </h3>
        <p className="text-muted-foreground mb-4">
          {hasActiveFilters
            ? 'Inga kurser matchar dina filterkriterier.'
            : 'Det verkar som att det inte finns några kurser att visa just nu.'}
        </p>
        {hasActiveFilters && (
          <Button onClick={refresh} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Rensa filter
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Results summary with sorting and view controls */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <span>
            Visar {courses.length}
            {totalCount !== null && ` av ${totalCount}`} kurser
          </span>
        </div>

        <div className="flex items-center gap-4">
          {/* Mobile Filter Button - only show on mobile */}
          {onMobileFilterOpen && (
            <Button
              variant="outline"
              size="sm"
              onClick={onMobileFilterOpen}
              className="lg:hidden h-8 px-3 gap-2"
            >
              <Filter className="h-4 w-4" />
              Filter
              {hasActiveFilters && (
                <span className="ml-1 bg-primary text-primary-foreground text-xs px-1.5 py-0.5 rounded-full">
                  •
                </span>
              )}
            </Button>
          )}

          {error && (
            <div className="text-destructive text-sm">
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
              <SelectTrigger className="w-32 h-8 text-xs">
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
                setCurrentSortOrder(currentSortOrder === 'asc' ? 'desc' : 'asc')
              }
              className="h-8 px-2 text-xs"
            >
              {currentSortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>
      </div>

      {/* Courses display */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {coursesDisplay}
      </div>

      {/* Load more trigger */}
      {hasNextPage && (
        <LoadMoreTrigger onLoadMore={loadMore} isLoading={isLoadingMore} />
      )}

      {/* End message */}
      {!hasNextPage && courses.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>Du har nått slutet av kurslistan</p>
          {totalCount !== null && (
            <p className="text-sm mt-1">Totalt {totalCount} kurser visade</p>
          )}
        </div>
      )}
    </div>
  );
}
