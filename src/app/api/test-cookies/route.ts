import { NextResponse } from 'next/server';

export async function GET() {
  try {
    // Test cookies function
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();

    return NextResponse.json({
      success: true,
      message: 'Cookies function works',
      cookieCount: cookieStore.getAll().length,
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
