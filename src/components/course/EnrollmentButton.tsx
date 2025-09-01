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
    addToEnrollment(course.id, course.semester);
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

  // Show enrollment button for authenticated users
  return (
    <Button
      size="sm"
      aria-label={`Add ${course.name} to your schedule`}
      onClick={handleEnrollment}
    >
      <Plus className="h-4 w-4 mr-2" />
      Lägg till
    </Button>
  );
};
