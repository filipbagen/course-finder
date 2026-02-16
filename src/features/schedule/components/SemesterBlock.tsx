'use client'

import React from 'react'
import { useDroppable } from '@dnd-kit/core'
import { CourseWithEnrollment } from '@/types/types'
import ScheduleCourseCard from './ScheduleCourseCard'
import { useSchedule } from './ScheduleProvider'
import { cn } from '@/lib/utils'
import { SignpostBig } from 'lucide-react'
import { ScheduleActions } from '../types/schedule.types'

interface SemesterBlockProps {
  semester: number
  period: number
  courses: CourseWithEnrollment[]
  dropZoneId: string
  readonly?: boolean
  semesterLabel?: string
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
  const { state, dispatch } = useSchedule()
  const { isDragging, draggedCourse } = state

  const { isOver, setNodeRef } = useDroppable({
    id: dropZoneId,
    disabled: readonly,
  })

  // Check if the dragged course can be dropped here
  const canDrop = isDragging && draggedCourse && !readonly
  const isValidDrop =
    canDrop && isValidDropTarget(draggedCourse, semester, period)

  // Handle course removal
  const handleCourseRemoval = (enrollmentId: string) => {
    if (readonly) return

    // Find the course to remove for optimistic update
    const courseToRemove = courses.find(
      (course) => course.enrollment?.id === enrollmentId,
    )

    if (!courseToRemove) {
      console.error('Course not found for removal:', enrollmentId)
      return
    }

    // Apply IMMEDIATE optimistic UI update
    dispatch({
      type: ScheduleActions.REMOVE_COURSE_OPTIMISTIC,
      payload: { enrollmentId },
    })

    // Trigger the async API removal (this will handle success/error cases)
    dispatch({
      type: ScheduleActions.REMOVE_COURSE,
      payload: { enrollmentId },
    })
  }

  const style: React.CSSProperties = {}
  if (isDragging && isOver) {
    style.borderColor = isValidDrop ? '#22c55e' : '#ef4444' // green-500 and red-500 hex codes
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      data-semester={`${semester}`}
      data-period={`${period}`}
      className={cn(
        'relative min-h-48 rounded-lg border-2 bg-card p-4 transition-all duration-200',
        {
          'border-dashed border-border': !isDragging,
          'border-dashed': isDragging && !isOver,
          'border-solid': isDragging && isOver,
          'bg-green-50 dark:bg-green-950/20': isOver && isValidDrop,
          'bg-red-50 dark:bg-red-950/20': isOver && !isValidDrop,
          'cursor-not-allowed opacity-60': readonly,
        },
      )}
    >
      {/* Semester Label */}
      {semesterLabel && (
        <div className="mb-2">
          <div className="text-xs font-medium text-muted-foreground">
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
            'flex h-32 flex-col items-center justify-center text-center transition-opacity duration-200',
            {
              'opacity-0': isOver,
            },
          )}
        >
          <div className="flex flex-col items-center space-y-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
  )
}

/**
 * Check if a course can be dropped in a specific semester/period.
 *
 * Rules:
 * - Semester 8 courses cannot be moved at all.
 * - Semester 7/9 courses can move between 7 and 9 only.
 * - The target period must be one the course actually runs in
 *   (e.g. a period-1 course cannot land in a period-2 zone).
 */
function isValidDropTarget(
  course: CourseWithEnrollment,
  targetSemester: number,
  targetPeriod: number,
): boolean {
  const currentSemester = course.enrollment.semester

  // Semester 8 courses have no valid drop targets
  if (currentSemester === 8) return false

  // Semester 7/9 courses can only move between 7 and 9
  if (currentSemester === 7 || currentSemester === 9) {
    if (targetSemester !== 7 && targetSemester !== 9) return false
  }

  // Period must match one of the course's intrinsic periods
  const coursePeriods = Array.isArray(course.period) ? course.period : []
  if (!coursePeriods.includes(targetPeriod)) return false

  return true
}

/**
 * Handle adding a new course to a specific semester/period
 */
function _handleAddCourse(_semester: number, _period: number) {
  // This would typically open a course selection modal/drawer
  // TODO: Implement course selection modal
  // This could:
  // 1. Open a modal with available courses
  // 2. Filter courses based on prerequisites and availability
  // 3. Allow user to select and add to the schedule
}
