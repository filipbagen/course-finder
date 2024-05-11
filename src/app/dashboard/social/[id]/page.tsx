// File: src/app/dashboard/social/[id]/page.tsx

import prisma from '@/app/lib/db';
import { Course } from '@/app/utilities/types';

type Props = {
  params: {
    id: string;
  };
};

export default async function DynamicRoute({ params }: Props) {
  const { id } = params;

  // Fetch enrollments with nested course data included and also include the enrollment details
  const enrollments = await prisma.enrollment.findMany({
    where: {
      userId: id,
    },
    select: {
      semester: true, // select the semester from the enrollment
      course: true, // Include the full course details
    },
  });

  // Transform the data to include the semester specified in the enrollment
  const coursesWithEnrollmentSemester = enrollments.map((enrollment) => ({
    id: enrollment.course.id,
    name: enrollment.course.name,
    semester: enrollment.semester, // Override the semester to the one in the enrollment
  }));

  return (
    <div>
      <p>Hello from dynamic route with id: {id}</p>
      <h2>Courses:</h2>
      <ul>
        {coursesWithEnrollmentSemester.map((course) => (
          <li key={course.id}>
            {course.name} (Semester: {course.semester})
          </li>
        ))}
      </ul>
    </div>
  );
}
