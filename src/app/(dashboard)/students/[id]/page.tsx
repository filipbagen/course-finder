import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { redirect, notFound } from 'next/navigation';
import { UserProfileComponent } from '@/components/students/UserProfileComponent';
import { Separator } from '@/components/ui/separator';
import { User } from 'lucide-react';

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
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <User className="h-8 w-8 text-primary" />
          <div>
            <h1 className="text-3xl font-bold tracking-tight">
              {userProfile.name}
            </h1>
            <p className="text-muted-foreground">
              {currentUser.id === id
                ? 'Din profil och akademiska framsteg'
                : 'Studentprofil och akademiska framsteg'}
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
