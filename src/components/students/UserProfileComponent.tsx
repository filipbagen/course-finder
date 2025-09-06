'use client';

import { BookOpen, Calendar, GraduationCap } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

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
    enrollments: number;
    reviews: number;
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
      {/* User Profile Card */}
      <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden">
        <CardContent className="p-8">
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Avatar */}
            <div className="relative">
              <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                <AvatarImage
                  src={userProfile.image || undefined}
                  alt={userProfile.name || 'Anonymous User'}
                  className="object-cover"
                />
                <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-white text-3xl font-semibold">
                  {getInitials(userProfile.name)}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center md:text-left space-y-4">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {userProfile.name || 'Anonymous User'}
                </h2>
                {userProfile.program && (
                  <Badge
                    variant="secondary"
                    className={`${getColorFromProgram(
                      userProfile.program
                    )} text-sm px-4 py-2 rounded-full font-medium`}
                  >
                    <GraduationCap className="h-4 w-4 mr-2" />
                    {userProfile.program}
                  </Badge>
                )}
              </div>

              {/* Stats Grid - Centered */}
              <div className="flex justify-center pt-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile._count.enrollments}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Kurser
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <GraduationCap className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile.program || 'Ej angivet'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Huvudområde
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Schedule Grid - Same layout as schedule view */}
      <div className="w-full space-y-6">
        {/* Semester Headers */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {semesters.map((semester) => (
            <div key={semester} className="text-center p-4 bg-muted rounded-lg">
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
                  const courses = schedule?.[semesterKey]?.[periodKey] || [];

                  return (
                    <Card
                      key={`${semester}-${period}`}
                      className="min-h-[200px] bg-background/50 backdrop-blur-sm border-2 border-dashed border-border hover:border-primary/50 transition-all duration-200"
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
                                  <BookOpen className="h-4 w-4 text-primary flex-shrink-0 mt-0.5" />
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
                                <div className="flex items-center justify-end pt-2 border-t border-border">
                                  <Badge
                                    variant="secondary"
                                    className="text-xs"
                                  >
                                    {course.credits} hp
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

        {/* Mobile Layout Helper */}
        <div className="md:hidden text-center text-sm text-muted-foreground mt-8">
          <p>På mobil visas varje termin separat för bättre överblick.</p>
        </div>
      </div>
    </div>
  );
}
