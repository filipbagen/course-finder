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

// icons
import { MapPin, BookText, SignpostBig, NotebookPen } from 'lucide-react';

export default function CourseCard({
  course,
  addToEnrollment,
}: {
  course: any;
  addToEnrollment: any;
}) {
  return (
    <Card key={course.courseId} className="flex-grow h-min">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <CardTitle>{course.courseName}</CardTitle>
            <CardDescription className="mt-0">
              {course.courseCode}
            </CardDescription>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="icon"
                aria-label={`Add ${course.courseName} to your schedule`}
              >
                +
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="w-56">
              <DropdownMenuItem
                onClick={() => addToEnrollment(course.courseId, 7)}
              >
                Semester 7
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => addToEnrollment(course.courseId, 8)}
              >
                Semester 8
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => addToEnrollment(course.courseId, 9)}
              >
                Semester 9
              </DropdownMenuItem>
            </DropdownMenuContent>
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
                  <p>Termin {course.semester}</p>
                </div>
                <div>
                  <p>Period {course.period}</p>
                </div>
                <div>
                  <p>Block {course.block}</p>
                </div>
              </CardFooter>
              <AccordionTrigger className="p-0" />
            </div>

            <AccordionContent className="flex flex-col gap-4 p-0  mt-6">
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

                {course.mainFieldOfStudy.length != 0 ? (
                  <p>{course.mainFieldOfStudy}</p>
                ) : (
                  <p>Inget huvudområde</p>
                )}
              </div>

              <div>
                <div className="flex items-center gap-2">
                  <NotebookPen size={16} />
                  <h6>Examination</h6>
                </div>
                <ul>
                  {course.examinations &&
                    course.examinations.map((ex: any) => (
                      <li key={ex.examId}>
                        {ex.examName}, {ex.examCode}, {ex.examGradingScale},{' '}
                        {ex.examCredits}hp
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
