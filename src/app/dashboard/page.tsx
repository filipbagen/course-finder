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

// icons
import { MapPin } from 'lucide-react';

// data
import courses from '../data/courses';

export default function Dashboard() {
  return (
    <div className="mt-28 sm:mt-40 flex gap-4">
      <div className="flex flex-wrap gap-4 justify-between">
        {courses.map((course) => (
          <Card key={course.courseCode} className="flex-grow h-min">
            <CardHeader>
              <div className="flex justify-between gap-2">
                <CardTitle>{course.courseName}</CardTitle>
                <Button size={'icon'}>+</Button>
              </div>
              <CardDescription>{course.courseCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <MapPin size={16} />
                <p>{course.location}</p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <p>Termin {course.semester.join(', ')}</p>
              <p>Period {course.period.join(', ')}</p>
              <p>Block {course.block.join(', ')}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
}
