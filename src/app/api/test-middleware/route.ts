import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    success: true,
    message: 'Middleware test successful',
    timestamp: new Date().toISOString(),
  });
}
