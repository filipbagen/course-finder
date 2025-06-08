'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { GripVertical, Trash2, Calendar, Clock, BookOpen } from 'lucide-react';
import { CourseWithEnrollment } from '@/types/types';
import { cn } from '@/lib/utils';

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
  const semesterText =
    course.semester.length > 1
      ? `T${course.semester.join(', ')}`
      : `T${course.semester[0]}`;
  const periodText =
    course.period.length > 1
      ? `P${course.period.join('+')}`
      : `P${course.period[0]}`;

  // Handle course removal
  const handleRemove = () => {
    if (course.enrollment?.id && onRemove) {
      onRemove(course.enrollment.id);
    }
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn('transition-all duration-200', {
        'opacity-50 scale-95': isDragging,
        'cursor-not-allowed': readonly,
      })}
    >
      <Card
        className={cn('transition-all duration-200 group', {
          'hover:shadow-md': !isDragging && !readonly,
          'cursor-grab': !readonly && !isDragging,
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
                className="mt-1 cursor-grab hover:text-primary transition-colors"
                aria-label={`Drag ${course.name}`}
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

            {/* Remove button - only show when not readonly */}
            {!readonly && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemove}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label={`Remove ${course.name} from schedule`}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            )}
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
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <Calendar className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {semesterText}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <Clock className="h-3 w-3 text-muted-foreground" />
                <span className="text-xs text-muted-foreground">
                  {periodText}
                </span>
              </div>
            </div>

            {/* Credits */}
            <Badge variant="secondary" className="text-xs">
              {course.credits} hp
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
