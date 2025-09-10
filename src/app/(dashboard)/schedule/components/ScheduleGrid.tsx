'use client';

import React from 'react';
import { useSchedule } from './ScheduleProvider';
import { SemesterBlock } from './SemesterBlock';
import { SkeletonCard } from '@/components/shared/SkeletonComponent';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertCircle } from 'lucide-react';

/**
 * Schedule Grid Component
 *
 * Renders a 2x3 grid layout for the schedule:
 * - Columns: Semester 7, 8, 9
 * - Rows: Period 1, Period 2
 *
 * Features:
 * - Responsive design
 * - Loading states
 * - Error handling
 * - Accessibility support
 */
export function ScheduleGrid() {
  const { state } = useSchedule();
  const { schedule, loading, error } = state;

  // Show loading state
  if (loading) {
    return (
      <div className="w-full space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Semester headers */}
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
        </div>

        {/* Period 1 row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
        </div>

        {/* Period 2 row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
        </div>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <Alert variant="destructive">
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  const semesters = [7, 8, 9] as const;
  const periods = [1, 2] as const;

  return (
    <div className="w-full space-y-6">
      {/* Semester Headers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {semesters.map((semester) => (
          <div key={semester} className="text-center p-4 bg-muted rounded-lg">
            <h3 className="text-lg font-semibold text-foreground">
              Termin {semester}
            </h3>
            <p className="text-sm text-muted-foreground mt-1">
              {getSemesterDescription(semester)}
            </p>
          </div>
        ))}
      </div>

      {/* Schedule Grid */}
      <div className="space-y-8">
        {periods.map((period) => (
          <div key={period} className="space-y-4">
            {/* Period Header */}
            <div className="flex items-center gap-3">
              <div className="w-2 h-8 bg-primary rounded-full" />
              <h3 className="text-xl font-semibold text-foreground">
                Period {period}
              </h3>
              <div className="flex-1 h-px bg-border" />
            </div>

            {/* Period Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {semesters.map((semester) => {
                const semesterKey =
                  `semester${semester}` as keyof typeof schedule;
                const periodKey =
                  `period${period}` as keyof (typeof schedule)[typeof semesterKey];
                const courses = schedule?.[semesterKey]?.[periodKey] || [];

                return (
                  <SemesterBlock
                    key={`${semester}-${period}`}
                    semester={semester}
                    period={period}
                    courses={courses}
                    dropZoneId={`semester${semester}-period${period}`}
                  />
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Get semester description for display
 */
function getSemesterDescription(semester: number): string {
  switch (semester) {
    case 7:
      return 'Höst år 4';
    case 8:
      return 'Vår år 4';
    case 9:
      return 'Höst år 5';
    default:
      return '';
  }
}
