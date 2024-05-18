// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toast } from 'sonner';

// icons
import { MapPin, BookText, SignpostBig, NotebookPen } from 'lucide-react';
import { Course, Examination } from '@/app/utilities/types';

export default function CourseCard({ course }: { course: Course }) {
  // Function to add course to enrollment
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

  // Function to delete course from enrollment
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
    } catch (error) {
      console.error(error);
    }
  };

  const handleEnrollment = () => {
    const semesters = course.semester;
    if (semesters.length === 1) {
      addToEnrollment(course.id, semesters[0]);
    }
  };

  return (
    <Card key={course.id} className="flex-grow h-min">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{course.name}</CardTitle>
            <CardDescription className="mt-0">{course.code}</CardDescription>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                aria-label={`Add ${course.name} to your schedule`}
                onClick={
                  course.semester.length === 1 ? handleEnrollment : undefined
                }
              >
                +
              </Button>
            </DropdownMenuTrigger>
            {course.semester.length > 1 && (
              <DropdownMenuContent className="w-56">
                {course.semester.map((semester) => (
                  <DropdownMenuItem
                    key={semester}
                    onClick={() => addToEnrollment(course.id, semester)}
                  >
                    Semester {semester}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            )}
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex gap-2 items-center mb-4">
          <MapPin size={16} />
          <p className="[&:not(:first-child)]:mt-0">{course.location}</p>
        </div>

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

            <AccordionContent className="flex flex-col gap-4 p-0 mt-6">
              <div>
                <div className="flex items-center gap-2">
                  <BookText size={16} />
                  <h6>Förkunskaper</h6>
                </div>
                <p>{course.prerequisites}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <SignpostBig size={16} />
                  <h6>Huvudområde</h6>
                </div>
                <p>{course.mainFieldOfStudy || 'Inget huvudområde'}</p>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <NotebookPen size={16} />
                  <h6>Examination</h6>
                </div>
                <ul>
                  {course.examinations?.map((ex: Examination) => (
                    <li key={ex.id}>
                      {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits}hp
                    </li>
                  ))}
                </ul>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      </CardContent>
    </Card>
  );
}
