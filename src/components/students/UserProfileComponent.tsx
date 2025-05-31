'use client';

import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Star,
  MessageSquare,
  Users,
  GraduationCap,
  Award,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
// import { CourseCard } from '@/components/course/CourseCard';

interface UserProfileData {
  id: string;
  name: string;
  email: string;
  program: string | null;
  image: string | null;
  createdAt: Date;
  totalCredits: number;
  coursesBySemester: Record<number, any[]>;
  enrollments: any[];
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
  const router = useRouter();

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

  const getSemesterName = (semester: number) => {
    const year = Math.floor((semester - 1) / 2) + 1;
    const term = semester % 2 === 1 ? 'HT' : 'VT';
    const nextYear = term === 'VT' ? year + 1 : year;
    return term === 'HT'
      ? `${term} ${2023 + year}`
      : `${term} ${2023 + nextYear}`;
  };

  const averageRating =
    userProfile.reviews.length > 0
      ? userProfile.reviews.reduce((sum, review) => sum + review.rating, 0) /
        userProfile.reviews.length
      : 0;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        {/* Back Button */}
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="mb-6 text-gray-600 hover:text-gray-900 dark:text-gray-300 dark:hover:text-white"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Tillbaka
        </Button>

        {/* Header Section */}
        <Card className="mb-8 bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl overflow-hidden">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
              {/* Avatar */}
              <div className="relative">
                <Avatar className="h-32 w-32 ring-4 ring-white shadow-xl">
                  <AvatarImage
                    src={userProfile.image || undefined}
                    alt={userProfile.name}
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
                  <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    {userProfile.name}
                  </h1>
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

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6 pt-6">
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-2" />
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
                      <Award className="h-5 w-5 text-green-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile.totalCredits}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      HP
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <MessageSquare className="h-5 w-5 text-purple-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {userProfile._count.reviews}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Recensioner
                    </div>
                  </div>

                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Star className="h-5 w-5 text-yellow-600 mr-2" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                      {averageRating > 0 ? averageRating.toFixed(1) : '—'}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">
                      Snittbetyg
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Content Tabs */}
        <Tabs defaultValue="courses" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 lg:grid-cols-3 bg-white/70 backdrop-blur-sm rounded-xl p-1">
            <TabsTrigger
              value="courses"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              <BookOpen className="h-4 w-4 mr-2" />
              Kurser
            </TabsTrigger>
            <TabsTrigger
              value="reviews"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg"
            >
              <MessageSquare className="h-4 w-4 mr-2" />
              Recensioner
            </TabsTrigger>
            <TabsTrigger
              value="schedule"
              className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg hidden lg:flex"
            >
              <Calendar className="h-4 w-4 mr-2" />
              Schema
            </TabsTrigger>
          </TabsList>

          {/* Courses Tab */}
          <TabsContent value="courses" className="space-y-6">
            {Object.keys(userProfile.coursesBySemester).length > 0 ? (
              Object.entries(userProfile.coursesBySemester)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([semester, courses]) => (
                  <Card
                    key={semester}
                    className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl"
                  >
                    <CardHeader>
                      <CardTitle className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-600" />
                        {getSemesterName(parseInt(semester))}
                        <Badge variant="outline" className="ml-auto">
                          {courses.length} kurser
                        </Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {courses.map((course) => (
                          <div
                            key={course.id}
                            className="p-4 bg-white rounded-xl border border-gray-200 hover:shadow-md transition-shadow"
                          >
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-2">
                                  {course.name}
                                </h4>
                                <Badge
                                  variant="secondary"
                                  className="ml-2 text-xs"
                                >
                                  {course.credits} HP
                                </Badge>
                              </div>
                              <p className="text-xs text-gray-600 font-mono">
                                {course.code}
                              </p>
                              <div className="flex flex-wrap gap-1">
                                {course.mainFieldOfStudy
                                  .slice(0, 2)
                                  .map((field: string, index: number) => (
                                    <Badge
                                      key={index}
                                      variant="outline"
                                      className="text-xs"
                                    >
                                      {field}
                                    </Badge>
                                  ))}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                ))
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl">
                <CardContent className="text-center py-16">
                  <BookOpen className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Inga kurser än
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isOwnProfile
                      ? 'Du har inte lagt till några kurser i ditt schema än.'
                      : `${userProfile.name} har inte lagt till några kurser än.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Reviews Tab */}
          <TabsContent value="reviews" className="space-y-6">
            {userProfile.reviews.length > 0 ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {userProfile.reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl"
                  >
                    <CardContent className="p-6">
                      <div className="space-y-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold text-gray-900">
                              {review.course.name}
                            </h4>
                            <p className="text-sm text-gray-600 font-mono">
                              {review.course.code}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <Star
                                key={i}
                                className={`h-4 w-4 ${
                                  i < review.rating
                                    ? 'text-yellow-500 fill-current'
                                    : 'text-gray-300'
                                }`}
                              />
                            ))}
                          </div>
                        </div>

                        {review.comment && (
                          <p className="text-gray-700 text-sm leading-relaxed">
                            "{review.comment}"
                          </p>
                        )}

                        <div className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString(
                            'sv-SE'
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl">
                <CardContent className="text-center py-16">
                  <MessageSquare className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
                    Inga recensioner än
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    {isOwnProfile
                      ? 'Du har inte skrivit några kursrecensioner än.'
                      : `${userProfile.name} har inte skrivit några recensioner än.`}
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Schedule Tab */}
          <TabsContent value="schedule" className="space-y-6">
            <Card className="bg-white/70 backdrop-blur-sm border-2 border-gray-200 rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-blue-600" />
                  Studieplan
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {Object.keys(userProfile.coursesBySemester).length > 0 ? (
                    Object.entries(userProfile.coursesBySemester)
                      .sort(([a], [b]) => parseInt(a) - parseInt(b))
                      .map(([semester, courses]) => (
                        <div
                          key={semester}
                          className="flex items-center justify-between p-4 bg-white rounded-xl border border-gray-200"
                        >
                          <div className="flex items-center gap-4">
                            <div className="h-12 w-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-semibold">
                              {semester}
                            </div>
                            <div>
                              <h4 className="font-semibold text-gray-900">
                                {getSemesterName(parseInt(semester))}
                              </h4>
                              <p className="text-sm text-gray-600">
                                {courses.length} kurser •{' '}
                                {courses.reduce(
                                  (sum, course) => sum + course.credits,
                                  0
                                )}{' '}
                                HP
                              </p>
                            </div>
                          </div>
                          <Badge variant="outline">
                            {courses.reduce(
                              (sum, course) => sum + course.credits,
                              0
                            )}{' '}
                            HP
                          </Badge>
                        </div>
                      ))
                  ) : (
                    <div className="text-center py-8">
                      <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600">
                        {isOwnProfile
                          ? 'Du har inte planerat några kurser än.'
                          : `${userProfile.name} har inte planerat några kurser än.`}
                      </p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
