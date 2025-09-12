import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

// Force dynamic rendering to avoid static generation errors with cookies
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const diagnostics = {
      timestamp: new Date().toISOString(),
      environment: {
        node_env: process.env.NODE_ENV,
        next_public_supabase_url: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        next_public_supabase_anon_key:
          !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        supabase_service_role_key: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        database_url: !!process.env.DATABASE_URL,
        direct_url: !!process.env.DIRECT_URL,
      },
      supabase: null as any,
      database: null as any,
      apiRoutes: null as any,
      middleware: null as any,
    };

    // Test Supabase connection
    try {
      const supabase = await createClient();
      const { data, error } = await supabase.auth.getUser();
      diagnostics.supabase = {
        connected: !error,
        hasUser: !!data?.user,
        userId: data?.user?.id || null,
        error: error?.message || null,
      };
    } catch (error: any) {
      diagnostics.supabase = {
        connected: false,
        error: error.message,
      };
    }

    // Test database connection
    try {
      const count = await prisma.course.count();
      diagnostics.database = {
        connected: true,
        courseCount: count,
      };
    } catch (error: any) {
      diagnostics.database = {
        connected: false,
        error: error.message,
      };
    }

    // Test API routes
    const apiTests = {
      coursesInfinite: null as any,
      coursesCount: null as any,
      coursesRandom: null as any,
    };

    try {
      const response = await fetch(
        `${
          process.env.PRODUCTION_URL || 'http://localhost:3000'
        }/api/courses/infinite?limit=1`
      );
      apiTests.coursesInfinite = {
        status: response.status,
        ok: response.ok,
      };
    } catch (error: any) {
      apiTests.coursesInfinite = {
        error: error.message,
      };
    }

    try {
      const response = await fetch(
        `${
          process.env.PRODUCTION_URL || 'http://localhost:3000'
        }/api/courses/count`
      );
      const data = await response.json();
      apiTests.coursesCount = {
        status: response.status,
        ok: response.ok,
        data: data,
      };
    } catch (error: any) {
      apiTests.coursesCount = {
        error: error.message,
      };
    }

    try {
      const response = await fetch(
        `${
          process.env.PRODUCTION_URL || 'http://localhost:3000'
        }/api/courses/random?count=1`
      );
      apiTests.coursesRandom = {
        status: response.status,
        ok: response.ok,
      };
    } catch (error: any) {
      apiTests.coursesRandom = {
        error: error.message,
      };
    }

    diagnostics.apiRoutes = apiTests;

    // Test middleware (simulate a request)
    try {
      const middlewareResponse = await fetch(
        `${
          process.env.PRODUCTION_URL || 'http://localhost:3000'
        }/api/test-middleware`
      );
      diagnostics.middleware = {
        status: middlewareResponse.status,
        ok: middlewareResponse.ok,
      };
    } catch (error: any) {
      diagnostics.middleware = {
        error: error.message,
      };
    }

    return NextResponse.json({
      success: true,
      diagnostics,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        success: false,
        error: error.message,
        stack: error.stack,
      },
      { status: 500 }
    );
  }
}
