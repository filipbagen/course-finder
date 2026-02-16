'use client'

import React from 'react'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  GripVertical,
  Trash2,
  Blocks,
  School,
  Calendar,
  AlignVerticalJustifyCenter,
  SignpostBig,
  Plus,
  LogIn,
  Star,
  AlertTriangle,
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Course,
  CourseWithEnrollment,
  isCourseWithEnrollment,
} from '@/types/types'
import { useCourseDetailsSheet } from '@/features/courses/hooks/useCourseDetailsSheet'
import { useEnrollment } from '@/features/courses/hooks/useEnrollment'
import { cn } from '@/lib/utils'
import Link from 'next/link'
import CourseReviewDialog from './CourseReviewDialog'
import { StarRating } from './StarRating'
import { useUserEnrollments } from '@/hooks/useUserEnrollments'

interface CourseCardProps {
  course: Course | CourseWithEnrollment
  variant?: 'default' | 'schedule' | 'landing'
  isAuthenticated?: boolean
  isDragging?: boolean
  dragHandleProps?: Record<string, unknown>
  onRemove?: (enrollmentId: string) => void
  className?: string
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
  const { onOpen } = useCourseDetailsSheet()
  const { addToEnrollment, deleteEnrollment: _deleteEnrollment } =
    useEnrollment(course.name, onRemove)
  const { enrolledCourses, loading: enrollmentsLoading } = useUserEnrollments()

  // Client-side conflict detection (fast)
  const conflictingCourse = React.useMemo(() => {
    if (!enrollmentsLoading && enrolledCourses) {
      return enrolledCourses.find(
        (enrolled) =>
          (course.exclusions && course.exclusions.includes(enrolled.code)) ||
          (enrolled.exclusions && enrolled.exclusions.includes(course.code)),
      )
    }
    return null
  }, [enrolledCourses, enrollmentsLoading, course.exclusions, course.code])

  const handleCardClick = (e: React.MouseEvent) => {
    // Prevent click from triggering when interacting with buttons, links, or dropdown elements
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('a') ||
      (e.target as HTMLElement).closest('[data-radix-collection-item]') ||
      (e.target as HTMLElement).closest('[data-radix-menu-content]') ||
      (e.target as HTMLElement).closest('[data-radix-dropdown-menu-content]') ||
      (e.target as HTMLElement).closest('[role="menuitem"]')
    ) {
      return
    }

    // Open sheet only for default and landing variants
    if (variant === 'default' || variant === 'landing') {
      onOpen(course as Course)
    }
  }

  // Format display text
  const semesterText =
    course.semester && course.semester.length > 0
      ? course.semester.length > 1
        ? `T${course.semester.join(', ')}`
        : `T${course.semester[0]}`
      : 'T?'

  const periodText =
    course.period && course.period.length > 1
      ? `P${course.period.join('+')}`
      : course.period && course.period.length === 1
        ? `P${course.period[0]}`
        : 'P?'

  const blockText =
    course.block && course.block.length > 0
      ? `Block ${course.block.join(', ')}`
      : 'Block ?'

  // Calculate rating from pre-fetched data
  const courseRating = React.useMemo(() => {
    if (course.reviews && Array.isArray(course.reviews)) {
      const ratings = course.reviews
        .map((review: { rating: number }) => review.rating)
        .filter((r: number) => r != null && !isNaN(r))
      const averageRating =
        ratings.length > 0
          ? ratings.reduce((sum: number, rating: number) => sum + rating, 0) /
          ratings.length
          : 0
      return {
        averageRating,
        count: ratings.length,
      }
    }
    return {
      averageRating: 0,
      count: 0,
    }
  }, [course.reviews])

  // Handle enrollment for authenticated users
  const handleEnrollment = (semester?: number | number[]) => {
    if (!addToEnrollment) return

    // Extract a usable semester value
    let targetSemester: number

    if (typeof semester === 'number') {
      // If it's already a number, use it directly
      targetSemester = semester
    } else if (Array.isArray(semester) && semester.length > 0) {
      // Use the first semester from the array
      targetSemester = semester[0] ?? 1
    } else if (
      course.semester &&
      Array.isArray(course.semester) &&
      course.semester.length > 0
    ) {
      // Fallback to the course's first semester
      targetSemester = course.semester[0] ?? 1
    } else {
      // Default fallback
      targetSemester = 1
    }

    addToEnrollment(course.id, targetSemester)
  }

  // Handle course removal (for schedule variant)
  const handleRemoveCourse = () => {
    if (isCourseWithEnrollment(course) && course.enrollment?.id && onRemove) {
      onRemove(course.enrollment.id)
    }
  }

  // Enrollment Button Component
  const EnrollmentButton = () => {
    if (!isAuthenticated) {
      return (
        <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0">
          <Link href="/login">
            <LogIn className="h-4 w-4" />
          </Link>
        </Button>
      )
    }

    // If course has multiple semesters, show dropdown
    if (course.semester && course.semester.length > 1) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="sm"
              className="h-8 w-8 cursor-pointer p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {course.semester.map((semester) => (
              <DropdownMenuItem
                key={semester}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation()
                  handleEnrollment(semester)
                }}
              >
                Lägg till i termin {semester}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }

    // Single semester or default case
    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation()
          handleEnrollment(course.semester)
        }}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    )
  }

  return (
    <Card
      onClick={handleCardClick}
      className={cn(
        'group transition-all duration-200',
        {
          // Default and Landing variants - for course browsing and carousel
          'cursor-pointer bg-gradient-to-br from-white to-gray-50/50 hover:scale-[1.02] hover:shadow-lg dark:from-card dark:to-card':
            variant === 'default' || variant === 'landing',

          // Schedule variant - for schedule management
          'hover:shadow-md': variant === 'schedule' && !isDragging,
          'scale-95 opacity-50': variant === 'schedule' && isDragging,
          'cursor-grab': variant === 'schedule' && !isDragging,
          'cursor-grabbing': variant === 'schedule' && isDragging,
        },
        className,
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

          <div className="min-w-0 flex-1">
            <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
              {course.name}
            </h3>
            <p className="mt-1 font-mono text-sm text-muted-foreground">
              {course.code}
            </p>
          </div>

          <div className="flex items-start gap-2">
            {/* Action buttons */}
            {variant === 'default' && <EnrollmentButton />}

            {variant === 'schedule' && isCourseWithEnrollment(course) && (
              <>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleRemoveCourse}
                  className="h-8 w-8 p-0 text-red-500 hover:bg-red-50 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>

                {/* Review button for enrolled courses */}
                <CourseReviewDialog
                  course={course}
                  trigger={
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-8 w-8 p-0 text-amber-500 hover:bg-amber-50 hover:text-amber-700"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Star className="h-4 w-4" />
                    </Button>
                  }
                />
              </>
            )}
          </div>
        </div>

        {/* Exclusion Warning */}
        {conflictingCourse && (
          <div className="mt-2 rounded-md border border-amber-200 bg-amber-50 p-2 dark:border-amber-800/50 dark:bg-amber-900/20">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-3 w-3 flex-shrink-0 text-amber-600 dark:text-amber-400" />
              <span className="text-xs text-amber-700 dark:text-amber-300">
                Konflikt med {conflictingCourse.name} ({conflictingCourse.code})
              </span>
            </div>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-3 pt-0">
        {/* Main Field of Study */}
        <div className="flex items-start gap-2">
          <SignpostBig className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" />
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
            <School className="h-4 w-4 flex-shrink-0 text-muted-foreground" />
            <span className="text-sm text-muted-foreground">
              {course.campus}
            </span>
          </div>
        )}

        {/* Schedule Information */}
        <div className="flex items-center justify-between border-t border-border pt-4">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {semesterText}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <AlignVerticalJustifyCenter className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {periodText}
              </span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {courseRating.count > 0 && (
              <div className="flex flex-row items-center gap-1">
                <StarRating
                  initialValue={courseRating.averageRating}
                  size={12}
                  allowFraction
                  readonly
                  fillColor="#ffd700"
                  emptyColor="#e4e5e9"
                  className="flex-shrink-0"
                  iconsCount={1}
                />
                <span className="text-xs font-medium">
                  {courseRating.averageRating.toFixed(1)}
                </span>
              </div>
            )}
            <div className="flex items-center gap-1">
              <Blocks className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{blockText}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

export default React.memo(CourseCard)
