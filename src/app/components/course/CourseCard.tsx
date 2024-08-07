import React, { forwardRef, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
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

const LazyCustomDrawerContent = React.lazy(
  () => import('@/app/components/course/CustomDrawerContent')
);

interface CourseCardProps {
  course: Course | CourseWithEnrollment;
  variant?: 'default' | 'schedule' | 'user-visit';
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  dragHandleProps?: DraggableProvidedDragHandleProps | null;
  hasExclusion?: boolean; // Add this prop to show warning
}

const CourseCard = forwardRef<HTMLDivElement, CourseCardProps>(
  (
    {
      course,
      variant,
      handleUpdateAfterDeletion,
      dragHandleProps,
      hasExclusion,
    },
    ref
  ) => {
    const { addToEnrollment, deleteEnrollment } = useEnrollment(
      course.name,
      handleUpdateAfterDeletion
    );

    // Memoize the course content to prevent re-rendering
    const memoizedCourseContent = useMemo(
      () => <CourseCardDetails course={course} />,
      [course]
    );

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
        <Card className="flex-grow h-min">
          {renderCardHeader()}
          {renderCardContent()}
        </Card>
      );
    }

    return (
      <Drawer direction="right">
        <Card
          key={course.id}
          className="flex-grow h-min hover:shadow-md transition-shadow ease-out duration-200 max-w-full"
        >
          <CardHeader>
            <div className="flex justify-between">
              <DrawerTrigger asChild className="cursor-pointer">
                <div>
                  <CardTitle>{course.name}</CardTitle>
                  <CardDescription className="mt-0">
                    {course.code}
                  </CardDescription>
                  {hasExclusion && (
                    <div className="text-red-500 text-sm mt-2">
                      Varning: Denna kurs kan inte kombineras med en av dina
                      inskrivna kurser.
                    </div>
                  )}
                </div>
              </DrawerTrigger>
              <EnrollmentButton
                course={course}
                addToEnrollment={addToEnrollment}
              />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2 items-center mb-4">
              <MapPin size={16} />
              <p className="[&:not(:first-child)]:mt-0">{course.campus}</p>
            </div>
            {memoizedCourseContent}
          </CardContent>
        </Card>
        <DrawerContent
          showBar={false}
          className="h-screen top-0 right-0 left-auto mt-0 w-[800px] rounded-l-xl bg-white"
        >
          <LazyCustomDrawerContent course={course} />
        </DrawerContent>
      </Drawer>
    );
  }
);

CourseCard.displayName = 'CourseCard';

export default React.memo(CourseCard);
