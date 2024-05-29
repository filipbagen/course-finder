import React, { forwardRef, useMemo } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import { toast } from 'sonner';
import { CourseCardDetails } from './CourseCardDetails';
import { EnrollmentButton } from '@/app/dashboard/schedule/components/EnrollmentButton';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Trash2 } from 'lucide-react';
import {
  Course,
  CourseWithEnrollment,
  isCourseWithEnrollment,
} from '@/app/utilities/types';
import { DraggableProvidedDragHandleProps } from '@hello-pangea/dnd';
import { MapPin } from 'lucide-react';

const LazyCustomDrawerContent = React.lazy(
  () => import('@/app/dashboard/schedule/components/CustomDrawerContent')
);

const CourseCard = forwardRef<
  HTMLDivElement,
  {
    course: Course | CourseWithEnrollment;
    variant?: 'default' | 'schedule' | 'user-visit';
    handleUpdateAfterDeletion?: (enrollmentId: string) => void;
    dragHandleProps?: DraggableProvidedDragHandleProps | null;
    hasExclusion?: boolean; // Add this prop to show warning
  }
>(
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
    const addToEnrollment = async (courseId: string, semester: number) => {
      try {
        const response = await fetch('/api/enrollment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId, semester }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const enrollment = await response.json();

        toast.success(`Added ${course.name} to schedule 🎉`, {
          action: {
            label: 'Undo',
            onClick: () => deleteEnrollment(enrollment.enrollment.id),
          },
        });
      } catch (error) {
        console.error(error);
      }
    };

    const deleteEnrollment = async (enrollmentId: string) => {
      try {
        const response = await fetch('/api/enrollment', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enrollmentId }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        toast.success(`Removed ${course.name} from schedule`);
        if (handleUpdateAfterDeletion) {
          handleUpdateAfterDeletion(enrollmentId);
        }
      } catch (error) {
        console.error(error);
      }
    };

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
            <h6 className="leading-5">{course.name}</h6>
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
        <Card className="flex-grow h-min">
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
                      Warning: This course cannot be combined with one of your
                      enrolled courses.
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
          className="h-screen top-0 right-0 left-auto mt-0 w-[800px] rounded-l-xl bg-white dark:bg-gray-800"
        >
          <LazyCustomDrawerContent course={course} />
        </DrawerContent>
      </Drawer>
    );
  }
);

export default React.memo(CourseCard);
