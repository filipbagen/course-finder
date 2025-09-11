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
  Blocks,
  Smile,
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { useCourseDetailsSheet } from '@/hooks/useCourseDetailsSheet';
import { CourseDetailsDialog } from '@/components/course/CourseDetailsDialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
  currentUserColorScheme?: string;
}

export function UserProfileComponent({
  userProfile,
  isOwnProfile,
  currentUserColorScheme = 'blue',
}: UserProfileComponentProps) {
  const { onOpen } = useCourseDetailsSheet();
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
            creditCount[field] =
              (creditCount[field] || 0) + Number(course.credits);
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

  const getUserPrimaryColorHex = (colorScheme: string) => {
    switch (colorScheme) {
      case 'blue':
        return '#3b82f6';
      case 'green':
        return '#10b981';
      case 'purple':
        return '#8b5cf6';
      case 'orange':
        return '#f97316';
      case 'pink':
        return '#ec4899';
      case 'indigo':
        return '#6366f1';
      default:
        return '#6366f1'; // Default to indigo
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
      </div>

      <Separator />

      {/* Tabs for Schedule and Reviews */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schema</TabsTrigger>
          <TabsTrigger value="reviews">
            Recensioner ({userProfile._count.review})
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="space-y-6 mt-6">
          {/* Schedule Grid - Same layout as schedule view */}
          <div className="w-full space-y-6">
            {/* Mobile Layout - Single Column */}
            <div className="md:hidden space-y-6">
              {/* Semester 7 Header */}
              <div className="text-center p-4 bg-primary/10 rounded-lg mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Termin 7
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Höst år 4</p>
              </div>

              {/* Semester 7 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester7?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester7?.period1 ||
                    schedule.semester7.period1.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Semester 7 - Period 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester7?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester7?.period2 ||
                    schedule.semester7.period2.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Semester 8 Header */}
              <div className="text-center p-4 bg-primary/10 rounded-lg mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Termin 8
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Vår år 4</p>
              </div>

              {/* Semester 8 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester8?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester8?.period1 ||
                    schedule.semester8.period1.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Semester 8 - Period 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester8?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester8?.period2 ||
                    schedule.semester8.period2.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Semester 9 Header */}
              <div className="text-center p-4 bg-primary/10 rounded-lg mb-2">
                <h3 className="text-lg font-semibold text-foreground">
                  Termin 9
                </h3>
                <p className="text-sm text-muted-foreground mt-1">Höst år 5</p>
              </div>

              {/* Semester 9 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester9?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester9?.period1 ||
                    schedule.semester9.period1.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Semester 9 - Period 2 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-8 bg-primary rounded-full" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card">
                  <div className="space-y-3">
                    {schedule?.semester9?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                            <SignpostBig
                              className="h-4 w-4 flex-shrink-0 mt-0.5"
                              color={getUserPrimaryColorHex(
                                currentUserColorScheme
                              )}
                            />
                            <div className="flex flex-wrap gap-1">
                              {course.mainFieldOfStudy?.length === 0 ? (
                                <Badge variant="outline" className="text-xs">
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

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between pt-2 border-t border-border">
                            <div className="flex items-center gap-2">
                              <Blocks className="h-3 w-3 text-muted-foreground" />
                              <span className="text-xs text-muted-foreground">
                                {course.block?.length > 1
                                  ? `Block ${course.block.join(', ')}`
                                  : `Block ${course.block?.[0] || 'N/A'}`}
                              </span>
                            </div>

                            {/* Credits */}
                            <Badge variant="secondary" className="text-xs">
                              {Number(course.credits)} hp
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    )) || []}
                  </div>

                  {/* Empty State */}
                  {(!schedule?.semester9?.period2 ||
                    schedule.semester9.period2.length === 0) && (
                    <div className="flex flex-col items-center justify-center h-32 text-center">
                      <div className="space-y-3 flex flex-col items-center">
                        <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                          <SignpostBig className="h-6 w-6 text-primary" />
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm text-muted-foreground">
                            Inga kurser inlagda
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Desktop Layout - Original 2x3 Grid */}
            <div className="hidden md:block">
              {/* Semester Headers */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {semesters.map((semester) => (
                  <div
                    key={semester}
                    className="text-center p-4 bg-primary/10 rounded-lg"
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
              <div className="space-y-8 mt-3">
                {periods.map((period) => (
                  <div key={period} className="space-y-4">
                    {/* Period Header */}
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-8 bg-primary rounded-full" />
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
                        const courses =
                          schedule?.[semesterKey]?.[periodKey] || [];

                        return (
                          <div
                            key={`${semester}-${period}`}
                            className="min-h-48 p-4 rounded-lg border-2 border-dashed border-border bg-card"
                          >
                            <div className="space-y-3">
                              {courses.map((course) => (
                                <Card
                                  key={course.id}
                                  className="transition-all duration-200 hover:shadow-md cursor-pointer group"
                                  onClick={() => onOpen(course)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="flex-1 min-w-0">
                                        <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
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
                                      <SignpostBig
                                        className="h-4 w-4 flex-shrink-0 mt-0.5"
                                        color={getUserPrimaryColorHex(
                                          currentUserColorScheme
                                        )}
                                      />
                                      <div className="flex flex-wrap gap-1">
                                        {course.mainFieldOfStudy?.length ===
                                        0 ? (
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

                                    {/* Schedule Information */}
                                    <div className="flex items-center justify-between pt-2 border-t border-border">
                                      <div className="flex items-center gap-2">
                                        <Blocks className="h-3 w-3 text-muted-foreground" />
                                        <span className="text-xs text-muted-foreground">
                                          {course.block?.length > 1
                                            ? `Block ${course.block.join(', ')}`
                                            : `Block ${
                                                course.block?.[0] || 'N/A'
                                              }`}
                                        </span>
                                      </div>

                                      {/* Credits */}
                                      <Badge
                                        variant="secondary"
                                        className="text-xs"
                                      >
                                        {Number(course.credits)} hp
                                      </Badge>
                                    </div>
                                  </CardContent>
                                </Card>
                              ))}
                            </div>

                            {/* Empty State */}
                            {courses.length === 0 && (
                              <div className="flex flex-col items-center justify-center h-32 text-center">
                                <div className="space-y-3 flex flex-col items-center">
                                  <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                                    <SignpostBig className="h-6 w-6 text-primary" />
                                  </div>
                                  <div className="space-y-1">
                                    <p className="text-sm text-muted-foreground">
                                      Inga kurser inlagda
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="space-y-6 mt-6">
          {userProfile.reviews.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" />
                <h2 className="text-2xl font-bold">Recensioner</h2>
                <Badge variant="secondary" className="text-sm">
                  {userProfile._count.review}
                </Badge>
              </div>

              <div className="max-h-96 overflow-y-auto space-y-4">
                {userProfile.reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="hover:shadow-md transition-shadow"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {review.course.name}
                          </CardTitle>
                          <p className="text-sm text-muted-foreground mt-1">
                            {review.course.code}
                          </p>
                        </div>
                        <div className="flex items-center gap-1 ml-4">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-yellow-400 fill-current'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm leading-relaxed">
                        {review.comment}
                      </p>
                      <p className="text-xs text-muted-foreground mt-3">
                        {new Date(review.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="text-lg font-semibold text-muted-foreground mb-2">
                Inga recensioner än
              </h3>
              <p className="text-sm text-muted-foreground">
                {userProfile.name} har inte skrivit några recensioner ännu.
              </p>
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Course Details Dialog */}
      <CourseDetailsDialog />
    </div>
  );
}
