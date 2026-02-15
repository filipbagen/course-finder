'use client'

import React from 'react'
import {
  GraduationCap,
  Star,
  Award,
  Target,
  SignpostBig,
  Blocks,
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Separator } from '@/components/ui/separator'
import { useCourseDetailsSheet } from '@/features/courses/hooks/useCourseDetailsSheet'
import { CourseDetailsDialog } from '@/features/courses/components/CourseDetailsDialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

interface UserProfileData {
  id: string
  name: string
  email: string
  program: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  colorScheme: string
  isPublic: boolean
  totalCredits: number
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  coursesBySemester: Record<number, any[]>
  enrollments: {
    id: string
    semester: number
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    course: any
  }[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  reviews: any[]
  _count: {
    enrollment: number
    review: number
  }
}

interface UserProfileComponentProps {
  userProfile: UserProfileData
  isOwnProfile: boolean
  currentUserColorScheme?: string
}

export function UserProfileComponent({
  userProfile,
  isOwnProfile: _isOwnProfile,
  currentUserColorScheme: _currentUserColorScheme = 'blue',
}: UserProfileComponentProps) {
  const { onOpen } = useCourseDetailsSheet()
  const _getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  // Define expected totals based on user requirements
  const expectedTotalCredits = 90 // Total credits needed for 3 semesters
  const expectedAdvancedCredits = 60 // Advanced credits needed
  const requiredFieldCredits = 30 // Advanced credits needed in same field for main field

  // Calculate advanced credits
  const advancedCredits = React.useMemo(() => {
    let total = 0
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allCourses: any[] = []

    Object.values(userProfile.coursesBySemester).forEach((courses) => {
      courses.forEach((course) => {
        // Avoid counting the same course multiple times
        if (!allCourses.some((c) => c.id === course.id)) {
          if (course.advanced) {
            total += Number(course.credits) || 0
          }
          allCourses.push(course)
        }
      })
    })

    return total
  }, [userProfile.coursesBySemester])

  // Calculate advanced credits by field for main field determination
  const advancedCreditsByField = React.useMemo(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const allCourses: any[] = []
    const creditCount: { [key: string]: number } = {}

    Object.values(userProfile.coursesBySemester).forEach((courses) => {
      courses.forEach((course) => {
        // Avoid counting the same course multiple times
        if (!allCourses.some((c) => c.id === course.id) && course.advanced) {
          course.mainFieldOfStudy.forEach((field: string) => {
            creditCount[field] =
              (creditCount[field] || 0) + Number(course.credits)
          })
          allCourses.push(course)
        }
      })
    })

    return creditCount
  }, [userProfile.coursesBySemester])

  // Determine main field of study (requires 30+ advanced credits in same field)
  const mainFieldOfStudy = React.useMemo(() => {
    const validFields = Object.entries(advancedCreditsByField).filter(
      ([_, credits]) => credits >= requiredFieldCredits,
    )

    if (validFields.length === 0) return null

    // Return the field with most credits
    const sortedFields = validFields.sort((a, b) => b[1] - a[1])
    const topField = sortedFields[0]
    if (!topField) return null
    return {
      field: topField[0],
      credits: topField[1],
    }
  }, [advancedCreditsByField, requiredFieldCredits])

  const progressPercentage = React.useMemo(() => {
    return Math.min(
      (userProfile.totalCredits / expectedTotalCredits) * 100,
      100,
    )
  }, [userProfile.totalCredits, expectedTotalCredits])

  const advancedProgressPercentage = React.useMemo(() => {
    return Math.min((advancedCredits / expectedAdvancedCredits) * 100, 100)
  }, [advancedCredits, expectedAdvancedCredits])

  const _getColorFromProgram = (program: string | null) => {
    if (!program) return 'bg-gray-100 text-gray-700'

    const colors = [
      'bg-blue-100 text-blue-700',
      'bg-green-100 text-green-700',
      'bg-purple-100 text-purple-700',
      'bg-orange-100 text-orange-700',
      'bg-pink-100 text-pink-700',
      'bg-indigo-100 text-indigo-700',
    ]

    const hash = program.split('').reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0)
      return a & a
    }, 0)

    return colors[Math.abs(hash) % colors.length]
  }

  // Get user's primary color for theming
  const _getUserPrimaryColor = (colorScheme: string) => {
    switch (colorScheme) {
      case 'blue':
        return 'bg-blue-500'
      case 'green':
        return 'bg-green-500'
      case 'purple':
        return 'bg-purple-500'
      case 'orange':
        return 'bg-orange-500'
      case 'pink':
        return 'bg-pink-500'
      case 'indigo':
        return 'bg-indigo-500'
      default:
        return 'bg-primary'
    }
  }

  const getSemesterDescription = (semester: number): string => {
    switch (semester) {
      case 7:
        return 'Höst år 4'
      case 8:
        return 'Vår år 4'
      case 9:
        return 'Höst år 5'
      default:
        return ''
    }
  }

  // Organize courses by semester and period like in the schedule
  const organizeCoursesForSchedule = () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const schedule: Record<string, Record<string, any[]>> = {
      semester7: { period1: [], period2: [] },
      semester8: { period1: [], period2: [] },
      semester9: { period1: [], period2: [] },
    }

    userProfile.enrollments.forEach((enrollment) => {
      const { semester, course } = enrollment

      // Only show courses for semesters 7, 8, 9
      if (semester >= 7 && semester <= 9) {
        const semesterKey = `semester${semester}`

        // Handle multi-period courses: if course.period includes multiple periods,
        // show the course in all those periods
        if (course.period && Array.isArray(course.period)) {
          course.period.forEach((coursePeriod: bigint) => {
            const period = Number(coursePeriod)
            if (period === 1 || period === 2) {
              const periodKey = `period${period}`
              if (schedule[semesterKey] && schedule[semesterKey][periodKey]) {
                schedule[semesterKey][periodKey].push(course)
              }
            }
          })
        }
      }
    })

    return schedule
  }

  const schedule = organizeCoursesForSchedule()
  const semesters = [7, 8, 9] as const
  const periods = [1, 2] as const

  return (
    <div className="space-y-8">
      {/* Tabs for Schedule and Reviews */}
      <Tabs defaultValue="schedule" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="schedule">Schema</TabsTrigger>
          <TabsTrigger value="reviews">
            Recensioner ({userProfile._count.review})
          </TabsTrigger>
        </TabsList>

        {/* Schedule Tab */}
        <TabsContent value="schedule" className="mt-6 space-y-6">
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
                    <div className="text-2xl font-bold">
                      {advancedCredits} hp
                    </div>
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
                  <CardTitle className="text-sm font-medium">
                    Huvudområde
                  </CardTitle>
                  <Award className="h-4 w-4 text-muted-foreground" />
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

          {/* Schedule Grid - Same layout as schedule view */}
          <div className="w-full space-y-6">
            {/* Mobile Layout - Single Column */}
            <div className="space-y-6 md:hidden">
              {/* Semester 7 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 7 - Höst år 4
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester7?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 7 - Höst år 4
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester7?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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

              {/* Semester 8 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 8 - Vår år 4
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester8?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 8 - Vår år 4
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester8?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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

              {/* Semester 9 - Period 1 */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 1
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 9 - Höst år 5
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester9?.period1?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
                  <div className="h-8 w-2 rounded-full bg-primary" />
                  <h3 className="text-xl font-semibold text-foreground">
                    Period 2
                  </h3>
                </div>
                <div className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4">
                  {/* Semester Label */}
                  <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                    Termin 9 - Höst år 5
                  </div>
                  <div className="space-y-3 pt-8">
                    {schedule?.semester9?.period2?.map((course) => (
                      <Card
                        key={course.id}
                        className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                        onClick={() => onOpen(course)}
                      >
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0 flex-1">
                              <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                {course.name}
                              </h3>
                              <p className="mt-1 font-mono text-sm text-muted-foreground">
                                {course.code}
                              </p>
                            </div>
                          </div>
                        </CardHeader>

                        <CardContent className="space-y-3 pt-0">
                          {/* Main Field of Study */}
                          <div className="flex items-start gap-2">
                            <SignpostBig
                              className="mt-0.5 h-4 w-4 flex-shrink-0"
                              style={{ color: 'hsl(var(--primary))' }}
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
                                  ),
                                )
                              )}
                            </div>
                          </div>

                          {/* Schedule Information */}
                          <div className="flex items-center justify-between border-t border-border pt-2">
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
                    <div className="flex h-32 flex-col items-center justify-center text-center">
                      <div className="flex flex-col items-center space-y-3">
                        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
              {/* Schedule Grid */}
              <div className="mt-3 space-y-8">
                {periods.map((period) => (
                  <div key={period} className="space-y-4">
                    {/* Period Header */}
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-2 rounded-full bg-primary" />
                      <h3 className="text-xl font-semibold text-foreground">
                        Period {period}
                      </h3>
                      <div className="h-px flex-1 bg-border" />
                    </div>

                    {/* Period Grid */}
                    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
                      {semesters.map((semester) => {
                        const semesterKey =
                          `semester${semester}` as keyof typeof schedule
                        const periodKey =
                          `period${period}` as keyof (typeof schedule)[typeof semesterKey]
                        const courses =
                          schedule?.[semesterKey]?.[periodKey] || []

                        return (
                          <div
                            key={`${semester}-${period}`}
                            className="relative min-h-48 rounded-lg border-2 border-dashed border-border bg-card p-4"
                          >
                            {/* Semester Label */}
                            <div className="absolute left-2 top-2 rounded bg-background/80 px-2 py-1 text-xs font-medium text-muted-foreground">
                              Termin {semester} -{' '}
                              {getSemesterDescription(semester)}
                            </div>
                            <div className="space-y-3 pt-8">
                              {courses.map((course) => (
                                <Card
                                  key={course.id}
                                  className="group cursor-pointer transition-all duration-200 hover:shadow-md"
                                  onClick={() => onOpen(course)}
                                >
                                  <CardHeader className="pb-3">
                                    <div className="flex items-start justify-between gap-3">
                                      <div className="min-w-0 flex-1">
                                        <h3 className="line-clamp-2 text-base font-semibold leading-tight transition-colors group-hover:text-primary">
                                          {course.name}
                                        </h3>
                                        <p className="mt-1 font-mono text-sm text-muted-foreground">
                                          {course.code}
                                        </p>
                                      </div>
                                    </div>
                                  </CardHeader>

                                  <CardContent className="space-y-3 pt-0">
                                    {/* Main Field of Study */}
                                    <div className="flex items-start gap-2">
                                      <SignpostBig
                                        className="mt-0.5 h-4 w-4 flex-shrink-0"
                                        style={{ color: 'hsl(var(--primary))' }}
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
                                            ),
                                          )
                                        )}
                                      </div>
                                    </div>

                                    {/* Schedule Information */}
                                    <div className="flex items-center justify-between border-t border-border pt-2">
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
                              <div className="flex h-32 flex-col items-center justify-center text-center">
                                <div className="flex flex-col items-center space-y-3">
                                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-muted">
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
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </TabsContent>

        {/* Reviews Tab */}
        <TabsContent value="reviews" className="mt-6 space-y-6">
          {userProfile.reviews.length > 0 ? (
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <Star className="h-6 w-6 text-primary" />
                <h2 className="pb-0 text-2xl font-bold">Recensioner</h2>
                <Badge variant="secondary" className="text-sm">
                  {userProfile._count.review}
                </Badge>
              </div>

              <div className="max-h-96 space-y-4 overflow-y-auto">
                {userProfile.reviews.map((review) => (
                  <Card
                    key={review.id}
                    className="transition-shadow hover:shadow-md"
                  >
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-lg leading-tight">
                            {review.course.name}
                          </CardTitle>
                          <p className="mt-1 text-sm text-muted-foreground">
                            {review.course.code}
                          </p>
                        </div>
                        <div className="ml-4 flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-current text-yellow-400'
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
                      <p className="mt-3 text-xs text-muted-foreground">
                        {new Date(review.createdAt).toLocaleDateString('sv-SE')}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <Star className="mb-4 h-12 w-12 text-muted-foreground/50" />
              <h3 className="mb-2 text-lg font-semibold text-muted-foreground">
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
  )
}
