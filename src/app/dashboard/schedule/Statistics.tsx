import React from 'react';
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
import { SkeletonCard } from '@/app/components/SkeletonComponent';

interface StatisticsProps {
  courses: Course[];
  user: User;
  loading?: boolean;
}

export default function Statistics({
  courses,
  user,
  loading,
}: StatisticsProps) {
  const themeClass = user.colorScheme || 'theme-blue';

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

  const creditCount = courses.reduce(
    (acc: { [key: string]: number }, course) => {
      course.mainFieldOfStudy.forEach((field) => {
        acc[field] = (acc[field] || 0) + course.credits;
      });
      return acc;
    },
    {}
  );

  const maxCredits = Math.max(...Object.values(creditCount));
  const topFieldsOfStudy = Object.keys(creditCount).filter(
    (field) => creditCount[field] === maxCredits
  );

  const progress = (totalPassedCredits / 90) * 100;

  return (
    <>
      <h2>Statistics</h2>
      {loading ? (
        <SkeletonCard variant="statistics" />
      ) : (
        <div className="flex min-w-full gap-4">
          <div className="w-1/2">
            <Card className="flex gap-8 justify-normal items-stretch h-full w-full">
              <CardHeader className="flex flex-row gap-4">
                <Avatar className="h-[58px] w-[58px] rounded-full">
                  {user.image ? (
                    <AvatarImage src={user.image} alt={user.name} />
                  ) : (
                    <AvatarFallback>
                      {user.name.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div className="flex flex-col">
                  <CardTitle>{user.name}</CardTitle>
                  <Badge className={themeClass}>
                    {user.program || 'No program selected'}
                  </Badge>
                </div>
              </CardHeader>

              <div>
                <Progress value={progress} />
                <p>{totalPassedCredits} / 90hp</p>
              </div>
            </Card>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div className="flex gap-4">
              <Card className="flex-1 min-w-0">
                <CardHeader>
                  <CardDescription>Enrolled Courses</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3>{courses.length}</h3>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-0">
                <CardHeader>
                  <CardDescription>Main Field of Study</CardDescription>
                </CardHeader>
                <CardContent className="flex gap-2 flex-wrap whitespace-nowrap">
                  {topFieldsOfStudy.length > 0 ? (
                    topFieldsOfStudy.map((field) => (
                      <h3 key={field}>{field}</h3>
                    ))
                  ) : (
                    <h3>None</h3>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="flex gap-4">
              <Card className="flex-1 min-w-0">
                <CardHeader>
                  <CardDescription>Advanced Credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3>{totalAdvancedCredits} hp</h3>
                </CardContent>
              </Card>

              <Card className="flex-1 min-w-0">
                <CardHeader>
                  <CardDescription>Basic Credits</CardDescription>
                </CardHeader>
                <CardContent>
                  <h3>{totalBasicCredits} hp</h3>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
