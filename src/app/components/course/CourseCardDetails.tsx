import React, { memo } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { BookText, SignpostBig, NotebookPen } from 'lucide-react';
import { CardFooter } from '@/components/ui/card';
import { Examination, Course } from '@/app/utilities/types';
import { Separator } from '@/components/ui/separator';

interface CourseCardDetailsProps {
  course: Course;
}

const CourseCardDetails: React.FC<CourseCardDetailsProps> = ({ course }) => (
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
      <AccordionContent className="flex flex-col gap-4 p-0 mt-4">
        <Separator className="mt-2" />
        <div>
          <div className="flex items-center gap-2">
            <SignpostBig size={16} />
            <h6>Huvudområde</h6>
          </div>
          <p>
            {course.mainFieldOfStudy.length > 0
              ? course.mainFieldOfStudy.join(', ')
              : 'Inget huvudområde'}
          </p>

          <Separator className="mt-2" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <BookText size={16} />
            <h6>Förkunskaper</h6>
          </div>
          <p>
            {course.recommendedPrerequisites === 'None'
              ? 'Inga rekommenderade förkunskaper krävs'
              : course.recommendedPrerequisites}
          </p>

          <Separator className="mt-2" />
        </div>

        <div>
          <div className="flex items-center gap-2">
            <NotebookPen size={16} />
            <h6>Examination</h6>
          </div>
          <ul>
            {course.examinations?.map((ex: Examination) => (
              <li key={ex.id}>
                {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits} hp
              </li>
            ))}
          </ul>
        </div>
      </AccordionContent>
    </AccordionItem>
  </Accordion>
);

export default memo(CourseCardDetails);
