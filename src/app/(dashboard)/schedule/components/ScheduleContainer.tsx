'use client';

import React from 'react';
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragStartEvent,
  PointerSensor,
  KeyboardSensor,
  useSensor,
  useSensors,
  DragOverlay,
  closestCenter,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useSchedule } from './ScheduleProvider';
import ScheduleCourseCard from './ScheduleCourseCard';
import { CourseWithEnrollment } from '@/types/types';

interface ScheduleContainerProps {
  children: React.ReactNode;
  readonly?: boolean;
}

/**
 * Schedule Container Component
 *
 * Provides drag and drop functionality using dnd-kit.
 * Handles all drag events and updates the schedule state.
 *
 * Features:
 * - Optimistic updates for better UX
 * - Error handling with rollback
 * - Accessibility support
 * - Touch and keyboard navigation
 */
export function ScheduleContainer({
  children,
  readonly = false,
}: ScheduleContainerProps) {
  const { moveCourse } = useSchedule();
  const [activeCourse, setActiveCourse] =
    React.useState<CourseWithEnrollment | null>(null);

  // Configure sensors for different input methods
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8, // Minimum distance before drag starts
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  /**
   * Handle drag start - store the active course
   */
  const handleDragStart = (event: DragStartEvent) => {
    if (readonly) return;

    const { active } = event;
    const courseId = active.id as string;

    // Find the active course in the schedule
    const course = findCourseById(courseId);
    if (course) {
      setActiveCourse(course);
    }
  };

  /**
   * Handle drag over - provide visual feedback
   */
  const handleDragOver = (event: DragOverEvent) => {
    if (readonly) return;

    const { over } = event;

    if (over) {
      const overId = over.id as string;
      if (overId.includes('semester') && overId.includes('period')) {
        // Visual feedback can be handled in the drop zones
      }
    }
  };

  /**
   * Validate if a course can be moved to a specific semester and period
   * Simplified logic to improve reliability
   */
  const isValidMove = (
    course: CourseWithEnrollment,
    targetSemester: number,
    targetPeriod: number
  ): boolean => {
    const currentSemester = course.enrollment.semester;

    if (currentSemester === 8) {
      // Semester 8 courses can only stay in semester 8
      return targetSemester === 8;
    } else if (currentSemester === 7 || currentSemester === 9) {
      // Semester 7 and 9 courses can move between semesters 7 and 9
      return targetSemester === 7 || targetSemester === 9;
    }

    return false;
  };

  /**
   * Handle drag end - update the schedule
   */
  const handleDragEnd = async (event: DragEndEvent) => {
    if (readonly) return;

    const { active, over } = event;

    setActiveCourse(null);

    if (!over || !activeCourse) {
      return;
    }

    const courseId = active.id as string;
    const dropZoneId = over.id as string;

    // Parse drop zone ID to get semester and period
    const dropZoneParts = dropZoneId.split('-');
    if (dropZoneParts.length !== 2) {
      console.error('Invalid drop zone ID:', dropZoneId);
      return;
    }

    const [semesterPart, periodPart] = dropZoneParts;
    const targetSemester = parseInt(semesterPart.replace('semester', ''));
    const targetPeriod = parseInt(periodPart.replace('period', ''));

    if (isNaN(targetSemester) || isNaN(targetPeriod)) {
      console.error('Invalid semester or period:', {
        targetSemester,
        targetPeriod,
      });
      return;
    }

    // Validate if the course can be moved to the target position
    if (!isValidMove(activeCourse, targetSemester, targetPeriod)) {
      console.warn('Move not allowed');
      return;
    }

    console.log('Moving course:', {
      courseId,
      fromSemester: activeCourse.enrollment.semester,
      toSemester: targetSemester,
      period: targetPeriod,
    });

    try {
      await moveCourse(
        courseId,
        activeCourse.enrollment.semester,
        targetSemester,
        targetPeriod
      );
    } catch (error) {
      console.error('Failed to move course:', error);
    }
  };

  /**
   * Find a course by ID in the schedule
   * Note: This is a simplified version since we don't have access to the full schedule state
   */
  const findCourseById = (courseId: string): CourseWithEnrollment | null => {
    // For now, we'll just return the activeCourse if it matches
    // In a more complete implementation, you might want to fetch this from a global store
    return activeCourse?.id === courseId ? activeCourse : null;
  };

  /**
   * Find the position of a course in the schedule
   * Note: Simplified since we get position from the course enrollment
   */
  const findCoursePosition = (
    courseId: string
  ): { semester: number; period: number } | null => {
    if (activeCourse?.id === courseId) {
      return {
        semester: activeCourse.enrollment.semester,
        period: activeCourse.enrollment.period || 1,
      };
    }
    return null;
  };

  if (readonly) {
    return <div className="w-full">{children}</div>;
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCenter}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="w-full">{children}</div>

      <DragOverlay
        dropAnimation={{
          duration: 200,
          easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)',
        }}
      >
        {activeCourse ? (
          <div className="transform-gpu scale-105 opacity-90 pointer-events-none">
            <ScheduleCourseCard course={activeCourse} readonly={true} />
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
