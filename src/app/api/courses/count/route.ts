import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const totalCount = await prisma.course.count()
    return NextResponse.json({ success: true, totalCount })
  } catch (error) {
    console.error('Error fetching total course count:', error)
    const errorMessage =
      error instanceof Error ? error.message : 'An unknown error occurred'
    return NextResponse.json(
      { success: false, error: errorMessage },
      { status: 500 },
    )
  }
}
