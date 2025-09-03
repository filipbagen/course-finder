'use client';

import React, { useMemo } from 'react';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { FilterX } from 'lucide-react';

import CheckboxItem from './CheckboxItem';
import { accordionItems as staticAccordionItems } from './accordionItemsConfig';
import { FilterState, FilterProps, TriState } from '@/types/types';
import { useFields } from '@/hooks/courses/useFields';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Advanced Course Filter Component
 *
 * Provides comprehensive filtering options for courses including:
 * - Semester, Period, Block selection
 * - Study pace and level filtering
 * - Field of study and examination type
 * - Campus location filtering
 *
 * Features:
 * - Responsive design for desktop/mobile
 * - Visual indicators for active filters
 * - Sticky positioning on desktop
 * - Accordion-based organization
 */
const CourseFilter: React.FC<FilterProps> = ({
  screen,
  onFilterChange,
  currentFilters,
}) => {
  const { mainFieldOfStudy, loading: fieldsLoading } = useFields();

  const resetFilters = () => {
    // Reset array-based filters
    (Object.keys(currentFilters) as Array<keyof FilterState>)
      .filter((key) => key !== 'examinations')
      .forEach((filterType) => {
        (currentFilters[filterType] as string[]).forEach((value) => {
          onFilterChange(filterType, value, false);
        });
      });

    // Reset examinations tri-state filter
    Object.keys(currentFilters.examinations).forEach((value) => {
      onFilterChange('examinations', value, 'unchecked');
    });
  };

  // Count total active filters, handling both array and object filter types
  const activeFilterCount = (
    Object.keys(currentFilters) as Array<keyof FilterState>
  ).reduce((total, key) => {
    const filter = currentFilters[key];
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

  // Dynamically update the accordionItems with fetched fields
  const accordionItems = useMemo(() => {
    return staticAccordionItems.map((item) => {
      if (item.filterType === 'mainFieldOfStudy') {
        return {
          ...item,
          options:
            mainFieldOfStudy.length > 0 ? mainFieldOfStudy : item.options,
        };
      }
      return item;
    });
  }, [mainFieldOfStudy]);

  return (
    <Card
      className={`${
        screen === 'desktop'
          ? 'sticky top-6 overflow-y-auto h-fit max-h-[calc(100vh-48px)]'
          : 'w-full'
      } border border-border m-0`}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold">Filter</CardTitle>
          {activeFilterCount > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded-full">
                {activeFilterCount}
              </span>
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className="py-0">
        <Accordion
          type="multiple"
          defaultValue={['semester']}
          className="w-full"
        >
          {accordionItems.map((item) => {
            const isTriState = item.filterType === 'examinations';
            const isAnyOptionChecked = isTriState
              ? Object.values(currentFilters.examinations).some(
                  (state) => state !== 'unchecked'
                )
              : (
                  currentFilters[
                    item.filterType as keyof FilterState
                  ] as string[]
                ).length > 0;

            return (
              <AccordionItem
                value={item.value}
                key={item.value}
                className="border-b border-border last:border-b-0"
              >
                <AccordionTrigger className="hover:no-underline py-3">
                  <div className="flex items-center gap-3 text-left">
                    {item.icon && (
                      <span
                        className={`flex-shrink-0 ${
                          isAnyOptionChecked
                            ? 'text-primary'
                            : 'text-muted-foreground'
                        }`}
                      >
                        <item.icon size={18} />
                      </span>
                    )}
                    <span
                      className={`text-sm font-medium ${
                        isAnyOptionChecked ? 'text-primary' : 'text-foreground'
                      }`}
                    >
                      {item.title}
                    </span>
                    {isAnyOptionChecked && (
                      <div className="h-2 w-2 rounded-full bg-primary flex-shrink-0" />
                    )}
                  </div>
                </AccordionTrigger>

                <AccordionContent className="pb-4">
                  <div className="flex flex-col gap-3 pl-7">
                    {item.filterType === 'mainFieldOfStudy' && fieldsLoading
                      ? // Show loading state for mainFieldOfStudy
                        Array.from({ length: 5 }).map((_, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <Skeleton className="h-4 w-4" />
                            <Skeleton className="h-4 w-32" />
                          </div>
                        ))
                      : // Render options when available
                        item.options.map((option) => {
                          const optionString = option.toString();
                          const displayValue = item.displayValue(optionString);

                          let state: TriState = 'unchecked';
                          if (isTriState) {
                            state =
                              currentFilters.examinations[optionString] ||
                              'unchecked';
                          } else {
                            const currentValues = currentFilters[
                              item.filterType as keyof FilterState
                            ] as string[];
                            state = currentValues.includes(optionString)
                              ? 'checked'
                              : 'unchecked';
                          }

                          return (
                            <CheckboxItem
                              key={optionString}
                              filterType={item.filterType as keyof FilterState}
                              displayValue={displayValue}
                              value={optionString}
                              onChange={(newState) =>
                                onFilterChange(
                                  item.filterType as keyof FilterState,
                                  optionString,
                                  newState as TriState
                                )
                              }
                              state={state}
                              isTriState={isTriState}
                            />
                          );
                        })}
                  </div>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </CardContent>

      {activeFilterCount > 0 && (
        <CardFooter className="pt-4">
          <Button
            onClick={resetFilters}
            variant="outline"
            size="sm"
            className="w-full"
          >
            <FilterX className="h-4 w-4 mr-2" />
            Rensa filter ({activeFilterCount})
          </Button>
        </CardFooter>
      )}
    </Card>
  );
};

export default CourseFilter;
