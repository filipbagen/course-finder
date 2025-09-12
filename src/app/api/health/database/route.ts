import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * Database health check endpoint
 * This helps diagnose database connectivity issues
 */
export async function GET() {
  const startTime = Date.now();

  try {
    // Simple query to test database connectivity
    const result = await prisma.$queryRaw`SELECT 1 as db_check`;
    const responseTime = `${Date.now() - startTime}ms`;

    // Test query for course count
    const courseCount = await prisma.course.count();

    // Return success response
    return NextResponse.json({
      status: 'healthy',
      responseTime,
      data: {
        databaseCheck: result,
        courseCount,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error) {
    // Format the error for response
    const responseTime = `${Date.now() - startTime}ms`;
    console.error('Database health check failed:', error);

    return NextResponse.json(
      {
        status: 'error',
        responseTime,
        error:
          error instanceof Error
            ? error.message
            : 'Database is temporarily unavailable. Please try again in a moment.',
      },
      { status: 500 }
    );
  }
}
