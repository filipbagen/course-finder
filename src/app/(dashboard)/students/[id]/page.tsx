import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma'
import { redirect, notFound } from 'next/navigation'
import { UserProfileComponent } from '@/features/students/components/UserProfileComponent'
import { GraduationCap } from 'lucide-react'
import { course as Course, enrollment, review } from '@prisma/client'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { transformCourse } from '@/lib/transformers'

// Define an explicit type for the user profile
interface UserProfileWithDetails {
  id: string
  name: string
  email: string
  colorScheme: string
  isPublic: boolean
  program: string | null
  image: string | null
  createdAt: Date
  updatedAt: Date
  _count: {
    enrollment: number
    review: number
  }
  totalCredits: number
  coursesBySemester: Record<number, Course[]>
  enrollments: (enrollment & { course: Course })[]
  reviews: (review & { course: { id: string; name: string; code: string } })[]
}

async function getUserProfile(
  userId: string,
): Promise<UserProfileWithDetails | null> {
  try {
    // First fetch the user with basic data
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isPublic: true, // Only show public profiles
      },
      include: {
        _count: {
          select: {
            enrollment: true,
            review: true,
          },
        },
      },
    })

    if (!user) return null

    // Fetch enrollments with course data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        semester: 'asc',
      },
    })

    // Fetch courses for enrollments
    const courseIds = enrollments.map((e) => e.courseId)
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    })

    // Combine enrollments with course data
    const enrollmentsWithCourses = enrollments.map((enrollment) => {
      const course = courses.find((c) => c.id === enrollment.courseId)
      return {
        ...enrollment,
        course: transformCourse(course || null) as Course,
      }
    })

    // Fetch reviews with course data
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    })

    // Fetch courses for reviews
    const reviewCourseIds = reviews.map((r) => r.courseId)
    const reviewCourses = await prisma.course.findMany({
      where: {
        id: {
          in: reviewCourseIds,
        },
      },
      select: {
        id: true,
        name: true,
        code: true,
      },
    })

    // Combine reviews with course data
    const reviewsWithCourses = reviews.map((review) => {
      const course = reviewCourses.find((c) => c.id === review.courseId)
      return {
        ...review,
        course: transformCourse(course || null) as {
          id: string
          name: string
          code: string
        },
      }
    })

    // Calculate total credits
    const totalCredits = enrollmentsWithCourses.reduce((sum, enrollment) => {
      return sum + Number(enrollment.course.credits)
    }, 0)

    // Group courses by semester
    const coursesBySemester = enrollmentsWithCourses.reduce(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (acc: Record<number, any[]>, enrollment) => {
        const semester = enrollment.semester
        if (!acc[semester]) {
          acc[semester] = []
        }
        acc[semester].push(enrollment.course)
        return acc
      },
      {},
    )

    // Since we've updated our schema to make name required, we can safely assert it's non-null
    return {
      ...user,
      name: user.name!, // Assert name is non-null
      enrollments: enrollmentsWithCourses,
      reviews: reviewsWithCourses,
      totalCredits,
      coursesBySemester,
      _count: {
        enrollment: enrollments.length,
        review: reviews.length,
      },
    }
  } catch (error) {
    console.error('Error fetching user profile:', error)
    return null
  }
}

interface PageProps {
  params: Promise<{
    id: string
  }>
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser()

  if (!currentUser) {
    redirect('/login')
  }

  // Check if current user exists in database
  const dbUser = await prisma.user.findUnique({
    where: { id: currentUser.id },
  })

  if (!dbUser) {
    console.error('Current user not found in database, signing out')
    await supabase.auth.signOut()
    redirect('/')
  }

  const userProfile = await getUserProfile(id)

  if (!userProfile) {
    notFound()
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="space-y-4">
        {/* Header Content */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-4">
              {/* Avatar */}
              <div className="relative flex-shrink-0">
                <Avatar className="h-20 w-20 shadow-xl">
                  <AvatarImage
                    src={userProfile.image || undefined}
                    alt={userProfile.name || 'Anonymous User'}
                    className="object-cover"
                  />
                  <AvatarFallback className="bg-gradient-to-br from-blue-500 to-purple-600 text-xl font-semibold text-white">
                    {userProfile.name
                      ? userProfile.name
                          .split(' ')
                          .map((n) => n[0])
                          .join('')
                          .toUpperCase()
                          .slice(0, 2)
                      : 'AU'}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div className="space-y-4">
                <h1 className="text-3xl font-bold tracking-tight">
                  {userProfile.name}s schema
                </h1>
                {userProfile.program && (
                  <Badge className="w-fit rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground shadow-sm">
                    <GraduationCap className="mr-2 h-4 w-4" />
                    {userProfile.program}
                  </Badge>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Statistics */}
      <UserProfileComponent
        userProfile={userProfile}
        isOwnProfile={currentUser.id === id}
        currentUserColorScheme={dbUser.colorScheme}
      />
    </div>
  )
}
