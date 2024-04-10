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

// data
import courses from '../data/courses';

export default function Dashboard() {
  return (
    <div className="mt-28 sm:mt-40 flex gap-4">
      <div className="flex flex-wrap gap-4 justify-between">
        {courses.map((course) => (
          <Card className="flex-grow h-min">
            <CardHeader>
              <div className="flex justify-between">
                <div>
                  <CardTitle>{course.courseName}</CardTitle>
                  <CardDescription>{course.courseCode}</CardDescription>
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
                    <DropdownMenuItem>7</DropdownMenuItem>
                    <DropdownMenuItem>8</DropdownMenuItem>
                    <DropdownMenuItem>9</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </CardHeader>

            <CardContent>
              <div className="flex gap-2 items-center mb-4">
                <MapPin size={16} />
                <p>{course.location}</p>
              </div>

              <Accordion type="multiple" className="w-full">
                <AccordionItem value="mainFieldOfStudy" border={false}>
                  <div className="flex justify-between">
                    <CardFooter className="flex gap-4">
                      <p>Termin {course.semester.join(', ')}</p>
                      <p>Period {course.period.join(', ')}</p>
                      <p>Block {course.block.join(', ')}</p>
                    </CardFooter>
                    <AccordionTrigger className="p-0" />
                  </div>

                  <AccordionContent className="flex flex-col gap-4 p-0  mt-6">
                    <div>
                      <div className="flex items-center gap-2">
                        <BookText size={16} />
                        <h3>Förkunskaper</h3>
                      </div>
                      <p>{course.prerequisites}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <SignpostBig size={16} />
                        <h3>Huvudområde</h3>
                      </div>
                      <p>{course.mainFieldOfStudy.join(', ')}</p>
                    </div>

                    <div>
                      <div className="flex items-center gap-2">
                        <NotebookPen size={16} />
                        <h3>Examination</h3>
                      </div>
                      <ul>
                        {course.examination.map((ex) => (
                          <li key={ex.name}>{ex.name}</li>
                        ))}
                      </ul>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
