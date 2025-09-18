'use client';

import React, { useState, useEffect } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  SignpostBig,
  School,
  Target,
  Plus,
  LogIn,
} from 'lucide-react';
import { Course, CourseWithEnrollment } from '@/types/types';
import { useSchedule } from '@/app/(dashboard)/schedule/components/ScheduleProvider';
import { ScheduleActions } from '@/app/(dashboard)/schedule/types/schedule.types';
import { StarRating } from './StarRating';
import CourseReviews from './CourseReviews';
import { cn } from '@/lib/utils';
import { useEnrollment } from '@/hooks/useEnrollment';
import Link from 'next/link';

interface CourseReviewDialogProps {
  course: Course | CourseWithEnrollment;
  trigger?: React.ReactNode;
  onRemove?: (enrollmentId: string) => void;
  isFromSchedule?: boolean;
  initialReviewsData?: {
    averageRating: number;
    count: number;
  };
}

const DetailSection = ({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={cn(
      'rounded-xl bg-neutral-50 dark:bg-slate-800/50 p-4 transition-all hover:bg-neutral-100 dark:hover:bg-slate-800/80 border border-neutral-200 dark:border-slate-700/50',
      className
    )}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground pl-11">
      {children}
    </div>
  </div>
);

const CourseReviewDialog: React.FC<CourseReviewDialogProps> = ({
  course,
  trigger,
  onRemove,
  isFromSchedule = false,
  initialReviewsData,
}) => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { state, dispatch } = useSchedule();

  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    count: number;
  }>({
    averageRating: initialReviewsData?.averageRating || 0,
    count: initialReviewsData?.count || 0,
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
        courseId: course.id.toString(),
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

  // Enrollment Button Component
  const EnrollmentButton = () => {
    const { addToEnrollment } = useEnrollment(course.name);

    // Handle enrollment for authenticated users
    const handleEnrollment = (semester?: number | number[]) => {
      if (!addToEnrollment) return;

      // Extract a usable semester value
      let targetSemester: number;

      if (typeof semester === 'number') {
        // If it's already a number, use it directly
        targetSemester = semester;
      } else if (Array.isArray(semester) && semester.length > 0) {
        // Use the first semester from the array
        targetSemester = semester[0];
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

    // If course has multiple semesters, show dropdown
    if (course.semester && course.semester.length > 1) {
      return (
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-8 w-8 p-0 cursor-pointer">
              <Plus className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            {course.semester.map((semester) => (
              <DropdownMenuItem
                key={semester}
                className="cursor-pointer"
                onClick={(e) => {
                  e.stopPropagation();
                  handleEnrollment(semester);
                }}
              >
                Lägg till i termin {semester}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      );
    }

    // Single semester or default case
    return (
      <Button
        size="sm"
        onClick={(e) => {
          e.stopPropagation();
          handleEnrollment(course.semester);
        }}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  };

  // Simplified course info component
  const CourseInfo = () => (
    <div className="space-y-6">
      {/* Course Header Info */}
      <div className="rounded-2xl bg-gradient-to-br from-primary/5 to-primary/10 dark:from-primary/10 dark:to-primary/5 p-5 border border-neutral-200 dark:border-slate-700/50">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Kurskod
            </p>
            <p className="font-medium text-lg">{course.code}</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Poäng
            </p>
            <p className="font-medium text-lg">{Number(course.credits)} hp</p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Nivå
            </p>
            <p className="font-medium">
              {course.advanced ? 'Avancerad' : 'Grundnivå'}
            </p>
          </div>
          <div>
            <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
              Kurstyp
            </p>
            <p className="font-medium">
              {course.courseType || 'Information saknas'}
            </p>
          </div>

          {/* Rating information if available */}
          {currentReviewData.count > 0 && (
            <div className="col-span-2 mt-2 pt-3 border-t border-neutral-200 dark:border-slate-700/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Betyg från studenter
              </p>
              <div className="flex items-center gap-2 flex-row">
                <StarRating
                  initialValue={currentReviewData.averageRating}
                  size={20}
                  allowFraction
                  readonly
                  fillColor="#ffd700"
                  emptyColor="#e4e5e9"
                  className="flex-shrink-0"
                />
                <span className="font-medium ml-2">
                  {currentReviewData.averageRating.toFixed(1)} (
                  {currentReviewData.count}{' '}
                  {currentReviewData.count === 1 ? 'recension' : 'recensioner'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Main Field of Study */}
        <DetailSection
          icon={<SignpostBig className="h-4 w-4 text-primary" />}
          title="Huvudområden"
        >
          <div className="flex flex-wrap gap-2">
            {course.mainFieldOfStudy && course.mainFieldOfStudy.length > 0 ? (
              course.mainFieldOfStudy.map((field) => (
                <Badge key={field} variant="default" className="rounded-full">
                  {field}
                </Badge>
              ))
            ) : (
              <p>Inget huvudområde specificerat.</p>
            )}
          </div>
        </DetailSection>

        {/* Campus Info */}
        <DetailSection icon={<School className="h-4 w-4" />} title="Campus">
          <p>{course.campus || 'Information saknas'}</p>
        </DetailSection>

        {/* Time and Schedule side by side */}
        <div className="grid grid-cols-2 gap-4 md:contents">
          {/* Time Info */}
          <DetailSection
            icon={<Clock className="h-4 w-4" />}
            title="Tidsåtgång"
          >
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-muted-foreground">Schemalagd tid</p>
                <p className="font-medium">
                  {course.scheduledHours
                    ? `${Number(course.scheduledHours)}h`
                    : 'Okänt'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Självstudier</p>
                <p className="font-medium">
                  {course.selfStudyHours
                    ? `${Number(course.selfStudyHours)}h`
                    : 'Okänt'}
                </p>
              </div>
            </div>
          </DetailSection>

          {/* Schedule Info */}
          <DetailSection icon={<Calendar className="h-4 w-4" />} title="Schema">
            <div className="grid grid-cols-3 gap-2">
              <div>
                <p className="text-xs text-muted-foreground">Termin</p>
                <p className="font-medium">
                  {course.semester?.length > 0
                    ? `${course.semester.join(', ')}`
                    : 'T?'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Period</p>
                <p className="font-medium">
                  {course.period?.length > 0
                    ? `${course.period.join('+')}`
                    : 'P?'}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Block</p>
                <p className="font-medium">
                  {course.block?.length > 0
                    ? `${course.block.join(', ')}`
                    : 'Block ?'}
                </p>
              </div>
            </div>
          </DetailSection>
        </div>
      </div>

      {/* Examination */}
      <DetailSection
        icon={<NotebookPen className="h-4 w-4" />}
        title="Examination"
      >
        {Array.isArray(course.examination) && course.examination.length > 0 ? (
          <ul className="space-y-2">
            {course.examination.map((exam, index) => (
              <li key={index} className="text-sm p-2 bg-white/5 rounded-lg">
                <div className="font-medium">{exam.name}</div>
                <div className="flex justify-between text-xs mt-1">
                  <span>{Number(exam.credits)} hp</span>
                  <span>Betygsskala: {exam.gradingScale}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>Information saknas.</p>
        )}
      </DetailSection>
    </div>
  );

  // Get the current review data (prefer initial data if available)
  const currentReviewData = initialReviewsData || reviewsData;

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

        <DialogContent className="max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <DialogHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DialogTitle className="text-2xl font-bold">
                  {course.name}
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  {course.code} • {Number(course.credits)} hp
                </DialogDescription>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  {currentReviewData.count > 0 ? (
                    <>
                      <StarRating
                        initialValue={currentReviewData.averageRating}
                        size={20}
                        allowFraction
                        readonly
                        fillColor="#ffd700"
                        emptyColor="#e4e5e9"
                      />
                      <span className="text-sm text-muted-foreground">
                        {currentReviewData.averageRating.toFixed(1)} (
                        {currentReviewData.count} recensioner)
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
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="info">Kursinformation</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Recensioner{' '}
                    {currentReviewData.count > 0 &&
                      `(${currentReviewData.count})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-8">
                  <CourseInfo />
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews
                    courseId={course.id.toString()}
                    onReviewDataUpdate={updateReviewData}
                    isFromSchedule={isFromSchedule}
                  />
                </TabsContent>
              </Tabs>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  // If from schedule and mobile, use Drawer
  if (isFromSchedule && !isDesktop) {
    return (
      <Drawer open={open} onOpenChange={setOpen}>
        <DrawerTrigger asChild>
          {trigger || (
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MessageSquare className="h-4 w-4" />
            </Button>
          )}
        </DrawerTrigger>

        <DrawerContent className="h-full max-h-[90vh] shadow-2xl">
          <DrawerHeader>
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <DrawerTitle className="text-xl font-bold">
                  {course.name}
                </DrawerTitle>
                <DrawerDescription className="text-muted-foreground">
                  {course.code} • {Number(course.credits)} hp
                </DrawerDescription>

                {/* Rating */}
                <div className="flex items-center gap-2 mt-3">
                  {currentReviewData.count > 0 ? (
                    <>
                      <StarRating
                        initialValue={currentReviewData.averageRating}
                        size={18}
                        allowFraction
                        readonly
                        fillColor="#ffd700"
                        emptyColor="#e4e5e9"
                      />
                      <span className="text-sm text-muted-foreground">
                        {currentReviewData.averageRating.toFixed(1)} (
                        {currentReviewData.count} recensioner)
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
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="info">Kursinformation</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Recensioner{' '}
                    {currentReviewData.count > 0 &&
                      `(${currentReviewData.count})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                  <CourseInfo />
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews
                    courseId={course.id.toString()}
                    onReviewDataUpdate={updateReviewData}
                    isFromSchedule={isFromSchedule}
                  />
                </TabsContent>
              </Tabs>
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
              {currentReviewData.count > 0
                ? `${currentReviewData.averageRating.toFixed(1)} (${
                    currentReviewData.count
                  })`
                : 'Recensioner'}
            </span>
          </Button>
        )}
      </DialogTrigger>{' '}
      <DialogContent className="max-w-4xl h-full max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
          <DialogDescription>
            Recensioner för {course.name}, kurskod {course.code}.
            {currentReviewData.count > 0
              ? ` Genomsnittligt betyg ${currentReviewData.averageRating.toFixed(
                  1
                )} av 5 baserat på ${currentReviewData.count} recensioner.`
              : ' Inga recensioner ännu.'}
          </DialogDescription>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto">
          <div className="space-y-6 p-6">
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="info">Kursinformation</TabsTrigger>
                <TabsTrigger value="reviews">
                  Recensioner{' '}
                  {currentReviewData.count > 0 &&
                    `(${currentReviewData.count})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <CourseInfo />
              </TabsContent>

              <TabsContent value="reviews">
                <CourseReviews
                  courseId={course.id.toString()}
                  onReviewDataUpdate={updateReviewData}
                  isFromSchedule={false}
                />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CourseReviewDialog;
