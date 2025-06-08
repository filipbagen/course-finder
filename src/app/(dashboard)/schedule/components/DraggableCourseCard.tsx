'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CourseWithEnrollment } from '@/types/types';
import CourseCard from '@/components/course/CourseCard';
import { cn } from '@/lib/utils';

interface DraggableCourseCardProps {
  course: CourseWithEnrollment;
  onRemove?: (enrollmentId: string) => void;
  readonly?: boolean;
}

/**
 * Draggable Course Card Component
 *
 * Wraps CourseCard with dnd-kit draggable functionality for the schedule.
 * Provides proper drag handle props to make courses draggable between semesters.
 *
 * Features:
 * - Draggable interface using dnd-kit
 * - Proper drag handle with grip icon
 * - Visual feedback during drag operations
 * - Disabled state for readonly mode
 */
export default function DraggableCourseCard({
  course,
  onRemove,
  readonly = false,
}: DraggableCourseCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: course.id,
      disabled: readonly,
      data: {
        course,
        type: 'course',
      },
    });

  const style = transform
    ? {
        transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
      }
    : undefined;

  // Create drag handle props that mimic react-beautiful-dnd format
  const dragHandleProps = readonly
    ? undefined
    : {
        ...attributes,
        ...listeners,
        'aria-describedby': `drag-handle-${course.id}`,
      };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-opacity duration-200',
        isDragging && 'opacity-50'
      )}
    >
      <CourseCard
        course={course}
        variant="schedule"
        isDragging={isDragging}
        dragHandleProps={dragHandleProps}
        onRemove={onRemove}
      />
    </div>
  );
}
