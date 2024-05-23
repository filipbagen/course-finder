import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { NextResponse } from 'next/server';
import { getKindeServerSession } from '@kinde-oss/kinde-auth-nextjs/server';

const prisma = new PrismaClient();

export async function GET(request: Request) {
  const url = new URL(request.url);
  const courseId = url.searchParams.get('courseId');

  if (!courseId) {
    return NextResponse.json(
      { error: 'Course ID is required' },
      { status: 400 }
    );
  }

  try {
    const reviews = await prisma.review.findMany({
      where: {
        courseId: courseId as string,
      },
      include: {
        user: {
          select: { name: true, image: true },
        },
      },
    });
    return NextResponse.json(reviews, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch reviews' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  const { getUser } = getKindeServerSession();
  const user = await getUser();

  if (!user) {
    return NextResponse.json({ error: 'No user logged in' }, { status: 401 });
  }

  const { rating, comment, courseId } = await request.json();

  if (!rating || !courseId) {
    return NextResponse.json(
      { error: 'Rating and courseId are required' },
      { status: 400 }
    );
  }

  try {
    const review = await prisma.review.create({
      data: {
        id: uuidv4(),
        rating,
        comment,
        user: { connect: { id: user.id } },
        course: { connect: { id: courseId } },
      },
    });
    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to post review' },
      { status: 500 }
    );
  }
}
