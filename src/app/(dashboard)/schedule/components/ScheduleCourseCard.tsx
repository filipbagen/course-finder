'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import {
  Card,
  CardContent,
  CardHeader,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  GripVertical,
  Trash2,
  Calendar,
  BookOpen,
  Star,
  ArrowRightLeft,
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useSchedule } from './ScheduleProvider';
import { ScheduleActions } from '../types/schedule.types';
import { CourseWithEnrollment } from '@/types/types';
import { useMediaQuery } from '@/hooks/use-media-query';
import { cn } from '@/lib/utils';
import CourseReviewDialog from '@/components/course/CourseReviewDialog';

interface ScheduleCourseCardProps {
  course: CourseWithEnrollment;
  onRemove?: (enrollmentId: string) => void;
  readonly?: boolean;
}

/**
 * Schedule Course Card Component
 *
 * A specialized course card designed specifically for the schedule interface.
 * Follows SOLID principles:
 * - Single Responsibility: Handles only schedule-specific course display and interaction
 * - Open/Closed: Extensible for schedule features without modifying base CourseCard
 * - Dependency Inversion: Depends on abstractions (props) rather than concrete implementations
 *
 * Features:
 * - Integrated drag and drop functionality
 * - Schedule-optimized layout and information
 * - Course removal capability
 * - Visual feedback during drag operations
 * - Readonly mode support
 */
export default function ScheduleCourseCard({
  course,
  onRemove,
  readonly = false,
}: ScheduleCourseCardProps) {
  const { state, dispatch } = useSchedule();
  const isMobile = useMediaQuery('(max-width: 767px)');
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

  // Format display text
  const blockText =
    course.block.length > 1
      ? `Block ${course.block.join(', ')}`
      : `Block ${course.block[0]}`;

  // Handle course removal
  const handleRemove = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (course.enrollment?.id && onRemove) {
      onRemove(course.enrollment.id);
    }
  };

  // Handle course movement
  const handleMoveCourse = (toSemester: number) => {
    if (readonly) return;

    // Find the course's current location
    const findCurrentLocation = () => {
      const semesters = [7, 8, 9] as const;
      const periods = [1, 2] as const;

      for (const semester of semesters) {
        for (const period of periods) {
          const semesterKey =
            `semester${semester}` as keyof typeof state.schedule;
          const periodKey = `period${period}` as 'period1' | 'period2';
          const courses = state.schedule[semesterKey][periodKey];

          const foundCourse = courses.find((c) => c.id === course.id);
          if (foundCourse) {
            return { semester, period };
          }
        }
      }
      return null;
    };

    const currentLocation = findCurrentLocation();
    if (!currentLocation) return;

    // Dispatch move action
    dispatch({
      type: ScheduleActions.MOVE_COURSE,
      payload: {
        courseId: course.id,
        fromSemester: currentLocation.semester,
        fromPeriod: currentLocation.period,
        toSemester,
        toPeriod: currentLocation.period, // Keep same period
      },
    });
  };

  // Get available semesters for moving (only on mobile, only for semester 7/9 courses)
  const getAvailableSemesters = () => {
    const currentSemester = course.enrollment?.semester;
    if (!currentSemester || !isMobile) return [];

    // Only allow moving courses from semester 7 and 9, and only between 7 and 9
    if (currentSemester === 7) {
      return [9]; // Can move from 7 to 9
    } else if (currentSemester === 9) {
      return [7]; // Can move from 9 to 7
    }
    return []; // Semester 8 courses cannot be moved
  };

  const availableSemesters = getAvailableSemesters();

  // Reference for dialog trigger button
  const dialogTriggerRef = React.useRef<HTMLButtonElement>(null);

  // Handle card click to open review dialog
  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent dialog from opening when clicking on buttons or drag handle
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('[data-drag-handle="true"]')
    ) {
      return;
    }

    // Programmatically click the dialog trigger
    dialogTriggerRef.current?.click();
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('transition-all duration-200', {
        'opacity-0': isDragging && !readonly, // Hide the original when dragging (not in overlay)
        'cursor-not-allowed': readonly,
      })}
    >
      <Card
        onClick={handleCardClick}
        className={cn('transition-all duration-200 group', {
          'hover:shadow-md': !isDragging && !readonly,
          'cursor-pointer': !readonly && !isDragging,
          'cursor-grabbing': !readonly && isDragging,
          'border-primary shadow-lg': isDragging,
        })}
      >
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between gap-3">
            {/* Drag handle - only show when not readonly */}
            {!readonly && (
              <div
                {...attributes}
                {...listeners}
                data-drag-handle="true"
                className="mt-1 cursor-grab hover:text-primary transition-colors"
                aria-label={`Drag ${course.name}`}
                onClick={(e) => e.stopPropagation()}
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            )}

            <div className="flex-1 min-w-0">
              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
                {course.name}
              </h3>
              <p className="text-sm font-mono text-muted-foreground mt-1">
                {course.code}
              </p>
            </div>

            <div className="flex items-center gap-1">
              {/* Move button - only show on mobile for semester 7/9 courses */}
              {!readonly && isMobile && availableSemesters.length > 0 && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-blue-500 hover:text-blue-700 hover:bg-blue-50 transition-colors"
                      aria-label={`Move ${course.name} to different semester`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <ArrowRightLeft className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    {availableSemesters.map((semester) => (
                      <DropdownMenuItem
                        key={semester}
                        className="cursor-pointer"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMoveCourse(semester);
                        }}
                      >
                        Flytta till termin {semester}
                      </DropdownMenuItem>
                    ))}
                  </DropdownMenuContent>
                </DropdownMenu>
              )}

              {/* Remove button - only show when not readonly */}
              {!readonly && onRemove && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemove}
                  className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors"
                  aria-label={`Remove ${course.name} from schedule`}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              )}
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 space-y-3">
          {/* Main Field of Study */}
          <div className="flex items-start gap-2">
            <BookOpen className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
            <div className="flex flex-wrap gap-1">
              {course.mainFieldOfStudy.length === 0 ? (
                <Badge variant="outline" className="text-xs">
                  Inget huvudområde
                </Badge>
              ) : (
                course.mainFieldOfStudy.map((field) => (
                  <Badge key={field} variant="outline" className="text-xs">
                    {field}
                  </Badge>
                ))
              )}
            </div>
          </div>

          {/* Schedule Information */}
          <div className="flex items-center justify-between pt-2 border-t border-border">
            <div className="flex items-center gap-2">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{blockText}</span>
            </div>

            {/* Credits */}
            <Badge variant="secondary" className="text-xs">
              {course.credits} hp
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Hidden dialog trigger button with proper accessibility */}
      <div className="hidden">
        <CourseReviewDialog
          course={course}
          trigger={
            <button
              ref={dialogTriggerRef}
              type="button"
              aria-label={`View reviews for ${course.name}`}
            />
          }
        />
      </div>
    </div>
  );
}
