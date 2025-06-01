'use client';

import React from 'react';
import { useDroppable } from '@dnd-kit/core';
import { CourseWithEnrollment } from '@/types/types';
import { CourseCard } from './CourseCard';
import { useSchedule } from './ScheduleProvider';
import { cn } from '@/lib/utils';
import { Plus, BookOpen } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface SemesterBlockProps {
  semester: number;
  period: number;
  courses: CourseWithEnrollment[];
  dropZoneId: string;
  readonly?: boolean;
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
}: SemesterBlockProps) {
  const { state } = useSchedule();
  const { isDragging, draggedCourse } = state;

  const { isOver, setNodeRef } = useDroppable({
    id: dropZoneId,
    disabled: readonly,
  });

  // Check if the dragged course can be dropped here
  const canDrop = isDragging && draggedCourse && !readonly;
  const isValidDrop =
    canDrop && isValidDropTarget(draggedCourse, semester, period);

  return (
    <div
      ref={setNodeRef}
      className={cn(
        'min-h-48 p-4 rounded-lg border-2 border-dashed transition-all duration-200',
        'bg-card hover:bg-accent/5',
        {
          // Default state
          'border-border': !isDragging,

          // Drag states
          'border-primary bg-primary/5': isOver && isValidDrop,
          'border-destructive bg-destructive/5': isOver && !isValidDrop,
          'border-muted-foreground/50': isDragging && !isOver,

          // Readonly state
          'cursor-not-allowed opacity-60': readonly,
        }
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium text-muted-foreground">
            S{semester} P{period}
          </span>
        </div>

        {!readonly && courses.length > 0 && (
          <span className="text-xs text-muted-foreground">
            {courses.length} course{courses.length !== 1 ? 's' : ''}
          </span>
        )}
      </div>

      {/* Courses */}
      <div className="space-y-3">
        {courses.map((course) => (
          <CourseCard
            key={course.id}
            course={course}
            readonly={readonly}
            compact={true}
          />
        ))}
      </div>

      {/* Empty State */}
      {courses.length === 0 && (
        <div className="flex flex-col items-center justify-center h-32 text-center">
          {isDragging && isOver ? (
            <div className="space-y-2">
              {isValidDrop ? (
                <>
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-primary" />
                  </div>
                  <p className="text-sm text-primary font-medium">
                    Drop course here
                  </p>
                </>
              ) : (
                <>
                  <div className="w-8 h-8 rounded-full bg-destructive/20 flex items-center justify-center">
                    <Plus className="h-4 w-4 text-destructive" />
                  </div>
                  <p className="text-sm text-destructive font-medium">
                    Cannot place course here
                  </p>
                </>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                <BookOpen className="h-6 w-6 text-muted-foreground" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">
                  No courses scheduled
                </p>
                {!readonly && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
                    onClick={() => handleAddCourse(semester, period)}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    Add course
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Drop feedback overlay */}
      {isDragging && (
        <div
          className={cn(
            'absolute inset-0 rounded-lg border-2 pointer-events-none transition-opacity',
            {
              'border-primary bg-primary/5 opacity-100': isOver && isValidDrop,
              'border-destructive bg-destructive/5 opacity-100':
                isOver && !isValidDrop,
              'opacity-0': !isOver,
            }
          )}
        />
      )}
    </div>
  );
}

/**
 * Check if a course can be dropped in a specific semester/period
 */
function isValidDropTarget(
  course: CourseWithEnrollment,
  targetSemester: number,
  targetPeriod: number
): boolean {
  // Basic validation - courses can generally be moved between semesters
  // You can add more complex validation logic here based on:
  // - Course prerequisites
  // - Course offerings (some courses might only be offered in specific semesters)
  // - Program requirements
  // - Credit limits per semester

  // For now, allow all moves within semesters 7-9 and periods 1-2
  return (
    targetSemester >= 7 &&
    targetSemester <= 9 &&
    (targetPeriod === 1 || targetPeriod === 2)
  );
}

/**
 * Handle adding a new course to a specific semester/period
 */
function handleAddCourse(semester: number, period: number) {
  // This would typically open a course selection modal/drawer
  // For now, we'll just log the action
  console.log(`Add course to Semester ${semester}, Period ${period}`);

  // TODO: Implement course selection modal
  // This could:
  // 1. Open a modal with available courses
  // 2. Filter courses based on prerequisites and availability
  // 3. Allow user to select and add to the schedule
}
