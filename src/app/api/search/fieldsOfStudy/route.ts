import prisma from '@/app/lib/db';
import { NextResponse } from 'next/server';

export async function GET(request: Request, response: Response) {
  try {
    const results = await prisma.courses.groupBy({
      by: ['mainFieldOfStudy'], // Adjust based on your actual data model
      where: {
        NOT: {
          mainFieldOfStudy: {
            equals: null,
          },
        },
      },
    });

    // Create a new set to hold unique fields
    const uniqueFields = new Set() as Set<string>;

    // Iterate over the results and add each item to the set
    results.forEach((item) => {
      if (Array.isArray(item.mainFieldOfStudy)) {
        item.mainFieldOfStudy.forEach((field) => uniqueFields.add(field));
      } else {
        uniqueFields.add(item.mainFieldOfStudy);
      }
    });

    // Convert the set to an array
    let fieldsArray = Array.from(uniqueFields);

    // Custom sort to ensure "Inget huvudområde" is at the end
    fieldsArray.sort((a, b) => {
      if (a === 'Inget huvudområde') return 1;
      if (b === 'Inget huvudområde') return -1;
      return a.localeCompare(b); // Sort alphabetically based on local language
    });

    return NextResponse.json(fieldsArray, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch field of studies' },
      { status: 500 }
    );
  }
}
