import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Course, User } from '@/app/utilities/types';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

interface StatisticsProps {
  courses: Course[];
  user: User;
}

export default function Statistics({ courses, user }: StatisticsProps) {
  const totalPassedCredits = courses.reduce(
    (acc, course) => acc + course.credits,
    0
  );
  const totalAdvancedCredits = courses.reduce(
    (acc, course) => (course.advanced ? acc + course.credits : acc),
    0
  );
  const totalBasicCredits = courses.reduce(
    (acc, course) => (!course.advanced ? acc + course.credits : acc),
    0
  );
  const progress = (totalPassedCredits / 90) * 100;

  return (
    <>
      <h2>Statistics</h2>
      <div className="w-full flex gap-4">
        <div className="w-[1000px]">
          <Card className="flex gap-8 justify-normal h-full">
            <CardHeader className="flex flex-row gap-4">
              <Avatar className="h-[58px] w-[58px] rounded-full">
                <AvatarImage src={user.image} alt={user.name} />
                <AvatarFallback>
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <CardTitle>{user.name}</CardTitle>
                <Badge>{user.colorScheme}</Badge>
              </div>
            </CardHeader>

            <div>
              <Progress value={progress} />
              <p>{totalPassedCredits} / 90hp</p>
            </div>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Added courses</CardDescription>
            </CardHeader>
            <CardContent>
              <h3>{courses.length}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Advanced credits</CardDescription>
            </CardHeader>
            <CardContent>
              <h3>{totalAdvancedCredits} hp</h3>
            </CardContent>
          </Card>
        </div>

        <div className="flex flex-col gap-4">
          <Card>
            <CardHeader>
              <CardDescription>Added courses</CardDescription>
            </CardHeader>
            <CardContent>
              <h3>{courses.length}</h3>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardDescription>Basic credits</CardDescription>
            </CardHeader>
            <CardContent>
              <h3>{totalBasicCredits} hp</h3>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
