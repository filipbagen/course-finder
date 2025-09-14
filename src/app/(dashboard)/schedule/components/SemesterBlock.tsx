'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CourseWithEnrollment } from '@/types/types';
import ScheduleCourseCard from './ScheduleCourseCard';
import { useSchedule } from './ScheduleProvider';
import { cn } from '@/lib/utils';
import { Plus, BookOpen, Blocks, Smile, SignpostBig } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SemesterBlockProps {
  semester: number;
  period: number;
  courses: CourseWithEnrollment[];
  dropZoneId: string;
  readonly?: boolean;
  semesterLabel?: string;
}

/**
 * Semester Block Component
 *
 * Represents a single cell in the schedule grid.
 * Acts as a drop zone for drag and drop operations.
 *
 * Features:
 * - Visual feedback during drag operations
 * - Empty state with add course option
 * - Responsive course layout
 * - Accessibility support
 */
export function SemesterBlock({
  semester,
  period,
  courses,
  dropZoneId,
  readonly = false,
  semesterLabel,
}: SemesterBlockProps) {
  const { removeCourse } = useSchedule();

  const { isOver, setNodeRef } = useDroppable({
    id: dropZoneId,
    disabled: readonly,
  });

  // Check if the dragged course can be dropped here
  const canDrop = !readonly;
  const isValidDrop = canDrop && isOver;

  // Handle course removal
  const handleCourseRemoval = async (enrollmentId: string) => {
    if (readonly) return;

    try {
      await removeCourse(enrollmentId);
    } catch (error) {
      console.error('Failed to remove course:', error);
    }
  };

  const style: React.CSSProperties = {};
  if (isOver) {
    style.borderColor = isValidDrop ? '#22c55e' : '#ef4444'; // green-500 and red-500 hex codes
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'min-h-48 p-4 rounded-lg border-2 transition-all duration-200 relative bg-card',
        {
          'border-dashed border-border': true,
          'border-solid': isOver,
          'bg-green-50 dark:bg-green-950/20': isOver && isValidDrop,
          'bg-red-50 dark:bg-red-950/20': isOver && !isValidDrop,
          'cursor-not-allowed opacity-60': readonly,
        }
      )}
    >
      {/* Semester Label */}
      {semesterLabel && (
        <div className="mb-2">
          <div className="text-muted-foreground text-xs font-medium">
            {semesterLabel}
          </div>
        </div>
      )}

      {/* Courses */}
      <div className="space-y-3">
        {courses.map((course) => (
          <ScheduleCourseCard
            key={course.id}
            course={course}
            readonly={readonly}
            onRemove={readonly ? undefined : handleCourseRemoval}
          />
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div
          className={cn(
            'flex flex-col items-center justify-center h-32 text-center transition-opacity duration-200',
            {
              'opacity-0': isOver,
            }
          )}
        >
          <div className="space-y-3 flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
              <SignpostBig className="h-6 w-6 text-primary" />
            </div>
            <div className="space-y-1">
              <p className="text-sm text-muted-foreground">
                Inga kurser inlagda
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Drop feedback is already handled with the background classes */}
    </div>
  );
}

/**
 * Handle adding a new course to a specific semester/period
 */
function handleAddCourse(semester: number, period: number) {
  // This would typically open a course selection modal/drawer
  // TODO: Implement course selection modal
  // This could:
  // 1. Open a modal with available courses
  // 2. Filter courses based on prerequisites and availability
  // 3. Allow user to select and add to the schedule
}
