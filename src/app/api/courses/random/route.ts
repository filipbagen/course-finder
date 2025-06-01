import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

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
        semester: true,
        period: true,
        block: true,
        campus: true,
        content: true,
      },
      take: Math.min(count * 3, 100), // Fetch 3x more than needed, max 100
    });

    if (courses.length === 0) {
      return NextResponse.json([]);
    }

    // Randomly shuffle and take the requested count
    const shuffled = courses.sort(() => Math.random() - 0.5).slice(0, count);

    return NextResponse.json(shuffled);
  } catch (error) {
    console.error('Error fetching random courses:', error);
    return NextResponse.json(
      { error: 'Failed to fetch courses' },
      { status: 500 }
    );
  }
}
