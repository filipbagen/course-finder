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
import { ScheduleActions } from '../types/schedule.types';
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
  const { state, dispatch } = useSchedule();
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
      dispatch({
        type: ScheduleActions.SET_DRAG_STATE,
        payload: { isDragging: true, draggedCourse: course },
      });
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
   */
  const isValidMove = (
    course: CourseWithEnrollment,
    targetSemester: number,
    targetPeriod: number
  ): boolean => {
    // Rule 1: Course must be offered in the target semester
    if (!course.semester.includes(targetSemester)) {
      return false;
    }

    // Rule 2: Course cannot be moved between different periods
    // The course must be offered in the target period
    if (!course.period.includes(targetPeriod)) {
      return false;
    }

    // Rule 3: Single semester courses cannot be moved at all
    // This is handled by Rule 1 above - if only offered in one semester,
    // it can't be moved to another

    return true;
  };

  /**
   * Handle drag end - update the schedule
   */
  const handleDragEnd = (event: DragEndEvent) => {
    if (readonly) return;

    const { active, over } = event;

    setActiveCourse(null);
    dispatch({
      type: ScheduleActions.SET_DRAG_STATE,
      payload: { isDragging: false, draggedCourse: null },
    });

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

    // Get current position
    const currentPosition = findCoursePosition(courseId);
    if (!currentPosition) {
      console.error('Could not find current position for course:', courseId);
      return;
    }

    // Check if position actually changed
    if (
      currentPosition.semester === targetSemester &&
      currentPosition.period === targetPeriod
    ) {
      return;
    }

    // Validate if the course can be moved to the target position
    if (!isValidMove(activeCourse, targetSemester, targetPeriod)) {
      // TODO: Show user feedback about why the move isn't allowed
      console.warn('Move not allowed:', {
        course: activeCourse.code,
        from: currentPosition,
        to: { semester: targetSemester, period: targetPeriod },
        availableSemesters: activeCourse.semester,
        availablePeriods: activeCourse.period,
      });
      return;
    }

    // Dispatch move action
    dispatch({
      type: ScheduleActions.MOVE_COURSE,
      payload: {
        courseId,
        fromSemester: currentPosition.semester,
        fromPeriod: currentPosition.period,
        toSemester: targetSemester,
        toPeriod: targetPeriod,
      },
    });
  };

  /**
   * Find a course by ID in the schedule
   */
  const findCourseById = (courseId: string): CourseWithEnrollment | null => {
    const { schedule } = state;

    for (const semesterKey of Object.keys(schedule) as Array<
      keyof typeof schedule
    >) {
      const semesterData = schedule[semesterKey];
      for (const periodKey of Object.keys(semesterData) as Array<
        keyof typeof semesterData
      >) {
        const courses = semesterData[periodKey];
        const course = courses.find((c) => c.id === courseId);
        if (course) {
          return course;
        }
      }
    }

    return null;
  };

  /**
   * Find the position of a course in the schedule
   */
  const findCoursePosition = (
    courseId: string
  ): { semester: number; period: number } | null => {
    const { schedule } = state;

    for (const semesterKey of Object.keys(schedule) as Array<
      keyof typeof schedule
    >) {
      const semester = parseInt(semesterKey.replace('semester', ''));
      const semesterData = schedule[semesterKey];

      for (const periodKey of Object.keys(semesterData) as Array<
        keyof typeof semesterData
      >) {
        const period = parseInt(periodKey.replace('period', ''));
        const courses = semesterData[periodKey];
        const course = courses.find((c) => c.id === courseId);

        if (course) {
          return { semester, period };
        }
      }
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

      <DragOverlay>
        {activeCourse ? (
          <ScheduleCourseCard course={activeCourse} readonly={true} />
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
