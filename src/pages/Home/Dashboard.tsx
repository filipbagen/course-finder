import { MapPin } from 'lucide-react';

// data
import courses from '../../data/courses';

// shadcn
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

const Dashboard = () => {
  const showSonner = () => {
    toast('Course added!', {
      description: 'You added [insert course name] to your schedule.',
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo'),
      },
    });
  };

  return (
    <div className="mt-28 sm:mt-40 flex flex-wrap gap-4 justify-between">
      {courses.map((course) => (
        <Card key={course.courseCode} className="flex-grow">
          <CardHeader>
            <div className="flex justify-between">
              <CardTitle>{course.courseName}</CardTitle>
              <Button onClick={() => showSonner()} size={'icon'}>
                +
              </Button>
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
            <p>Period {course.period}</p>
            <p>Block {course.block}</p>
          </CardFooter>
        </Card>
      ))}
    </div>
  );
};

export default Dashboard;
