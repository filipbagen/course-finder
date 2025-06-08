'use client';

import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Filter } from 'lucide-react';
import { ScrollArea } from '@/components/ui/scroll-area';

import CourseFilter from './CourseFilter';
import { FilterState } from '@/types/types';

interface MobileFilterDialogProps {
  currentFilters: FilterState;
  mobileFilters: FilterState;
  onFilterChange: (
    filterType: keyof FilterState,
    value: string,
    isChecked: boolean,
    isMobile?: boolean
  ) => void;
  onApplyFilters: () => void;
  onResetFilters: () => void;
  activeFilterCount: number;
}

export function MobileFilterDialog({
  currentFilters,
  mobileFilters,
  onFilterChange,
  onApplyFilters,
  onResetFilters,
  activeFilterCount,
}: MobileFilterDialogProps) {
  const [open, setOpen] = React.useState(false);

  const handleApply = () => {
    onApplyFilters();
    setOpen(false);
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (!newOpen) {
      onResetFilters(); // Reset mobile filters when closing without applying
    }
    setOpen(newOpen);
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button variant="outline" className="md:hidden relative">
          <Filter className="h-4 w-4 mr-2" />
          Filter
          {activeFilterCount > 0 && (
            <span className="absolute -top-2 -right-2 h-5 w-5 bg-primary text-primary-foreground text-xs rounded-full flex items-center justify-center">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </DialogTrigger>

      <DialogContent className="h-[85vh] max-w-sm mx-auto">
        <DialogHeader>
          <DialogTitle>Filtrera kurser</DialogTitle>
          <DialogDescription>
            Välj de filter du vill använda för att begränsa kurslistan.
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="flex-1 pr-4">
          <CourseFilter
            screen="mobile"
            onFilterChange={(filterType, value, isChecked) =>
              onFilterChange(filterType, value, isChecked, true)
            }
            currentFilters={mobileFilters}
          />
        </ScrollArea>

        <DialogFooter className="gap-2">
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            className="flex-1"
          >
            Avbryt
          </Button>
          <Button onClick={handleApply} className="flex-1">
            Tillämpa filter
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
