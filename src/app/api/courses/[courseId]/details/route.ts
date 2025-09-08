import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { transformCourse } from '@/lib/transformers';
import { Course } from '@/types/types';

export const dynamic = 'force-dynamic';

export async function GET(
  request: NextRequest,
  { params }: { params: { courseId: string } }
): Promise<NextResponse> {
  const courseId = params.courseId;

  if (!courseId) {
    return NextResponse.json(
      { success: false, error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    // Fetch the course with all its details
    const course = await prisma.course.findUnique({
      where: { id: courseId },
      // No need to use include since examination is a Json[] field, not a relation
    });

    if (!course) {
      return NextResponse.json(
        { success: false, error: 'Course not found' },
        { status: 404 }
      );
    }

    // Transform the data using the existing transformer function
    const transformedCourse = transformCourse(course);

    return NextResponse.json({
      success: true,
      data: transformedCourse,
    });
  } catch (error) {
    console.error('Error fetching course details:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch course details',
      },
      { status: 500 }
    );
  }
}
