'use client';

import React from 'react';
import {
  BookOpen,
  Calendar,
  GraduationCap,
  Plus,
  Star,
  Award,
  TrendingUp,
  Target,
  SignpostBig,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  colorScheme: string;
  isPublic: boolean;
  totalCredits: number;
  coursesBySemester: Record<number, any[]>;
  enrollments: {
    id: string;
    semester: number;
    course: any;
  }[];
  reviews: any[];
  _count: {
    enrollment: number;
    review: number;
  };
}

interface UserProfileComponentProps {
  userProfile: UserProfileData;
  isOwnProfile: boolean;
}

export function UserProfileComponent({
  userProfile,
  isOwnProfile,
}: UserProfileComponentProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Define expected totals based on user requirements
  const expectedTotalCredits = 90; // Total credits needed for 3 semesters
  const expectedAdvancedCredits = 60; // Advanced credits needed
  const requiredFieldCredits = 30; // Advanced credits needed in same field for main field

  // Calculate advanced credits
  const advancedCredits = React.useMemo(() => {
    let total = 0;
    let allCourses: any[] = [];

    Object.values(userProfile.coursesBySemester).forEach((courses) => {
      courses.forEach((course) => {
        // Avoid counting the same course multiple times
        if (!allCourses.some((c) => c.id === course.id)) {
          if (course.advanced) {
            total += Number(course.credits) || 0;
          }
          allCourses.push(course);
        }
      });
    });

    return total;
  }, [userProfile.coursesBySemester]);

  // Calculate advanced credits by field for main field determination
  const advancedCreditsByField = React.useMemo(() => {
    let allCourses: any[] = [];
    const creditCount: { [key: string]: number } = {};

    Object.values(userProfile.coursesBySemester).forEach((courses) => {
      courses.forEach((course) => {
        // Avoid counting the same course multiple times
        if (!allCourses.some((c) => c.id === course.id) && course.advanced) {
          course.mainFieldOfStudy.forEach((field: string) => {
            creditCount[field] = (creditCount[field] || 0) + Number(course.credits);
          });
          allCourses.push(course);
        }
      });
    });

    return creditCount;
  }, [userProfile.coursesBySemester]);

  // Determine main field of study (requires 30+ advanced credits in same field)
  const mainFieldOfStudy = React.useMemo(() => {
    const validFields = Object.entries(advancedCreditsByField).filter(
      ([_, credits]) => credits >= requiredFieldCredits
    );

    if (validFields.length === 0) return null;

    // Return the field with most credits
    const sortedFields = validFields.sort((a, b) => b[1] - a[1]);
    return {
      field: sortedFields[0][0],
      credits: sortedFields[0][1],
    };
  }, [advancedCreditsByField, requiredFieldCredits]);

  const progressPercentage = React.useMemo(() => {
    return Math.min(
      (userProfile.totalCredits / expectedTotalCredits) * 100,
      100
    );
  }, [userProfile.totalCredits, expectedTotalCredits]);

  const advancedProgressPercentage = React.useMemo(() => {
    return Math.min((advancedCredits / expectedAdvancedCredits) * 100, 100);
  }, [advancedCredits, expectedAdvancedCredits]);

  const getColorFromProgram = (program: string | null) => {
    if (!program) return 'bg-gray-100 text-gray-700';

    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ];

    const hash = program.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);

    return colors[Math.abs(hash) % colors.length];
  };

  // Get user's primary color for theming
  const getUserPrimaryColor = (colorScheme: string) => {
    switch (colorScheme) {
      case 'blue':
        return 'bg-blue-500';
      case 'green':
        return 'bg-green-500';
      case 'purple':
        return 'bg-purple-500';
      case 'orange':
        return 'bg-orange-500';
      case 'pink':
        return 'bg-pink-500';
      case 'indigo':
        return 'bg-indigo-500';
      default:
        return 'bg-primary';
    }
  };

  const getUserPrimaryColorLight = (colorScheme: string) => {
    switch (colorScheme) {
      case 'blue':
        return 'bg-blue-500/10';
      case 'green':
        return 'bg-green-500/10';
      case 'purple':
        return 'bg-purple-500/10';
      case 'orange':
        return 'bg-orange-500/10';
      case 'pink':
        return 'bg-pink-500/10';
      case 'indigo':
        return 'bg-indigo-500/10';
      default:
        return 'bg-primary/10';
    }
  };

  const getSemesterDescription = (semester: number): string => {
    switch (semester) {
      case 7:
        return 'Höst år 4';
      case 8:
        return 'Vår år 4';
      case 9:
        return 'Höst år 5';
      default:
        return '';
    }
  };

  // Organize courses by semester and period like in the schedule
  const organizeCoursesForSchedule = () => {
    const schedule: Record<string, Record<string, any[]>> = {
      semester7: { period1: [], period2: [] },
      semester8: { period1: [], period2: [] },
      semester9: { period1: [], period2: [] },
    };

    userProfile.enrollments.forEach((enrollment) => {
      const { semester, course } = enrollment;

      // Only show courses for semesters 7, 8, 9
      if (semester >= 7 && semester <= 9) {
        const semesterKey = `semester${semester}`;

        // Handle multi-period courses: if course.period includes multiple periods,
        // show the course in all those periods
        if (course.period && Array.isArray(course.period)) {
          course.period.forEach((coursePeriod: bigint) => {
            const period = Number(coursePeriod);
            if (period === 1 || period === 2) {
              const periodKey = `period${period}`;
              if (schedule[semesterKey] && schedule[semesterKey][periodKey]) {
                schedule[semesterKey][periodKey].push(course);
              }
            }
          });
        }
      }
    });

    return schedule;
  };

  const schedule = organizeCoursesForSchedule();
  const semesters = [7, 8, 9] as const;
  const periods = [1, 2] as const;

  return (
    <div className="space-y-8">
      {/* User Profile Header */}
      <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex items-center gap-8">
            {/* Avatar */}
            <div className="relative flex-shrink-0">
              <Avatar className="h-24 w-24 ring-4 ring-white shadow-xl">
                <AvatarImage
                  src={userProfile.image || undefined}
                  alt={userProfile.name || 'Anonymous User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-2xl font-semibold">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1">
              <div className="flex items-center gap-8">
                {/* Name and Program */}
                <div className="flex-shrink-0">
                  <div>
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
                      {userProfile.name || 'Anonymous User'}
                    </h2>
                    {userProfile.program && (
                      <Badge
                        variant="secondary"
                        className={`${getColorFromProgram(
                          userProfile.program
                        )} text-sm px-3 py-1 rounded-full font-medium shadow-sm`}
                      >
                        <GraduationCap className="h-3 w-3 mr-1" />
                        {userProfile.program}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Statistics Cards - Matching ScheduleStatistics Design */}
      <div className="space-y-6">
        {/* Main Statistics Cards */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Total Credits and Advanced Credits side by side on mobile */}
          <div className="grid grid-cols-2 gap-4 md:contents">
            {/* Total Credits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Totala poäng
                </CardTitle>
                <GraduationCap className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {userProfile.totalCredits} hp
                </div>
                <p className="text-xs text-muted-foreground">
                  av {expectedTotalCredits} hp krävda
                </p>
                <Progress value={progressPercentage} className="mt-2 h-2" />
              </CardContent>
            </Card>

            {/* Advanced Credits */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  Avancerade poäng
                </CardTitle>
                <Target className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{advancedCredits} hp</div>
                <p className="text-xs text-muted-foreground">
                  av {expectedAdvancedCredits} hp krävda
                </p>
                <Progress
                  value={advancedProgressPercentage}
                  className="mt-2 h-2"
                />
              </CardContent>
            </Card>
          </div>

          {/* Main Field of Study */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Huvudområde</CardTitle>
              <SignpostBig className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {mainFieldOfStudy ? mainFieldOfStudy.field : 'Ej uppfyllt'}
              </div>
              <p className="text-xs text-muted-foreground">
                {mainFieldOfStudy
                  ? `${mainFieldOfStudy.credits} hp avancerade poäng`
                  : `Behöver ${requiredFieldCredits} hp i samma område`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Additional Statistics Row */}
        <div className="grid gap-4 md:grid-cols-3">
          {/* Courses */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Kurser</CardTitle>
              <BookOpen className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile._count.enrollment}
              </div>
              <p className="text-xs text-muted-foreground">inlagda kurser</p>
            </CardContent>
          </Card>

          {/* Reviews */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Recensioner</CardTitle>
              <Star className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {userProfile._count.review}
              </div>
              <p className="text-xs text-muted-foreground">
                skrivna recensioner
              </p>
            </CardContent>
          </Card>

          {/* Placeholder for future stats */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Framsteg</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {Math.round(progressPercentage)}%
              </div>
              <p className="text-xs text-muted-foreground">av examensmålet</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Schedule Grid - Same layout as schedule view */}
      <div className="w-full space-y-6">
        {/* Semester Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {semesters.map((semester) => (
            <div
              key={semester}
              className={`text-center p-4 ${getUserPrimaryColorLight(
                userProfile.colorScheme
              )} rounded-lg`}
            >
              <h3 className="text-lg font-semibold text-foreground">
                Termin {semester}
              </h3>
              <p className="text-sm text-muted-foreground mt-1">
                {getSemesterDescription(semester)}
              </p>
            </div>
          ))}
        </div>

        {/* Schedule Grid */}
        <div className="space-y-8">
          {periods.map((period) => (
            <div key={period} className="space-y-4">
              {/* Period Header */}
              <div className="flex items-center gap-3">
                <div
                  className={`w-2 h-8 ${getUserPrimaryColor(
                    userProfile.colorScheme
                  )} rounded-full`}
                />
                <h3 className="text-xl font-semibold text-foreground">
                  Period {period}
                </h3>
                <div className="flex-1 h-px bg-border" />
              </div>

              {/* Period Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {semesters.map((semester) => {
                  const semesterKey =
                    `semester${semester}` as keyof typeof schedule;
                  const periodKey =
                    `period${period}` as keyof (typeof schedule)[typeof semesterKey];
                  const courses = schedule?.[semesterKey]?.[periodKey] || [];

                  return (
                    <Card
                      key={`${semester}-${period}`}
                      className="min-h-[200px] bg-background/50 backdrop-blur-sm border-2 border-dashed border-border"
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-sm font-medium text-muted-foreground">
                            Termin {semester} - Period {period}
                          </CardTitle>
                          <Badge variant="outline" className="text-xs">
                            {courses.length} kurser
                          </Badge>
                        </div>
                      </CardHeader>

                      <CardContent className="space-y-3">
                        {courses.length > 0 ? (
                          courses.map((course) => (
                            <Card
                              key={course.id}
                              className="transition-all duration-200 hover:shadow-md"
                            >
                              <CardHeader className="pb-3">
                                <div className="flex items-start justify-between gap-3">
                                  <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-base leading-tight line-clamp-2">
                                      {course.name}
                                    </h3>
                                    <p className="text-sm font-mono text-muted-foreground mt-1">
                                      {course.code}
                                    </p>
                                  </div>
                                </div>
                              </CardHeader>

                              <CardContent className="pt-0 space-y-3">
                                {/* Main Field of Study */}
                                <div className="flex items-start gap-2">
                                  <BookOpen
                                    className={`h-4 w-4 ${getUserPrimaryColor(
                                      userProfile.colorScheme
                                    )} flex-shrink-0 mt-0.5`}
                                  />
                                  <div className="flex flex-wrap gap-1">
                                    {course.mainFieldOfStudy?.length === 0 ? (
                                      <Badge
                                        variant="outline"
                                        className="text-xs"
                                      >
                                        Inget huvudområde
                                      </Badge>
                                    ) : (
                                      course.mainFieldOfStudy?.map(
                                        (field: string, index: number) => (
                                          <Badge
                                            key={index}
                                            variant="outline"
                                            className="text-xs"
                                          >
                                            {field}
                                          </Badge>
                                        )
                                      )
                                    )}
                                  </div>
                                </div>

                                {/* Credits */}
                                <div className="flex items-center justify-between pt-2 border-t border-border">
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="text-xs"
                                  >
                                    <Plus className="h-4 w-4 mr-1" />
                                    Lägg till
                                  </Button>
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {Number(course.credits)} hp
                                  </Badge>
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <div className="flex flex-col items-center justify-center py-8 text-center">
                            <BookOpen className="h-8 w-8 text-muted-foreground/50 mb-2" />
                            <p className="text-sm text-muted-foreground">
                              Inga kurser
                            </p>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
