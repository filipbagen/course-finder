// route.tsx
import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/app/lib/db';

export async function GET(request: NextRequest) {
  const query = request.nextUrl.searchParams.get('query') || '';

  let users = await prisma.user.findMany({
    where: {
      isPublic: true,
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { email: { contains: query, mode: 'insensitive' } },
      ],
    },
  });

  return NextResponse.json(users);
}
