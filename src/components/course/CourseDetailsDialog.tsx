'use client';

import React, { useEffect, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCourseDetailsSheet } from '@/hooks/useCourseDetailsSheet';
import { useCourseDetails } from '@/hooks/useCourseDetails';
import { Course } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { useUserEnrollments } from '@/hooks/useUserEnrollments';
import CourseReviews from './CourseReviews';
import { StarRating } from './StarRating';
import {
  BookOpen,
  Target,
  Users,
  NotebookPen,
  Calendar,
  Clock,
  User,
  School,
  SignpostBig,
  Lightbulb,
  Book,
  BarChart,
  FileText,
  ExternalLink,
  AlertTriangle,
  Star,
  Plus,
  LogIn,
} from 'lucide-react';
import { useSchedule } from '@/app/(dashboard)/schedule/components/ScheduleProvider';
import { ScheduleActions } from '@/app/(dashboard)/schedule/types/schedule.types';
import { ScheduleContextType } from '@/app/(dashboard)/schedule/types/schedule.types';
import { useEnrollment } from '@/hooks/useEnrollment';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const ConflictWarning = ({
  conflictingCourse,
}: {
  conflictingCourse: Course | { id: string; code: string; name: string } | null;
}) => {
  if (!conflictingCourse) return null;

  const courseName = conflictingCourse.name;
  const courseCode = conflictingCourse.code;

  return (
    <div className="p-4 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50 text-amber-700 dark:text-amber-300">
      <div className="flex items-start gap-3">
        <AlertTriangle className="h-5 w-5 text-amber-500" />
        <div>
          <h4 className="font-semibold">Kurskonflikt</h4>
          <p className="text-sm">
            Du kan inte lägga till den här kursen eftersom den krockar med en
            kurs du redan har i din planering:{' '}
            <strong>
              {courseName} ({courseCode})
            </strong>
            .
          </p>
        </div>
      </div>
    </div>
  );
};

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

const JsonContent = ({ data }: { data: any }) => {
  let parsedData = data;
  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data);
    } catch (e) {
      parsedData = { paragraph: data, list_items: [] };
    }
  }

  if (!parsedData || typeof parsedData !== 'object') return null;

  const { paragraph, list_items } = parsedData;
  const hasParagraph =
    paragraph && typeof paragraph === 'string' && paragraph.trim().length > 0;
  const hasList =
    Array.isArray(list_items) &&
    list_items.some(
      (item) => typeof item === 'string' && item.trim().length > 0
    );

  if (!hasParagraph && !hasList) return null;

  return (
    <>
      {hasParagraph && <p>{paragraph}</p>}
      {hasList && (
        <ul className="list-disc ml-6">
          {list_items
            .filter(
              (item) => typeof item === 'string' && item.trim().length > 0
            )
            .map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
        </ul>
      )}
    </>
  );
};

const CourseDetails = ({
  course,
  reviewsData,
}: {
  course: Course;
  reviewsData?: {
    averageRating: number;
    count: number;
  };
}) => {
  const { enrolledCourses, loading } = useUserEnrollments();
  const [conflictCheck, setConflictCheck] = useState<{
    hasConflict: boolean;
    conflictingCourse: Course | null;
    loading: boolean;
  }>({
    hasConflict: false,
    conflictingCourse: null,
    loading: true,
  });

  // Check for course conflicts using the API
  useEffect(() => {
    const checkConflicts = async () => {
      try {
        const response = await fetch('/api/test-conflict', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId: course.id }),
        });

        if (response.ok) {
          const result = await response.json();
          if (result.success) {
            setConflictCheck({
              hasConflict: result.data.hasConflict,
              conflictingCourse: result.data.hasConflict
                ? result.data.conflictingCourse
                : null,
              loading: false,
            });
          }
        }
      } catch (error) {
        // Fallback to client-side checking
        const conflictingCourse =
          !loading &&
          enrolledCourses &&
          enrolledCourses.find(
            (enrolled) =>
              (course.exclusions &&
                course.exclusions.includes(enrolled.code)) ||
              (enrolled.exclusions && enrolled.exclusions.includes(course.code))
          );

        setConflictCheck({
          hasConflict: !!conflictingCourse,
          conflictingCourse: conflictingCourse || null,
          loading: false,
        });
      }
    };

    if (course?.id) {
      checkConflicts();
    }
  }, [course?.id, course?.code, course?.exclusions, enrolledCourses, loading]);

  const conflictingCourse = conflictCheck.conflictingCourse;

  return (
    <div className="space-y-6">
      {conflictingCourse && (
        <ConflictWarning conflictingCourse={conflictingCourse} />
      )}
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
          {reviewsData && reviewsData.count > 0 && (
            <div className="col-span-2 mt-2 pt-3 border-t border-neutral-200 dark:border-slate-700/50">
              <p className="text-xs uppercase tracking-wider text-muted-foreground mb-1">
                Betyg från studenter
              </p>
              <div className="flex items-center gap-2 flex-row">
                <StarRating
                  initialValue={reviewsData.averageRating}
                  size={20}
                  allowFraction
                  readonly
                  fillColor="#ffd700"
                  emptyColor="#e4e5e9"
                  className="flex-shrink-0"
                />
                <span className="font-medium ml-2">
                  {reviewsData.averageRating.toFixed(1)} ({reviewsData.count}{' '}
                  {reviewsData.count === 1 ? 'recension' : 'recensioner'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Main Fields */}
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

        {/* Campus and Examinator side by side on mobile */}
        <div className="grid grid-cols-2 gap-4 md:contents">
          {/* Campus Info */}
          <DetailSection icon={<School className="h-4 w-4" />} title="Campus">
            <p>{course.campus || 'Information saknas'}</p>
          </DetailSection>

          {/* Examiner Info */}
          <DetailSection icon={<User className="h-4 w-4" />} title="Examinator">
            <p>{course.examiner || 'Information saknas'}</p>
          </DetailSection>
        </div>

        {/* Time Info */}
        <DetailSection icon={<Clock className="h-4 w-4" />} title="Tidsåtgång">
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
        <DetailSection
          icon={<Calendar className="h-4 w-4" />}
          title="Schema"
          className="md:col-span-2"
        >
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

      <Separator className="bg-neutral-200 dark:bg-slate-700" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Detaljer</h2>

        {/* Lärandemål */}
        {(() => {
          const content = <JsonContent data={course.learningOutcomes} />;
          return (
            content && (
              <DetailSection
                icon={<Target className="h-4 w-4" />}
                title="Lärandemål"
              >
                {content}
              </DetailSection>
            )
          );
        })()}

        {/* Kursinnehåll */}
        {(() => {
          const content = <JsonContent data={course.content} />;
          return (
            content && (
              <DetailSection
                icon={<BookOpen className="h-4 w-4" />}
                title="Kursinnehåll"
              >
                {content}
              </DetailSection>
            )
          );
        })()}

        {/* Undervisningsformer */}
        {(() => {
          const content = <JsonContent data={course.teachingMethods} />;
          return (
            content && (
              <DetailSection
                icon={<Lightbulb className="h-4 w-4" />}
                title="Undervisningsformer"
              >
                {content}
              </DetailSection>
            )
          );
        })()}

        {/* Förkunskaper */}
        {(() => {
          let parsedData: { paragraph: string | null; list_items: string[] } = {
            paragraph: null,
            list_items: [],
          };
          if (typeof course.prerequisites === 'string') {
            try {
              const parsed = JSON.parse(course.prerequisites);
              parsedData = {
                paragraph:
                  typeof parsed.paragraph === 'string'
                    ? parsed.paragraph
                    : null,
                list_items: Array.isArray(parsed.list_items)
                  ? parsed.list_items
                  : [],
              };
            } catch (e) {
              parsedData = { paragraph: course.prerequisites, list_items: [] };
            }
          } else if (
            typeof course.prerequisites === 'object' &&
            course.prerequisites !== null
          ) {
            parsedData = {
              paragraph:
                typeof course.prerequisites.paragraph === 'string'
                  ? course.prerequisites.paragraph
                  : null,
              list_items: Array.isArray(course.prerequisites.list_items)
                ? course.prerequisites.list_items
                : [],
            };
          }
          const hasParagraph =
            parsedData.paragraph && parsedData.paragraph.trim().length > 0;
          const hasList = parsedData.list_items.some(
            (item: any) => typeof item === 'string' && item.trim().length > 0
          );
          if (!hasParagraph && !hasList) return null;
          return (
            <DetailSection
              icon={<Book className="h-4 w-4" />}
              title="Förkunskaper"
            >
              <JsonContent data={parsedData} />
            </DetailSection>
          );
        })()}

        {/* Rekommenderade förkunskaper */}
        {(() => {
          const content = (
            <JsonContent data={course.recommendedPrerequisites} />
          );
          return (
            content && (
              <DetailSection
                icon={<BarChart className="h-4 w-4" />}
                title="Rekommenderade förkunskaper"
              >
                {content}
              </DetailSection>
            )
          );
        })()}

        {/* Examination */}
        <DetailSection
          icon={<NotebookPen className="h-4 w-4" />}
          title="Examination"
        >
          {Array.isArray(course.examination) &&
          course.examination.length > 0 ? (
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

        {/* Ges för */}
        <DetailSection icon={<Users className="h-4 w-4" />} title="Ges för">
          <div className="flex flex-wrap gap-2">
            {course.offeredFor && course.offeredFor.length > 0 ? (
              course.offeredFor.map((program) => (
                <Badge key={program} variant="default" className="rounded-full">
                  {program}
                </Badge>
              ))
            ) : (
              <p>Information saknas.</p>
            )}
          </div>
        </DetailSection>

        {/* Kursplan Link */}
        <DetailSection icon={<FileText className="h-4 w-4" />} title="Kursplan">
          <a
            href={`https://studieinfo.liu.se/kurs/${course.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-primary hover:underline bg-primary/5 p-2 rounded-lg transition-colors hover:bg-primary/10"
          >
            Se kursplan på LiU.se <ExternalLink className="h-4 w-4" />
          </a>
        </DetailSection>
      </div>
    </div>
  );
};

export const CourseDetailsDialog = () => {
  const [open, setOpen] = useState(false);
  const isDesktop = useMediaQuery('(min-width: 768px)');

  const {
    isOpen,
    onClose,
    course,
    courseId,
    loading: storeLoading,
    error: storeError,
    setLoading,
    setError,
    setCourse,
  } = useCourseDetailsSheet();

  const {
    fetchCourseDetails,
    loading: fetchLoading,
    error: fetchError,
  } = useCourseDetails();

  const loading = storeLoading || fetchLoading;
  const error = storeError || fetchError;

  // Enrollment Button Component
  const EnrollmentButton = ({ course }: { course: Course }) => {
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
                onClick={(e: React.MouseEvent) => {
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
        onClick={(e: React.MouseEvent) => {
          e.stopPropagation();
          handleEnrollment(course.semester);
        }}
        className="h-8 w-8 p-0"
      >
        <Plus className="h-4 w-4" />
      </Button>
    );
  };

  useEffect(() => {
    if (isOpen && courseId && course) {
      const loadDetailedCourseInfo = async () => {
        setLoading(true);
        setError(null);

        try {
          if (!course.learningOutcomes || !course.examination) {
            const detailedCourse = await fetchCourseDetails(courseId);
            if (detailedCourse) {
              setCourse(detailedCourse);
            }
          }
        } catch (err) {
          setError('Kunde inte ladda kursinformation.');
        } finally {
          setLoading(false);
        }
      };

      loadDetailedCourseInfo();
    }
  }, [
    isOpen,
    courseId,
    course,
    fetchCourseDetails,
    setCourse,
    setLoading,
    setError,
  ]);

  useEffect(() => {
    setOpen(isOpen);
  }, [isOpen]);

  const handleClose = () => {
    setOpen(false);
    onClose();
  };

  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    count: number;
  }>({
    averageRating: 0,
    count: 0,
  });

  // Check if course is enrolled and get current semester
  const isEnrolled = course && 'enrollment' in course;
  const currentSemester = isEnrolled
    ? (course as any).enrollment.semester
    : null;
  const isMobile = useMediaQuery('(max-width: 767px)');

  // Function to update review data
  const updateReviewData = (averageRating: number, count: number) => {
    setReviewsData({ averageRating, count });
  };

  // This effect fetches the review data when the course changes
  useEffect(() => {
    if (course?.id) {
      const fetchReviewData = async () => {
        try {
          const response = await fetch(
            `/api/courses/${course.id.toString()}/reviews`
          );
          const result = await response.json();

          if (response.ok && result.success) {
            setReviewsData({
              averageRating: result.data.averageRating,
              count: result.data.reviews.length,
            });
          }
        } catch (error) {
          // Silent error handling
        }
      };

      fetchReviewData();
    }
  }, [course?.id]);

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col shadow-2xl">
          <DialogHeader className="mb-6 pt-6">
            {course && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">
                      {course.name}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Kursinformation och recensioner
                    </DialogDescription>
                    {!loading && (
                      <div className="flex items-center gap-2 mt-2">
                        {reviewsData.count > 0 ? (
                          <>
                            <div className="flex items-center gap-1 flex-row">
                              <StarRating
                                initialValue={reviewsData.averageRating}
                                size={18}
                                allowFraction
                                readonly
                                fillColor="#ffd700"
                                emptyColor="#e4e5e9"
                                className="flex-shrink-0"
                              />
                              <span className="text-sm text-muted-foreground ml-2">
                                {reviewsData.averageRating.toFixed(1)} (
                                {reviewsData.count}{' '}
                                {reviewsData.count === 1
                                  ? 'recension'
                                  : 'recensioner'}
                                )
                              </span>
                            </div>
                          </>
                        ) : (
                          <span className="text-sm text-muted-foreground">
                            Inga recensioner ännu
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <EnrollmentButton course={course} />
                </div>
              </>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loading && <p>Laddar kursinformation...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && course && (
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="info">Kursinformation</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Recensioner{' '}
                    {reviewsData.count > 0 && `(${reviewsData.count})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-8">
                  <CourseDetails course={course} reviewsData={reviewsData} />
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews
                    courseId={course.id.toString()}
                    onReviewDataUpdate={updateReviewData}
                  />
                </TabsContent>
              </Tabs>
            )}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={open} onOpenChange={handleClose}>
      <DrawerContent className="max-h-[90vh] shadow-2xl">
        <DrawerHeader className="text-left pt-6">
          {course && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DrawerTitle className="text-xl font-bold">
                    {course.name}
                  </DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Kursinformation och recensioner
                  </DrawerDescription>
                  {!loading && (
                    <div className="flex items-center gap-2 mt-2">
                      {reviewsData.count > 0 ? (
                        <>
                          <div className="flex items-center gap-1 flex-row">
                            <StarRating
                              initialValue={reviewsData.averageRating}
                              size={16}
                              allowFraction
                              readonly
                              fillColor="#ffd700"
                              emptyColor="#e4e5e9"
                              className="flex-shrink-0"
                            />
                            <span className="text-sm text-muted-foreground ml-2">
                              {reviewsData.averageRating.toFixed(1)} (
                              {reviewsData.count}{' '}
                              {reviewsData.count === 1
                                ? 'recension'
                                : 'recensioner'}
                              )
                            </span>
                          </div>
                        </>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          Inga recensioner ännu
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <EnrollmentButton course={course} />
              </div>
            </>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading && <p>Laddar kursinformation...</p>}
          {error && <p className="text-red-500">{error}</p>}
          {!loading && !error && course && (
            <Tabs defaultValue="info" className="w-full">
              <TabsList className="grid grid-cols-2 mb-6">
                <TabsTrigger value="info">Kursinformation</TabsTrigger>
                <TabsTrigger value="reviews">
                  Recensioner{' '}
                  {reviewsData.count > 0 && `(${reviewsData.count})`}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="info" className="space-y-6">
                <CourseDetails course={course} reviewsData={reviewsData} />
              </TabsContent>

              <TabsContent value="reviews">
                <CourseReviews
                  courseId={course.id.toString()}
                  onReviewDataUpdate={updateReviewData}
                />
              </TabsContent>
            </Tabs>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
};
