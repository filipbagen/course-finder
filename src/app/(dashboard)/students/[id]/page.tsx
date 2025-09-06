import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { UserProfileComponent } from '@/components/students/UserProfileComponent';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';
import { course as Course, Enrollment, Review } from '@prisma/client';

// Define an explicit type for the user profile
interface UserProfileWithDetails {
  id: string;
  name: string;
  email: string;
  colorScheme: string;
  isPublic: boolean;
  program: string | null;
  image: string | null;
  createdAt: Date;
  updatedAt: Date;
  _count: {
    enrollments: number;
    reviews: number;
  };
  totalCredits: number;
  coursesBySemester: Record<number, Course[]>;
  enrollments: (Enrollment & { course: Course })[];
  reviews: (Review & { course: { id: string; name: string; code: string } })[];
}

async function getUserProfile(
  userId: string
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
            Enrollment: true,
            Review: true,
          },
        },
      },
    });

    if (!user) return null;

    // Fetch enrollments with course data
    const enrollments = await prisma.enrollment.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        semester: 'asc',
      },
    });

    // Fetch courses for enrollments
    const courseIds = enrollments.map((e) => e.courseId);
    const courses = await prisma.course.findMany({
      where: {
        id: {
          in: courseIds,
        },
      },
    });

    // Combine enrollments with course data
    const enrollmentsWithCourses = enrollments.map((enrollment) => ({
      ...enrollment,
      course: courses.find((c) => c.id === enrollment.courseId)!,
    }));

    // Fetch reviews with course data
    const reviews = await prisma.review.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 10,
    });

    // Fetch courses for reviews
    const reviewCourseIds = reviews.map((r) => r.courseId);
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
    });

    // Combine reviews with course data
    const reviewsWithCourses = reviews.map((review) => ({
      ...review,
      course: reviewCourses.find((c) => c.id === review.courseId)!,
    }));

    // Calculate total credits
    const totalCredits = enrollmentsWithCourses.reduce((sum, enrollment) => {
      return sum + Number(enrollment.course.credits);
    }, 0);

    // Group courses by semester
    const coursesBySemester = enrollmentsWithCourses.reduce(
      (acc: Record<number, Course[]>, enrollment) => {
        const semester = enrollment.semester;
        if (!acc[semester]) {
          acc[semester] = [];
        }
        acc[semester].push(enrollment.course);
        return acc;
      },
      {}
    );

    // Since we've updated our schema to make name required, we can safely assert it's non-null
    return {
      ...user,
      name: user.name!, // Assert name is non-null
      enrollments: enrollmentsWithCourses,
      reviews: reviewsWithCourses,
      totalCredits,
      coursesBySemester,
      _count: {
        enrollments: user._count.Enrollment,
        reviews: user._count.Review,
      },
    } as UserProfileWithDetails;
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function UserProfilePage({ params }: PageProps) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect('/login');
  }

  const userProfile = await getUserProfile(id);

  if (!userProfile) {
    notFound();
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="space-y-2 px-2">
        <div className="flex items-center gap-3">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Studentprofil</h1>
            <p className="text-muted-foreground">
              Utforska andra studenters profiler och deras akademiska framsteg
            </p>
          </div>
        </div>
      </div>

      <Separator />

      {/* Profile Content */}
      <UserProfileComponent
        userProfile={userProfile}
        isOwnProfile={currentUser.id === id}
      />
    </div>
  );
}
