import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { UserProfileComponent } from '@/components/students/UserProfileComponent';

async function getUserProfile(userId: string) {
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
        isPublic: true, // Only show public profiles
      },
      include: {
        enrollments: {
          include: {
            course: {
              include: {
                examinations: true,
              },
            },
          },
          orderBy: {
            course: {
              name: 'asc',
            },
          },
        },
        reviews: {
          include: {
            course: {
              select: {
                id: true,
                name: true,
                code: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
          take: 10, // Limit to recent reviews
        },
        _count: {
          select: {
            enrollments: true,
            reviews: true,
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    // Calculate total credits
    const totalCredits = user.enrollments.reduce((sum, enrollment) => {
      return sum + enrollment.course.credits;
    }, 0);

    // Group courses by semester
    const coursesBySemester = user.enrollments.reduce((acc, enrollment) => {
      const semester = enrollment.semester;
      if (!acc[semester]) {
        acc[semester] = [];
      }
      acc[semester].push(enrollment.course);
      return acc;
    }, {} as Record<number, any[]>);

    return {
      ...user,
      totalCredits,
      coursesBySemester,
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

interface PageProps {
  params: {
    id: string;
  };
}

export default async function UserProfilePage({ params }: PageProps) {
  const supabase = await createClient();
  const {
    data: { user: currentUser },
  } = await supabase.auth.getUser();

  if (!currentUser) {
    redirect('/login');
  }

  const userProfile = await getUserProfile(params.id);

  if (!userProfile) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
      <UserProfileComponent
        userProfile={userProfile}
        isOwnProfile={currentUser.id === params.id}
      />
    </div>
  );
}
