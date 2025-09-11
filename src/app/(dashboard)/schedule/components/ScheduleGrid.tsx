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
        {/* Mobile Loading Layout */}
        <div className="md:hidden space-y-6">
          {/* Semester 7 Header */}
          <SkeletonCard variant="schedule" />

          {/* Semester 7 Periods */}
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />

          {/* Semester 8 Header */}
          <SkeletonCard variant="schedule" />

          {/* Semester 8 Periods */}
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />

          {/* Semester 9 Header */}
          <SkeletonCard variant="schedule" />

          {/* Semester 9 Periods */}
          <SkeletonCard variant="schedule" />
          <SkeletonCard variant="schedule" />
        </div>

        {/* Desktop Loading Layout */}
        <div className="hidden md:block">
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
      {/* Mobile Layout - Single Column */}
      <div className="md:hidden space-y-6">
        {/* Semester 7 - Period 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 1</h3>
          </div>
          <SemesterBlock
            semester={7}
            period={1}
            courses={schedule?.semester7?.period1 || []}
            dropZoneId="semester7-period1"
            semesterLabel="Termin 7 - Höst år 4"
          />
        </div>

        {/* Semester 7 - Period 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 2</h3>
          </div>
          <SemesterBlock
            semester={7}
            period={2}
            courses={schedule?.semester7?.period2 || []}
            dropZoneId="semester7-period2"
            semesterLabel="Termin 7 - Höst år 4"
          />
        </div>

        {/* Semester 8 - Period 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 1</h3>
          </div>
          <SemesterBlock
            semester={8}
            period={1}
            courses={schedule?.semester8?.period1 || []}
            dropZoneId="semester8-period1"
            semesterLabel="Termin 8 - Vår år 4"
          />
        </div>

        {/* Semester 8 - Period 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 2</h3>
          </div>
          <SemesterBlock
            semester={8}
            period={2}
            courses={schedule?.semester8?.period2 || []}
            dropZoneId="semester8-period2"
            semesterLabel="Termin 8 - Vår år 4"
          />
        </div>

        {/* Semester 9 - Period 1 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 1</h3>
          </div>
          <SemesterBlock
            semester={9}
            period={1}
            courses={schedule?.semester9?.period1 || []}
            dropZoneId="semester9-period1"
            semesterLabel="Termin 9 - Höst år 5"
          />
        </div>

        {/* Semester 9 - Period 2 */}
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-8 bg-primary rounded-full" />
            <h3 className="text-xl font-semibold text-foreground">Period 2</h3>
          </div>
          <SemesterBlock
            semester={9}
            period={2}
            courses={schedule?.semester9?.period2 || []}
            dropZoneId="semester9-period2"
            semesterLabel="Termin 9 - Höst år 5"
          />
        </div>
      </div>

      {/* Desktop Layout - Original 2x3 Grid */}
      <div className="hidden md:block">
        {/* Schedule Grid */}
        <div className="space-y-8 mt-3">
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
                      semesterLabel={`Termin ${semester} - ${getSemesterDescription(
                        semester
                      )}`}
                    />
                  );
                })}
              </div>
            </div>
          ))}
        </div>
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
