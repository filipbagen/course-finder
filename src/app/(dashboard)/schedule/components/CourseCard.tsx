
'use client';

import React from 'react';
import { useDraggable } from '@dnd-kit/core';
import { CourseWithEnrollment } from '@/types/types';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  GripVertical, 
  MoreHorizontal, 
  Eye, 
  Trash2,
  Clock,
  BookOpen,
  Users,
  X,
  Calendar
} from 'lucide-react';

interface CourseCardProps {
  course: CourseWithEnrollment;
  isDragging?: boolean;
  readonly?: boolean;
  compact?: boolean;
  onRemove?: (enrollmentId: string) => void;
}

/**
 * Course Card Component
 * 
 * Displays course information in the schedule grid.
 * Supports drag and drop operations when not readonly.
 * 
 * Features:
 * - Draggable functionality
 * - Compact and full view modes
 * - Course actions menu
 * - Visual indicators for course status
 * - Accessibility support
 */
export function CourseCard({ 
  course, 
  isDragging = false, 
  readonly = false,
  compact = false,
  onRemove
}: CourseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging: isDraggingThis,
  } = useDraggable({
    id: course.id,
    disabled: readonly,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  // Handle course removal
  const handleRemoveCourse = () => {
    if (course.enrollment?.id && onRemove) {
      onRemove(course.enrollment.id);
    }
  };

  // Handle view course details
  const handleViewCourse = () => {
    // TODO: Navigate to course details or open modal
    console.log('View course details:', course.id);
  };

  // Get course status color
  const getStatusColor = () => {
    if (course.enrollment?.status === 'completed') return 'bg-green-500';
    if (course.enrollment?.status === 'enrolled') return 'bg-blue-500';
    if (course.enrollment?.status === 'planned') return 'bg-yellow-500';
    return 'bg-gray-500';
  };

  if (compact) {
    return (
      <Card
        ref={setNodeRef}
        style={style}
        className={cn(
          'transition-all duration-200 cursor-pointer group',
          {
            'opacity-50 scale-95': isDraggingThis,
            'shadow-lg scale-105 z-50': isDragging,
            'hover:shadow-md': !readonly && !isDraggingThis,
            'cursor-grab': !readonly,
            'cursor-grabbing': isDraggingThis,
          }
        )}
      >
        <CardContent className="p-3">
          <div className="flex items-start gap-3">
            {/* Drag Handle */}
            {!readonly && (
              <button
                {...attributes}
                {...listeners}
                className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
                aria-label="Drag course"
              >
                <GripVertical className="h-4 w-4 text-muted-foreground" />
              </button>
            )}

            {/* Course Info */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-sm text-muted-foreground font-mono">
                    {course.code}
                  </span>
                  <span className="text-xs bg-secondary text-secondary-foreground px-2 py-0.5 rounded">
                    {course.credits} hp
                  </span>
                </div>
                {!readonly && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveCourse();
                    }}
                    className="opacity-0 group-hover:opacity-100 text-muted-foreground hover:text-destructive transition-all"
                    aria-label={`Remove ${course.name}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
              
              <h3 className="font-medium text-sm leading-tight mb-2 group-hover:text-primary transition-colors">
                {course.name}
              </h3>
              
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-3 w-3" />
                  <span>S{course.enrollment.semester} P{course.enrollment.period}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <Clock className="h-3 w-3" />
                  <span>{course.scheduledHours || 0}h</span>
                </div>
              </div>
            </div>
          </div>

          {course.content && (
            <div className="mt-2 pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground line-clamp-2">
                {course.content}
              </p>
            </div>
          )}

          {course.examinations && course.examinations.length > 0 && (
            <div className="mt-2 pt-2 border-t border-border">
              <div className="flex flex-wrap gap-1">
                {course.examinations.map((exam) => (
                  <span 
                    key={exam.id}
                    className="text-xs bg-accent text-accent-foreground px-2 py-0.5 rounded-full"
                  >
                    {exam.code}
                  </span>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  // Full card view (for detailed display)
  return (
    <Card
      ref={setNodeRef}
      style={style}
      className={cn(
        'transition-all duration-200 cursor-pointer group',
        {
          'opacity-50 scale-95': isDraggingThis,
          'shadow-lg scale-105 z-50': isDragging,
          'hover:shadow-md': !readonly && !isDraggingThis,
          'cursor-grab': !readonly,
          'cursor-grabbing': isDraggingThis,
        }
      )}
    >
      <CardHeader className="pb-2">
        <div className="flex items-start gap-3">
          {/* Drag Handle */}
          {!readonly && (
            <button
              {...attributes}
              {...listeners}
              className="mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
              aria-label="Drag course"
            >
              <GripVertical className="h-5 w-5 text-muted-foreground" />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <CardTitle className="text-base leading-tight">
                  {course.name}
                </CardTitle>
                <CardDescription className="mt-1">
                  {course.code}
                </CardDescription>
              </div>

              {/* Actions */}
              {!readonly && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={handleViewCourse}>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={handleRemoveCourse}
                      className="text-destructive"
                    >
                      <Trash2 className="h-4 w-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        {/* Course Description */}
        {course.content && (
          <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
            {course.content}
          </p>
        )}

        {/* Course Metadata */}
        <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
          {course.credits && (
            <div className="flex items-center gap-1">
              <BookOpen className="h-4 w-4" />
              <span>{course.credits} credits</span>
            </div>
          )}

          {course.scheduledHours && (
            <div className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              <span>{course.scheduledHours}h/week</span>
            </div>
          )}

          {course.enrollment?.grade && (
            <div className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Grade: {course.enrollment.grade}</span>
            </div>
          )}
        </div>

        {/* Status Badge */}
        <div className="flex items-center justify-between mt-3">
          <Badge 
            variant={course.enrollment?.status === 'completed' ? 'default' : 'secondary'}
            className="capitalize"
          >
            {course.enrollment?.status || 'planned'}
          </Badge>

          {/* Additional course tags */}
          <div className="flex gap-1">
            {course.examinations?.map((exam) => (
              <Badge key={exam.id} variant="outline" className="text-xs">
                {exam.code}
              </Badge>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
