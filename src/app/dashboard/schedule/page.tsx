'use client';

import { SemesterCourses } from '@/app/utilities/types';
import useDragAndDrop from './hooks/useDragAndDrop';
import useCourseData from './hooks/useCourseData';
import ScheduleView from './components/ScheduleView';

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

  return (
    <ScheduleView
      courses={courses}
      semesters={semesters}
      semestersP2={semestersP2}
      loading={loading}
      handleUpdateAfterDeletion={handleUpdateAfterDeletion}
      handleDragAndDrop={handleDragAndDrop}
      draggable={true} // Enable drag-and-drop
    />
  );
}
