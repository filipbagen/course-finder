import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  MessageSquare,
  Star,
  Clock,
  MapPin,
  BookOpen,
  NotebookPen,
  Trash2,
  ArrowRightLeft,
  Users,
  Calendar,
  Award,
} from 'lucide-react';
import { Course, CourseWithEnrollment } from '@/types/types';
import { useMediaQuery } from '@/hooks/use-media-query';
import { useSchedule } from '@/app/(dashboard)/schedule/components/ScheduleProvider';
import { ScheduleActions } from '@/app/(dashboard)/schedule/types/schedule.types';
import { StarRating } from './StarRating';
import CourseReviews from './CourseReviews';
import { cn } from '@/lib/utils';

interface CourseReviewDialogProps {
  course: Course | CourseWithEnrollment;
  trigger?: React.ReactNode;
  onRemove?: (enrollmentId: string) => void;
  isFromSchedule?: boolean;
}

const CourseReviewDialog: React.FC<CourseReviewDialogProps> = ({
  course,
  trigger,
  onRemove,
  isFromSchedule = false,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const isMobile = useMediaQuery('(max-width: 767px)');
  const { state, dispatch } = useSchedule();

  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    count: number;
  }>({
    averageRating: 0,
    count: 0,
  });

  // Check if course is enrolled
  const isEnrolled = 'enrollment' in course;
  const currentSemester = isEnrolled
    ? (course as any).enrollment.semester
    : null;

  const updateReviewData = (averageRating: number, count: number) => {
    setReviewsData({ averageRating, count });
  };

  // Handle course removal
  const handleRemove = () => {
    if (isEnrolled && onRemove && (course as any).enrollment?.id) {
      onRemove((course as any).enrollment.id);
      setOpen(false);
    }
  };

  // Handle course movement
  const handleMoveCourse = (toSemester: number) => {
    if (!isEnrolled || !currentSemester) return;

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
    setOpen(false);
  };

  // Get available semesters for moving
  const getAvailableSemesters = () => {
    if (!isEnrolled || !currentSemester) return [];

    // Only allow moving courses from semester 7 and 9, and only between 7 and 9
    if (currentSemester === 7) {
      return [9]; // Can move from 7 to 9
    } else if (currentSemester === 9) {
      return [7]; // Can move from 9 to 7
    }
    return []; // Semester 8 courses cannot be moved
  };

  const availableSemesters = getAvailableSemesters();

  // Enhanced course info component for schedule view
  const ScheduleCourseInfo = () => (
    <div className="space-y-6">
      {/* Key Information Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Examination */}
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 p-4 rounded-xl border border-blue-200 dark:border-blue-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <NotebookPen className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              Examination
            </h3>
          </div>
          <div className="space-y-2">
            {Array.isArray(course.examination) &&
            course.examination.length > 0 ? (
              course.examination.map((exam, index) => (
                <div
                  key={index}
                  className="bg-white/60 dark:bg-slate-800/60 p-3 rounded-lg"
                >
                  <div className="font-medium text-sm">{exam.name}</div>
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{exam.credits} hp</span>
                    <span>{exam.gradingScale}</span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Information saknas
              </p>
            )}
          </div>
        </div>

        {/* Time & Hours */}
        <div className="bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 p-4 rounded-xl border border-green-200 dark:border-green-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Clock className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-green-900 dark:text-green-100">
              Tidsåtgång
            </h3>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Schemalagd tid
              </span>
              <span className="font-medium">
                {course.scheduledHours ? `${course.scheduledHours}h` : 'Okänt'}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">
                Självstudier
              </span>
              <span className="font-medium">
                {course.selfStudyHours ? `${course.selfStudyHours}h` : 'Okänt'}
              </span>
            </div>
            <div className="flex justify-between items-center pt-2 border-t border-green-200 dark:border-green-700">
              <span className="text-sm font-medium">Totalt</span>
              <span className="font-bold text-green-700 dark:text-green-300">
                {course.credits} hp
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Information */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Campus */}
        <div className="bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 p-4 rounded-xl border border-purple-200 dark:border-purple-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
              <MapPin className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-purple-900 dark:text-purple-100">
              Campus
            </h3>
          </div>
          <p className="text-lg font-medium">
            {course.campus || 'Information saknas'}
          </p>
        </div>

        {/* Main Field of Study */}
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 p-4 rounded-xl border border-orange-200 dark:border-orange-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <BookOpen className="h-4 w-4 text-white" />
            </div>
            <h3 className="font-semibold text-orange-900 dark:text-orange-100">
              Huvudområde
            </h3>
          </div>
          <div className="flex flex-wrap gap-2">
            {course.mainFieldOfStudy && course.mainFieldOfStudy.length > 0 ? (
              course.mainFieldOfStudy.map((field) => (
                <Badge
                  key={field}
                  variant="secondary"
                  className="bg-white/80 dark:bg-slate-700/80"
                >
                  {field}
                </Badge>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">
                Inget specificerat
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Info */}
      <div className="bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950/50 dark:to-slate-900/50 p-4 rounded-xl border border-slate-200 dark:border-slate-800">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-slate-500 rounded-full flex items-center justify-center">
            <Calendar className="h-4 w-4 text-white" />
          </div>
          <h3 className="font-semibold text-slate-900 dark:text-slate-100">
            Schema
          </h3>
        </div>
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Termin</p>
            <p className="font-medium">
              {course.semester?.length > 0 ? course.semester.join(', ') : 'T?'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Period</p>
            <p className="font-medium">
              {course.period?.length > 0 ? course.period.join('+') : 'P?'}
            </p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Block</p>
            <p className="font-medium">
              {course.block?.length > 0 ? course.block.join(', ') : 'Block ?'}
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  // Fetch review data on mount
  useEffect(() => {
    if (course?.id) {
      const fetchReviewData = async () => {
        try {
          const response = await fetch(`/api/courses/${course.id}/reviews`);
          const result = await response.json();

          if (response.ok && result.success) {
            setReviewsData({
              averageRating: result.data.averageRating,
              count: result.data.reviews.length,
            });
          }
        } catch (error) {
          console.error('Error fetching course reviews:', error);
        }
      };

      fetchReviewData();
    }
  }, [course?.id]);

  // If from schedule and desktop, use Dialog
  if (isFromSchedule && isDesktop) {
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </DialogTrigger>

        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {course.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {course.code} • {course.credits} hp
                </DialogDescription>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  {reviewsData.count > 0 ? (
                    <>
                      <StarRating
                        initialValue={reviewsData.averageRating}
                        size={20}
                        allowFraction
                        readonly
                        fillColor="#ffd700"
                        emptyColor="#e4e5e9"
                      />
                      <span className="text-sm text-muted-foreground">
                        {reviewsData.averageRating.toFixed(1)} (
                        {reviewsData.count} recensioner)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Inga recensioner ännu
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {availableSemesters.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Flytta
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableSemesters.map((semester) => (
                        <DropdownMenuItem
                          key={semester}
                          onClick={() => handleMoveCourse(semester)}
                          className="cursor-pointer"
                        >
                          Till termin {semester}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Ta bort
                  </Button>
                )}
              </div>
            </div>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            <div className="space-y-6 p-6">
              <ScheduleCourseInfo />
              <Separator />
              <CourseReviews
                courseId={course.id}
                onReviewDataUpdate={updateReviewData}
              />
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If from schedule and mobile, use Drawer
  if (isFromSchedule && isMobile) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </DrawerTrigger>

        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DrawerTitle className="text-xl font-bold">
                  {course.name}
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground">
                  {course.code} • {course.credits} hp
                </DrawerDescription>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  {reviewsData.count > 0 ? (
                    <>
                      <StarRating
                        initialValue={reviewsData.averageRating}
                        size={18}
                        allowFraction
                        readonly
                        fillColor="#ffd700"
                        emptyColor="#e4e5e9"
                      />
                      <span className="text-sm text-muted-foreground">
                        {reviewsData.averageRating.toFixed(1)} (
                        {reviewsData.count} recensioner)
                      </span>
                    </>
                  ) : (
                    <span className="text-sm text-muted-foreground">
                      Inga recensioner ännu
                    </span>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2">
                {availableSemesters.length > 0 && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="sm" variant="outline" className="gap-2">
                        <ArrowRightLeft className="h-4 w-4" />
                        Flytta
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {availableSemesters.map((semester) => (
                        <DropdownMenuItem
                          key={semester}
                          onClick={() => handleMoveCourse(semester)}
                          className="cursor-pointer"
                        >
                          Till termin {semester}
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}

                {onRemove && (
                  <Button
                    size="sm"
                    variant="destructive"
                    onClick={handleRemove}
                    className="gap-2"
                  >
                    <Trash2 className="h-4 w-4" />
                    Ta bort
                  </Button>
                )}
              </div>
            </div>
          </DrawerHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            <div className="space-y-6">
              <ScheduleCourseInfo />
              <Separator />
              <CourseReviews
                courseId={course.id}
                onReviewDataUpdate={updateReviewData}
              />
            </div>
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  // Default behavior for non-schedule contexts
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Star className="h-4 w-4 text-amber-400 fill-amber-400" />
            <span>
              {reviewsData.count > 0
                ? `${reviewsData.averageRating.toFixed(1)} (${
                    reviewsData.count
                  })`
                : 'Recensioner'}
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
          <DialogDescription>
            Recensioner för {course.name}, kurskod {course.code}.
            {reviewsData.count > 0
              ? ` Genomsnittligt betyg ${reviewsData.averageRating.toFixed(
                  1
                )} av 5 baserat på ${reviewsData.count} recensioner.`
              : ' Inga recensioner ännu.'}
          </DialogDescription>
        </DialogHeader>

        <CourseReviews
          courseId={course.id}
          onReviewDataUpdate={updateReviewData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CourseReviewDialog;
