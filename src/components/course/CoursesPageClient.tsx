'use client';

import { useState } from 'react';
import { InfiniteCoursesList } from '@/components/course/InfiniteCoursesList';
import CourseFilter from '@/components/course/filter/CourseFilter';
import { MobileFilterDialog } from '@/components/course/filter/MobileFilterDialog';
import { useFilters } from '@/hooks/useFilters';
import { Button } from '@/components/ui/button';
import { Filter, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { TriState } from '@/types/types';

interface CoursesPageClientProps {
  isAuthenticated: boolean;
  initialSearch?: string;
  initialCampus?: string;
  initialField?: string;
  initialSemester?: string;
  initialSortBy?: string;
  initialSortOrder?: string;
}

export function CoursesPageClient({
  isAuthenticated,
  initialSearch,
  initialCampus,
  initialField,
  initialSemester,
  initialSortBy,
  initialSortOrder,
}: CoursesPageClientProps) {
  const [search, setSearch] = useState(initialSearch || '');
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const {
    filters,
    mobileFilters,
    handleFilterChange,
    resetAllFilters,
    applyMobileFilters,
    resetMobileFilters,
    hasActiveFilters,
    syncMobileFilters,
  } = useFilters();

  // Count active mobile filters
  const activeMobileFilterCount = (
    Object.keys(mobileFilters) as Array<keyof typeof mobileFilters>
  ).reduce((total, key) => {
    const filter = mobileFilters[key];
    if (key === 'examinations') {
      return (
        total +
        Object.values(filter as Record<string, TriState>).filter(
          (state) => state !== 'unchecked'
        ).length
      );
    }
    return total + (filter as string[]).length;
  }, 0);

  return (
    <div className="flex gap-6">
      {/* Desktop Filter Panel */}
      <div className="hidden lg:block w-80 flex-shrink-0">
        <CourseFilter
          onFilterChange={handleFilterChange}
          currentFilters={filters}
          screen="desktop"
        />
      </div>

      {/* Main Content */}
      <div className="flex-1 min-w-0">
        <div className="space-y-6">
          {/* Search Input Only */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Sök kurser..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Courses List */}
          <InfiniteCoursesList
            isAuthenticated={isAuthenticated}
            search={search}
            filters={filters}
            onMobileFilterOpen={() => {
              syncMobileFilters();
              setMobileFiltersOpen(true);
            }}
          />
        </div>
      </div>

      {/* Mobile Filter Dialog */}
      <Dialog open={mobileFiltersOpen} onOpenChange={setMobileFiltersOpen}>
        <DialogContent className="max-w-lg max-h-[80vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <DialogTitle>Filter kurser</DialogTitle>
            <DialogDescription>
              Välj filter för att begränsa kurserna som visas
            </DialogDescription>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto py-4">
            <CourseFilter
              onFilterChange={(filterType, value, isChecked) =>
                handleFilterChange(filterType, value, isChecked, true)
              }
              currentFilters={mobileFilters}
              screen="mobile"
            />
          </div>

          <DialogFooter className="flex-row gap-2 sm:gap-2">
            <Button
              variant="outline"
              onClick={() => {
                resetMobileFilters();
                setMobileFiltersOpen(false);
              }}
              className="flex-1"
            >
              Avbryt
            </Button>
            <Button
              onClick={() => {
                applyMobileFilters();
                setMobileFiltersOpen(false);
              }}
              className="flex-1"
            >
              Tillämpa ({activeMobileFilterCount})
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
