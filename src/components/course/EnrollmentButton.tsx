'use client';

import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useCallback } from 'react';
import { Course } from '@/types/types';
import { LogIn, Plus } from 'lucide-react';
import Link from 'next/link';

interface EnrollmentButtonProps {
  course: Course;
  addToEnrollment?: (courseId: string, semester: number) => void;
  isAuthenticated: boolean;
}

export const EnrollmentButton: React.FC<EnrollmentButtonProps> = ({
  course,
  addToEnrollment,
  isAuthenticated,
}) => {
  const handleEnrollment = useCallback(() => {
    if (!addToEnrollment) return;
    const semesters = course.semester;
    if (semesters.length === 1) {
      addToEnrollment(course.id, semesters[0]);
    }
  }, [course, addToEnrollment]);

  // Show login button for unauthenticated users
  if (!isAuthenticated) {
    return (
      <Button asChild size="sm" variant="outline">
        <Link href="/login">
          <LogIn className="h-4 w-4 mr-2" />
          Logga in för att lägga till
        </Link>
      </Button>
    );
  }

  // Show enrollment dropdown for authenticated users
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          size="sm"
          aria-label={`Add ${course.name} to your schedule`}
          onClick={course.semester.length === 1 ? handleEnrollment : undefined}
        >
          <Plus className="h-4 w-4 mr-2" />
          Lägg till
        </Button>
      </DropdownMenuTrigger>
      {course.semester.length > 1 && (
        <DropdownMenuContent className="w-56">
          {course.semester.map((semester) => (
            <DropdownMenuItem
              key={semester}
              onClick={() => addToEnrollment?.(course.id, semester)}
            >
              Termin {semester}
            </DropdownMenuItem>
          ))}
        </DropdownMenuContent>
      )}
    </DropdownMenu>
  );
};
