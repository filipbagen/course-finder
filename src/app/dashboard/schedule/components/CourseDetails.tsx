import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, MapPin } from 'lucide-react';
import { Course } from '@/app/utilities/types';
import { Button } from '@/components/ui/button';

const CourseDetails = ({
  course,
  averageRating,
  reviewsCount,
}: {
  course: Course;
  averageRating: number;
  reviewsCount: number;
}) => {
  return (
    <Card key={course.id} className="flex-grow h-min">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h2 className="leading-10">{course.name}</h2>
            <CardDescription className="mt-0">{course.code}</CardDescription>
          </div>
          {/* <Button
            size="icon"
            aria-label={`Add ${course.name} to your schedule`}
          >
            +
          </Button> */}
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex gap-2 items-center">
          <MapPin size={16} />
          <p className="[&:not(:first-child)]:mt-0">{course.campus}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p>Termin {course.semester.join(', ')}</p>
          </div>
          <div>
            <p>Period {course.period.join(', ')}</p>
          </div>
          <div>
            <p>Block {course.block.join(', ')}</p>
          </div>
        </div>
        <div className="flex gap-2">
          {course.mainFieldOfStudy.length > 0 ? (
            course.mainFieldOfStudy.map((field) => (
              <Badge key={field}>{field}</Badge>
            ))
          ) : (
            <Badge>Inget huvudområde</Badge>
          )}
        </div>
        <CardFooter className="flex flex-row gap-4">
          <div className="flex gap-1 items-center">
            <Star size={12} />
            {averageRating}
          </div>
          <div className="flex gap-1 items-center">
            <MessageSquare size={12} />
            {reviewsCount}
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  );
};

export default CourseDetails;
