import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Star,
  MessageSquare,
  MapPin,
  SquareArrowOutUpRight,
} from 'lucide-react'
import { Course } from '@/types/types'
import { Button } from '@/components/ui/button'

const CourseDetails = ({
  course,
  averageRating,
  reviewsCount,
}: {
  course: Course
  averageRating: number
  reviewsCount: number
}) => {
  return (
    <Card key={course.id} className="h-min flex-grow dark:bg-secondary">
      <CardHeader>
        <div className="flex justify-between">
          <div>
            <h2 className="leading-10">{course.name}</h2>
            <CardDescription className="[&:not(:first-child)]:mt-0">
              {course.code}
            </CardDescription>
          </div>
          {/* <Button
            size="icon"
            aria-label={`Add ${course.name} to your schedule`}
          >
            +
          </Button> */}
          <Button
            size="icon"
            aria-label={`Open URL`}
            onClick={() =>
              window.open(
                `https://studieinfo.liu.se/kurs/${course.code}`,
                '_blank',
              )
            }
          >
            <SquareArrowOutUpRight size={20} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <MapPin size={16} />
          <p className="[&:not(:first-child)]:mt-0">{course.campus}</p>
        </div>
        <div className="flex gap-4">
          <div>
            <p>Termin {course.semester}</p>
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
          <div className="flex items-center gap-1">
            <Star size={12} />
            {averageRating}
          </div>
          <div className="flex items-center gap-1">
            <MessageSquare size={12} />
            {reviewsCount}
          </div>
        </CardFooter>
      </CardContent>
    </Card>
  )
}

export default CourseDetails
