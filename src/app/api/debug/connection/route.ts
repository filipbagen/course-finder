import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// This endpoint is used to debug database connection issues
export async function GET() {
  try {
    // Get environment info
    const envInfo = {
      nodeEnv: process.env.NODE_ENV,
      databaseUrlExists: !!process.env.DATABASE_URL,
      directUrlExists: !!process.env.DIRECT_URL,
      // Don't include actual connection strings for security
      databaseUrlPrefix: process.env.DATABASE_URL?.substring(0, 20) + '...',
      directUrlPrefix: process.env.DIRECT_URL?.substring(0, 20) + '...',
    };

    // Check database connection by running a simple query
    console.log('Testing database connection...');
    // Try a simple query to test connection
    await prisma.$queryRaw`SELECT 1 as connected`;
    console.log('Database connection successful');

    // Get a count of courses for a simple DB verification
    const courseCount = await prisma.course.count();
    console.log('Course count:', courseCount);

    return NextResponse.json({
      success: true,
      message: 'Database connection successful',
      environmentInfo: envInfo,
      connectionTest: true,
      courseCount,
    });
  } catch (error) {
    console.error('Database connection test failed:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    
    return NextResponse.json({
      success: false,
      message: 'Database connection failed',
      error: errorMessage,
      // Include stack trace for better debugging
      stack: error instanceof Error ? error.stack : undefined,
      // Include more details if available
      details: error instanceof Error ? {
        name: error.name,
        code: (error as any).code,
        meta: (error as any).meta,
      } : undefined,
      environmentInfo: {
        nodeEnv: process.env.NODE_ENV,
        databaseUrlExists: !!process.env.DATABASE_URL,
        directUrlExists: !!process.env.DIRECT_URL,
      },
    }, { status: 500 });
  }
}
