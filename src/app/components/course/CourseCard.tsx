import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Separator } from '@/components/ui/separator';
import { EnrollmentButton } from '@/app/dashboard/schedule/components/EnrollmentButton';
import { Badge } from '@/components/ui/badge';
import {
  GripVertical,
  Trash2,
  MapPin,
  BookText,
  SignpostBig,
  NotebookPen,
} from 'lucide-react';
import {
  Course,
  Examination,
  CourseWithEnrollment,
  isCourseWithEnrollment,
} from '@/app/utilities/types';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { useEnrollment } from '@/app/hooks/useEnrollment';
import { cn } from '@/lib/utils';

interface CourseCardProps {
  course: Course | CourseWithEnrollment;
  variant?: 'default' | 'schedule' | 'user-visit';
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  hasExclusion?: boolean;
  className?: string;
}

const CourseCardDetails = ({ course }: { course: Course }) => {
  return (
    <Accordion type="multiple" className="w-full">
      <AccordionItem value="mainFieldOfStudy" border={false}>
        <div className="flex justify-between">
          <CardFooter className="flex gap-4">
            <div>
              <p>Termin {course.semester.join(', ')}</p>
            </div>
            <div>
              <p>Period {course.period.join(', ')}</p>
            </div>
            <div>
              <p>Block {course.block.join(', ')}</p>
            </div>
          </CardFooter>

          <AccordionTrigger className="p-0" />
        </div>
        <AccordionContent className="flex flex-col gap-4 p-0 mt-4">
          <Separator className="mt-2" />
          <div>
            <div className="flex items-center gap-2">
              <SignpostBig size={16} />
              <h6>Huvudområde</h6>
            </div>
            <p>
              {course.mainFieldOfStudy.length > 0
                ? course.mainFieldOfStudy.join(', ')
                : 'Inget huvudområde'}
            </p>

            <Separator className="mt-2" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <BookText size={16} />
              <h6>Förkunskaper</h6>
            </div>
            <p>
              {course.recommendedPrerequisites === 'None'
                ? 'Inga rekommenderade förkunskaper krävs'
                : course.recommendedPrerequisites}
            </p>

            <Separator className="mt-2" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <NotebookPen size={16} />
              <h6>Examination</h6>
            </div>
            <ul>
              {course.examinations?.map((ex: Examination) => (
                <li key={ex.id}>
                  {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits} hp
                </li>
              ))}
            </ul>
          </div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
};

const CourseCard = ({
  course,
  variant = 'default',
  handleUpdateAfterDeletion,
  dragHandleProps,
  hasExclusion,
}: CourseCardProps) => {
  const { addToEnrollment, deleteEnrollment } = useEnrollment(
    course.name,
    handleUpdateAfterDeletion
  );

  // Variant checks
  const isDefault = variant === 'default';
  const isScheduleVariant = variant === 'schedule';
  const isUserVisitVariant = variant === 'user-visit';

  return (
    <Card
      className={cn(
        'flex-grow h-min hover:shadow-md transition-shadow ease-out duration-200 max-w-full gap-2',
        isDefault && '',
        isScheduleVariant && '',
        isUserVisitVariant && ''
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-2">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex gap-2">
              {isScheduleVariant && dragHandleProps && (
                <div {...dragHandleProps}>
                  <GripVertical className="h-5 w-5 text-gray-400" />
                </div>
              )}
              <div>
                <CardTitle className="font-semibold leading-tight">
                  {course.name}
                </CardTitle>
                <CardDescription className="[&:not(:first-child)]:mt-0">
                  {course.code}
                </CardDescription>
              </div>
            </div>

            {isDefault && (
              <EnrollmentButton
                course={course}
                addToEnrollment={addToEnrollment}
              />
            )}

            {isScheduleVariant && isCourseWithEnrollment(course) && (
              <Trash2
                onClick={() => deleteEnrollment(course.enrollmentId)}
                className="h-5 w-5 text-red-500 cursor-pointer hover:bg-red-50 rounded-md p-1"
              />
            )}
          </div>

          {/* Warning Message - Only show in default variant */}
          {isDefault && hasExclusion && (
            <div className="text-red-500 text-sm bg-red-50 p-3 rounded-md">
              Varning: Denna kurs kan inte kombineras med en av dina inskrivna
              kurser.
            </div>
          )}
        </div>
      </CardHeader>

      <CardContent className={cn('flex flex-col gap-2')}>
        {/* Course Location - Not shown in schedule variant */}
        {!isScheduleVariant && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{course.campus}</span>
          </div>
        )}

        {/* Fields of Study - Shown in all variants */}
        <div className="flex flex-wrap gap-3">
          {course.mainFieldOfStudy.length === 0 ? (
            <Badge variant={isScheduleVariant ? 'secondary' : 'default'}>
              Inget huvudområde
            </Badge>
          ) : (
            course.mainFieldOfStudy.map((field) => (
              <Badge
                key={field}
                variant={isScheduleVariant ? 'secondary' : 'default'}
              >
                {field}
              </Badge>
            ))
          )}
        </div>

        {/* Course Details - Only in default variant */}
        {isDefault && <CourseCardDetails course={course} />}
      </CardContent>
    </Card>
  );
};

export default CourseCard;