'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  GripVertical,
  Trash2,
  MapPin,
  Calendar,
  Clock,
  BookOpen,
  Plus,
  LogIn,
} from 'lucide-react';
import {
  Course,
  CourseWithEnrollment,
  isCourseWithEnrollment,
} from '@/types/types';
import { useEnrollment } from '@/hooks/useEnrollment';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface CourseCardProps {
  course: Course | CourseWithEnrollment;
  variant?: 'default' | 'schedule' | 'landing';
  isAuthenticated?: boolean;
  isDragging?: boolean;
  dragHandleProps?: any;
  onRemove?: (enrollmentId: string) => void;
  className?: string;
}

/**
 * Unified Course Card Component
 *
 * A single, reusable course card component that follows SOLID principles.
 * Displays essential course information in a clean, intuitive design.
 * Adapts to different contexts via the variant prop.
 */
const CourseCard = ({
  course,
  variant = 'default',
  isAuthenticated = false,
  isDragging = false,
  dragHandleProps,
  onRemove,
  className,
}: CourseCardProps) => {
  const { addToEnrollment, deleteEnrollment } = useEnrollment(
    course.name,
    onRemove
  );

  // Format display text
  const semesterText =
    course.semester && course.semester.length > 0
      ? course.semester.length > 1
        ? `T${course.semester.join('+')}`
        : `T${course.semester[0]}`
      : 'T?';

  const periodText =
    course.period && course.period.length > 1
      ? `P${course.period.join('+')}`
      : course.period && course.period.length === 1
      ? `P${course.period[0]}`
      : 'P?';

  const blockText =
    course.block && course.block.length > 0
      ? `Block ${course.block.join(', ')}`
      : 'Block ?';

  // Handle enrollment for authenticated users
  const handleEnrollment = (semester?: number | number[]) => {
    if (!addToEnrollment) return;

    // Extract a usable semester value from the semester array
    let targetSemester: number;

    if (Array.isArray(semester) && semester.length > 0) {
      // Use the first semester from the array
      targetSemester = semester[0];
    } else if (typeof semester === 'number') {
      // If it's already a number, use it directly
      targetSemester = semester;
    } else if (
      course.semester &&
      Array.isArray(course.semester) &&
      course.semester.length > 0
    ) {
      // Fallback to the course's first semester
      targetSemester = course.semester[0];
    } else {
      // Default fallback
      targetSemester = 1;
    }

    addToEnrollment(course.id, targetSemester);
  };

  // Handle course removal (for schedule variant)
  const handleRemoveCourse = () => {
    if (isCourseWithEnrollment(course) && course.enrollment?.id && onRemove) {
      onRemove(course.enrollment.id);
    }
  };

  // Enrollment Button Component
  const EnrollmentButton = () => {
    if (!isAuthenticated) {
      return (
        <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
      );
    }

    return (
      <Button
        size="sm"
        onClick={() => handleEnrollment(course.semester)}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  };

  return (
    <Card
      className={cn(
        'transition-all duration-200 group',
        {
          // Default and Landing variants - for course browsing and carousel
          'hover:shadow-lg hover:scale-[1.02] cursor-pointer bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50':
            variant === 'default' || variant === 'landing',

          // Schedule variant - for schedule management
          'hover:shadow-md': variant === 'schedule' && !isDragging,
          'opacity-50 scale-95': variant === 'schedule' && isDragging,
          'cursor-grab': variant === 'schedule' && !isDragging,
          'cursor-grabbing': variant === 'schedule' && isDragging,
        },
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          {/* Drag handle for schedule variant */}
          {variant === 'schedule' && dragHandleProps && (
            <div {...dragHandleProps} className="mt-1">
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

          <div className="flex items-start gap-2">
            {/* Action buttons */}
            {variant === 'default' && <EnrollmentButton />}

            {variant === 'schedule' && isCourseWithEnrollment(course) && (
              <Button
                size="sm"
                variant="ghost"
                onClick={handleRemoveCourse}
                className="h-8 w-8 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
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

        {/* Location - Not shown in schedule variant for space efficiency */}
        {variant !== 'schedule' && course.campus && (
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              {course.campus}
            </span>
          </div>
        )}

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
          <div className="text-xs text-muted-foreground">{blockText}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export default CourseCard;
