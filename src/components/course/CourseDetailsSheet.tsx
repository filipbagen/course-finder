'use client';

import React, { useState, useEffect } from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useCourseDetailsSheet } from '@/hooks/useCourseDetailsSheet';
import { useCourseDetails } from '@/hooks/useCourseDetails';
import { Course } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import {
  BookOpen,
  Target,
  Users,
  NotebookPen,
  Info,
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
  X,
} from 'lucide-react';

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
      // If parsing fails, it might be a plain string.
      // Treat it as a paragraph.
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

const CourseDetails = ({ course }: { course: Course }) => {
  return (
    <div className="space-y-6">
      {/* Course Header Info */}
      <div className="rounded-2xl bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-5 border border-neutral-200 dark:border-slate-700/50">
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
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Course Main Fields */}
        <DetailSection
          icon={<SignpostBig className="h-4 w-4" />}
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

        {/* Examiner Info */}
        <DetailSection icon={<User className="h-4 w-4" />} title="Examinator">
          <p>{course.examiner || 'Information saknas'}</p>
        </DetailSection>

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
                    <span>{exam.credits} hp</span>
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

export const CourseDetailsSheet = () => {
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

  useEffect(() => {
    // If the sheet is open and we have a courseId, fetch detailed course info
    if (isOpen && courseId && course) {
      const loadDetailedCourseInfo = async () => {
        setLoading(true);
        setError(null);

        try {
          // We can look for a detailed field like learningOutcomes to check if we need to fetch details
          if (!course.learningOutcomes || !course.examination) {
            console.log('Fetching detailed course info for:', courseId);
            const detailedCourse = await fetchCourseDetails(courseId);
            if (detailedCourse) {
              setCourse(detailedCourse);
            }
          } else {
            // We already have the detailed course information
            console.log('Already have detailed course info');
            setLoading(false);
          }
        } catch (err) {
          const errorMessage =
            err instanceof Error
              ? err.message
              : 'Failed to load course details';
          setError(errorMessage);
          console.error('Error loading course details:', err);
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
    setLoading,
    setError,
    setCourse,
  ]);

  if (!course) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent
        side="right"
        className="!w-[95%] !max-w-[610px] sm:!max-w-[610px] sm:!w-[610px] overflow-y-auto max-h-[100vh] p-0 border-l border-neutral-200 bg-white dark:bg-slate-900 shadow-xl"
      >
        <div className="sticky top-0 z-10 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-b border-neutral-200 dark:border-slate-800 mb-6 p-6 pt-8">
          <button
            onClick={() => onClose()}
            className="absolute right-6 top-6 rounded-full p-1.5 bg-neutral-100 hover:bg-neutral-200 dark:bg-slate-800 dark:hover:bg-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
          <SheetHeader className="text-left">
            <SheetTitle className="text-2xl font-bold text-foreground">
              {course.name}
            </SheetTitle>
            <SheetDescription className="text-muted-foreground">
              {course.code}
            </SheetDescription>
          </SheetHeader>
        </div>

        <div className="px-6 pb-12">
          {loading ? (
            // Show skeleton loading state
            <div className="space-y-6">
              <div className="rounded-2xl bg-gradient-to-br from-blue-50/50 to-purple-50/50 dark:from-blue-900/10 dark:to-purple-900/10 p-5 border border-neutral-200/50 dark:border-slate-700/30 animate-pulse">
                <div className="grid grid-cols-2 gap-4">
                  {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i}>
                      <div className="h-3 w-16 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
                      <div className="h-5 w-24 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-neutral-50/50 dark:bg-slate-800/30 p-4 border border-neutral-200/50 dark:border-slate-700/30 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="pl-11 space-y-2">
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="h-px w-full bg-gray-200 dark:bg-gray-700"></div>

              <div className="space-y-4">
                <div className="h-6 w-40 bg-gray-300 dark:bg-gray-600 rounded"></div>

                {Array.from({ length: 3 }).map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl bg-neutral-50/50 dark:bg-slate-800/30 p-4 border border-neutral-200/50 dark:border-slate-700/30 animate-pulse"
                  >
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="h-4 w-32 bg-gray-300 dark:bg-gray-600 rounded"></div>
                    </div>
                    <div className="pl-11 space-y-2">
                      <div className="h-3 w-full bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-3/4 bg-gray-200 dark:bg-gray-700 rounded"></div>
                      <div className="h-3 w-5/6 bg-gray-200 dark:bg-gray-700 rounded"></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : error ? (
            <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-700 dark:text-red-300">
              <p>Det gick inte att ladda kursdetaljerna. Försök igen senare.</p>
              <p className="text-xs mt-2">{error}</p>
            </div>
          ) : (
            <CourseDetails course={course} />
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
};
