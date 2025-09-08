'use client';

import React from 'react';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet';
import { useCourseDetailsSheet } from '@/hooks/useCourseDetailsSheet';
import { Course } from '@/types/types';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  Target,
  Users,
  ClipboardList,
  Info,
  Calendar,
  Clock,
  User,
  Building,
  GraduationCap,
  Lightbulb,
  Book,
  BarChart,
  FileText,
  ExternalLink,
} from 'lucide-react';

const DetailSection = ({
  icon,
  title,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
}) => (
  <div className="py-4 border-b border-border">
    <div className="flex items-center gap-3 mb-2">
      {icon}
      <h3 className="text-lg font-semibold">{title}</h3>
    </div>
    <div className="prose prose-sm dark:prose-invert max-w-none text-muted-foreground">
      {children}
    </div>
  </div>
);

const JsonContent = ({ data, title }: { data: any; title: string }) => {
  if (!data) return <p>Information saknas.</p>;

  // Assuming data is an object with a 'description' property
  if (typeof data === 'object' && data !== null && 'description' in data) {
    return <p>{(data as { description: string }).description}</p>;
  }

  // Fallback for other structures
  return (
    <pre className="whitespace-pre-wrap font-sans text-sm">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
};

const CourseDetails = ({ course }: { course: Course }) => {
  return (
    <div className="divide-y divide-border">
      <DetailSection icon={<Info className="h-5 w-5" />} title="Grunddata">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-foreground">Kurskod</p>
            <p>{course.code}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Poäng</p>
            <p>{Number(course.credits)} hp</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Nivå</p>
            <p>{course.advanced ? 'Avancerad' : 'Grundnivå'}</p>
          </div>
          <div>
            <p className="font-medium text-foreground">Kurstyp</p>
            <p>{course.courseType || 'Information saknas'}</p>
          </div>
        </div>
      </DetailSection>

      <DetailSection
        icon={<GraduationCap className="h-5 w-5" />}
        title="Huvudområden"
      >
        <div className="flex flex-wrap gap-2">
          {course.mainFieldOfStudy && course.mainFieldOfStudy.length > 0 ? (
            course.mainFieldOfStudy.map((field) => (
              <Badge key={field} variant="secondary">
                {field}
              </Badge>
            ))
          ) : (
            <p>Inget huvudområde specificerat.</p>
          )}
        </div>
      </DetailSection>

      <DetailSection icon={<Building className="h-5 w-5" />} title="Campus">
        <p>{course.campus || 'Information saknas'}</p>
      </DetailSection>

      <DetailSection icon={<User className="h-5 w-5" />} title="Examinator">
        <p>{course.examiner || 'Information saknas'}</p>
      </DetailSection>

      <DetailSection icon={<Calendar className="h-5 w-5" />} title="Schema">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-foreground">Termin</p>
            <p>
              {course.semester?.length > 0
                ? `T${course.semester.join(', ')}`
                : 'T?'}
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Period</p>
            <p>
              {course.period?.length > 0 ? `P${course.period.join('+')}` : 'P?'}
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Block</p>
            <p>
              {course.block?.length > 0
                ? `Block ${course.block.join(', ')}`
                : 'Block ?'}
            </p>
          </div>
        </div>
      </DetailSection>

      <DetailSection icon={<Clock className="h-5 w-5" />} title="Tidsåtgång">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="font-medium text-foreground">Schemalagd tid</p>
            <p>
              {course.scheduledHours
                ? `${Number(course.scheduledHours)} timmar`
                : 'Okänt'}
            </p>
          </div>
          <div>
            <p className="font-medium text-foreground">Självstudier</p>
            <p>
              {course.selfStudyHours
                ? `${Number(course.selfStudyHours)} timmar`
                : 'Okänt'}
            </p>
          </div>
        </div>
      </DetailSection>

      <DetailSection icon={<Target className="h-5 w-5" />} title="Lärandemål">
        <JsonContent data={course.learningOutcomes} title="Lärandemål" />
      </DetailSection>

      <DetailSection
        icon={<BookOpen className="h-5 w-5" />}
        title="Kursinnehåll"
      >
        <JsonContent data={course.content} title="Kursinnehåll" />
      </DetailSection>

      <DetailSection
        icon={<Lightbulb className="h-5 w-5" />}
        title="Undervisningsformer"
      >
        <JsonContent
          data={course.teachingMethods}
          title="Undervisningsformer"
        />
      </DetailSection>

      <DetailSection icon={<Book className="h-5 w-5" />} title="Förkunskaper">
        <JsonContent data={course.prerequisites} title="Förkunskaper" />
      </DetailSection>

      <DetailSection
        icon={<BarChart className="h-5 w-5" />}
        title="Rekommenderade förkunskaper"
      >
        <JsonContent
          data={course.recommendedPrerequisites}
          title="Rekommenderade förkunskaper"
        />
      </DetailSection>

      <DetailSection
        icon={<ClipboardList className="h-5 w-5" />}
        title="Examination"
      >
        {Array.isArray(course.examination) && course.examination.length > 0 ? (
          <ul className="space-y-2">
            {course.examination.map((exam, index) => (
              <li key={index} className="text-sm">
                <strong>{exam.name}</strong> ({exam.credits} hp) - Betygsskala:{' '}
                {exam.gradingScale}
              </li>
            ))}
          </ul>
        ) : (
          <p>Information saknas.</p>
        )}
      </DetailSection>

      <DetailSection icon={<Users className="h-5 w-5" />} title="Ges för">
        <div className="flex flex-wrap gap-2">
          {course.offeredFor && course.offeredFor.length > 0 ? (
            course.offeredFor.map((program) => (
              <Badge key={program} variant="outline">
                {program}
              </Badge>
            ))
          ) : (
            <p>Information saknas.</p>
          )}
        </div>
      </DetailSection>

      <DetailSection icon={<FileText className="h-5 w-5" />} title="Kursplan">
        <a
          href={`https://www.kth.se/student/kurser/kurs/${course.code}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-primary hover:underline"
        >
          Se kursplan på KTH.se <ExternalLink className="h-4 w-4" />
        </a>
      </DetailSection>
    </div>
  );
};

export const CourseDetailsSheet = () => {
  const { isOpen, onClose, course } = useCourseDetailsSheet();

  if (!course) {
    return null;
  }

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-[400px] sm:w-[540px]">
        <SheetHeader className="mb-6">
          <SheetTitle className="text-2xl font-bold">{course.name}</SheetTitle>
          <SheetDescription>{course.code}</SheetDescription>
        </SheetHeader>
        <div className="overflow-y-auto max-h-[calc(100vh-5rem)]">
          <CourseDetails course={course} />
        </div>
      </SheetContent>
    </Sheet>
  );
};
