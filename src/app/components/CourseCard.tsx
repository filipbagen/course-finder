import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Drawer, DrawerContent, DrawerTrigger } from '@/components/ui/drawer';
import React, { useMemo } from 'react';
import { toast } from 'sonner';
import { CourseDetails } from '@/app/dashboard/schedule/components/CourseDetails';
import { EnrollmentButton } from '@/app/dashboard/schedule/components/EnrollmentButton';
import { CustomDrawerContent } from '@/app/dashboard/schedule/components/DrawerContent';
import { Badge } from '@/components/ui/badge';
import { Grip, GripVertical, Trash2 } from 'lucide-react';
import {
  Course,
  CourseWithEnrollment,
  isCourseWithEnrollment,
} from '@/app/utilities/types';

const CourseCard = ({
  course,
  variant,
  handleUpdateAfterDeletion,
  dragHandleProps,
}: {
  course: Course | CourseWithEnrollment;
  variant?: 'default' | 'schedule';
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  dragHandleProps?: any;
}) => {
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
    () => <CourseDetails course={course} />,
    [course]
  );

  if (variant === 'schedule' && isCourseWithEnrollment(course)) {
    return (
      <Card className="flex-grow h-min">
        <CardHeader className="flex flex-row justify-between items-center">
          <div className="flex flex-row gap-4 items-center">
            <div {...dragHandleProps}>
              <GripVertical size={18} />
            </div>
            <div className="flex flex-col">
              <h6 className="leading-5">{course.name}</h6>
              <span className="text-slate-400 text-sm">{course.code}</span>
            </div>
          </div>
          <Trash2
            onClick={() => {
              deleteEnrollment(course.enrollmentId);
            }}
            color="red"
            size={18}
            className="w-min h-min cursor-pointer hover:bg-red-100 ease-out duration-200 rounded-md p-2"
          />
        </CardHeader>
        <CardContent>
          <div className="flex flex-col gap-2">
            {/* {course.advanced ? (
              <Badge className="w-min whitespace-nowrap">Avancerad nivå</Badge>
            ) : (
              <Badge className="bg-primary/50 w-min">Grundnivå</Badge>
            )} */}
            <div className="flex flex-wrap gap-2">
              {course.mainFieldOfStudy.map((field) => (
                <Badge key={field}>{field}</Badge>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Drawer direction="right">
      <Card key={course.id} className="flex-grow h-min">
        <DrawerTrigger asChild>
          <Button>Open Drawer</Button>
        </DrawerTrigger>
        <CardHeader>
          <div className="flex justify-between">
            <div>
              <CardTitle>{course.name}</CardTitle>
              <CardDescription className="mt-0">{course.code}</CardDescription>
            </div>
            <EnrollmentButton
              course={course}
              addToEnrollment={addToEnrollment}
            />
          </div>
        </CardHeader>
        {memoizedCourseContent}
      </Card>
      <DrawerContent
        showBar={false}
        className="h-screen top-0 right-0 left-auto mt-0 w-[800px] rounded-l-xl"
      >
        <CustomDrawerContent course={course} />
      </DrawerContent>
    </Drawer>
  );
};

export default React.memo(CourseCard);
