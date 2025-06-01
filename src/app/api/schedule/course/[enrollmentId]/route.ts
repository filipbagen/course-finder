import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

/**
 * DELETE /api/schedule/course/[enrollmentId]
 * Remove course from schedule
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ enrollmentId: string }> }
) {
  try {
    const { enrollmentId } = await params;
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    if (!enrollmentId) {
      return NextResponse.json(
        { error: 'Enrollment ID is required' },
        { status: 400 }
      );
    }

    // Verify enrollment belongs to the user
    const enrollment = await prisma.enrollment.findFirst({
      where: {
        id: enrollmentId,
        userId: user.id,
      },
    });

    if (!enrollment) {
      return NextResponse.json(
        { error: 'Enrollment not found' },
        { status: 404 }
      );
    }

    // Delete the enrollment
    await prisma.enrollment.delete({
      where: {
        id: enrollmentId,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error removing course from schedule:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
