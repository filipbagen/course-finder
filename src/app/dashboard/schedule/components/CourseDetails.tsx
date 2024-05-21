import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { MapPin, BookText, SignpostBig, NotebookPen } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { CardContent, CardFooter } from '@/components/ui/card';
import { Examination, Course } from '@/app/utilities/types';

export const CourseDetails = ({ course }: { course: Course }) => (
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
);
