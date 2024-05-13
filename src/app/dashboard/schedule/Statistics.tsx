// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Course } from '@/app/utilities/types';

export default function Statistics({ courses }: { courses: Course[] }) {
  return (
    <div className="flex gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Number of Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <h4>{courses.length}</h4>
          </CardDescription>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Advanced credits</CardTitle>
        </CardHeader>
        <CardContent>
          <CardDescription>
            <h4>
              {courses.reduce(
                (acc, course) => (course.advanced ? acc + course.credits : acc),
                0
              )}
            </h4>
          </CardDescription>
        </CardContent>
      </Card>
    </div>
  );
}
