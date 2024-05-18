'use client';

import { DragDropContext } from '@hello-pangea/dnd';
import Statistics from '@/app/dashboard/schedule/Statistics';
import { SemesterBlock } from './components/SemesterBlock';
import { SemesterCourses } from '@/app/utilities/types';
import useDragAndDrop from './hooks/useDragAndDrop';
import useCourseData from './hooks/useCourseData';

export default function Schedule() {
  const {
    courses,
    semesters,
    semestersP2,
    loading,
    setCourses,
    setSemesters,
    setSemestersP2,
  } = useCourseData();

  const handleDragAndDrop = useDragAndDrop({
    semesters,
    setSemesters,
    semestersP2,
    setSemestersP2,
  });

  const handleUpdateAfterDeletion = (enrollmentId: string) => {
    setCourses((prevCourses) =>
      prevCourses.filter((course) => course.enrollmentId !== enrollmentId)
    );

    const updateSemesterCourses = (
      semesterCourses: SemesterCourses
    ): SemesterCourses => {
      const newSemesters: SemesterCourses = {};
      Object.keys(semesterCourses).forEach((key) => {
        const filteredCourses = semesterCourses[parseInt(key)].filter(
          (course) => course.enrollmentId !== enrollmentId
        );
        newSemesters[parseInt(key)] = filteredCourses;
      });
      return newSemesters;
    };

    setSemesters((prevSemesters) => updateSemesterCourses(prevSemesters));
    setSemestersP2((prevSemestersP2) => updateSemesterCourses(prevSemestersP2));
  };

  if (loading) {
    return <div>Loading...</div>; // Render loading state
  }

  // Ensure at least 3 columns for each period
  const fixedSemesters = [7, 8, 9];

  return (
    <div className="flex flex-col gap-12">
      <Statistics courses={courses} />
      <DragDropContext onDragEnd={handleDragAndDrop}>
        <div className="flex flex-col gap-12">
          <div className="flex flex-col gap-8">
            <h5>Period 1</h5>
            <div className="flex w-full justify-between gap-4">
              {fixedSemesters.map((semester) => (
                <SemesterBlock
                  key={semester}
                  semester={semester}
                  courses={semesters[semester] || []}
                  period="P1"
                  handleUpdateAfterDeletion={handleUpdateAfterDeletion}
                />
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-8">
            <h5>Period 2</h5>
            <div className="flex w-full justify-between gap-4">
              {fixedSemesters.map((semester) => (
                <SemesterBlock
                  key={semester}
                  semester={semester}
                  courses={semestersP2[semester] || []}
                  period="P2"
                  handleUpdateAfterDeletion={handleUpdateAfterDeletion}
                />
              ))}
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
