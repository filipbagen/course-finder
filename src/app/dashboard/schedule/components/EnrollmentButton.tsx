import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useCallback } from 'react';
import { toast } from 'sonner';
import { Course } from '@/app/utilities/types';

export const EnrollmentButton = ({ course, addToEnrollment }: { course: Course, addToEnrollment: (courseId: string, semester: number) => void }) => {
  const handleEnrollment = useCallback(() => {
    const semesters = course.semester;
    if (semesters.length === 1) {
      addToEnrollment(course.id, semesters[0]);
    }
  }, [course]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="icon"
          aria-label={`Add ${course.name} to your schedule`}
          onClick={course.semester.length === 1 ? handleEnrollment : undefined}
        >
          +
        </Button>
      </DropdownMenuTrigger>
      {course.semester.length > 1 && (
        <DropdownMenuContent className="w-56">
          {course.semester.map((semester) => (
            <DropdownMenuItem key={semester} onClick={() => addToEnrollment(course.id, semester)}>
              Semester {semester}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
