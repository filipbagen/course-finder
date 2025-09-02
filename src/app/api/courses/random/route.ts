import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { handleApiError, createSuccessResponse } from '@/lib/errors';
import { Course } from '@/types/types';
import { transformCourses } from '@/lib/transformers';

/**
 * GET /api/courses/random
 * Fetch random courses for the landing page carousel
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const count = parseInt(searchParams.get('count') || '12');

    // Use a more efficient approach: fetch more than needed and randomly select
    const courses = await prisma.course.findMany({
      select: {
        id: true,
        code: true,
        name: true,
        credits: true,
        mainFieldOfStudy: true,
        advanced: true,
        period: true,
        block: true,
        campus: true,
        content: true,
        semester: true, // Add semester to the select
      },
      take: Math.min(count * 3, 100), // Fetch 3x more than needed, max 100
    });

    if (courses.length === 0) {
      return createSuccessResponse<Course[]>([], 'No courses found');
    }

    // Transform the courses and shuffle them
    const transformedCourses = transformCourses(courses);
    const shuffled = transformedCourses
      .sort(() => Math.random() - 0.5)
      .slice(0, count);

    return createSuccessResponse<Course[]>(
      shuffled as unknown as Course[],
      'Random courses fetched successfully'
    );
  } catch (error) {
    return handleApiError(error);
  }
}
