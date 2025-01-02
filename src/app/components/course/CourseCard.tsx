import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import CourseCardDetails from './CourseCardDetails';
import { EnrollmentButton } from '@/app/dashboard/schedule/components/EnrollmentButton';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2, MapPin } from 'lucide-react';
import {
  Course,
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

  const renderCardHeader = () => (
    <CardHeader className="flex flex-row justify-between items-center">
      <div className="flex flex-row gap-4 items-center">
        {variant === 'schedule' && dragHandleProps && (
          <div {...dragHandleProps}>
            <GripVertical size={18} />
          </div>
        )}
        <div className="flex flex-col">
          <h6 className="leading-5 break-word hyphens-auto">{course.name}</h6>
          <span className="text-slate-400 text-sm">{course.code}</span>
        </div>
      </div>
      {variant === 'schedule' && isCourseWithEnrollment(course) && (
        <Trash2
          onClick={() => deleteEnrollment(course.enrollmentId)}
          color="red"
          size={18}
          className="w-min h-min cursor-pointer hover:bg-red-100 ease-out duration-200 rounded-md p-2"
        />
      )}
    </CardHeader>
  );

  const renderCardContent = () => (
    <CardContent>
      <div className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-2">
          {course.mainFieldOfStudy.map((field) => (
            <Badge key={field}>{field}</Badge>
          ))}
        </div>
      </div>
    </CardContent>
  );

  if (variant === 'schedule' && isCourseWithEnrollment(course)) {
    return (
      <Card className="flex-grow h-min min-w-0">
        {renderCardHeader()}
        {renderCardContent()}
      </Card>
    );
  } else if (variant === 'user-visit') {
    return (
      <Card className="flex-grow h-min min-w-0">
        {renderCardHeader()}
        {renderCardContent()}
      </Card>
    );
  }

  return (
    <Card
      className={cn(
        'flex-grow h-min hover:shadow-md transition-shadow ease-out duration-200 max-w-full',
        isDefault && '',
        isScheduleVariant && '',
        isUserVisitVariant && ''
      )}
    >
      <CardHeader>
        <div className="flex flex-col gap-4">
          {/* Header Section */}
          <div className="flex justify-between items-start">
            <div className="flex gap-3">
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

      <CardContent className={cn('flex flex-col gap-4')}>
        {/* Course Location - Not shown in schedule variant */}
        {!isScheduleVariant && (
          <div className="flex items-center gap-2 text-gray-600">
            <MapPin className="h-4 w-4" />
            <span>{course.campus}</span>
          </div>
        )}

        {/* Fields of Study - Shown in all variants */}
        <div className="flex flex-wrap gap-2">
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
