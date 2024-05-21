'use client';

import { SemesterCourses } from '@/app/utilities/types';
import useDragAndDrop from './hooks/useDragAndDrop';
import useCourseData from './hooks/useCourseData';
import useUserData from './hooks/useUserData';
import ScheduleView from './components/ScheduleView';
import Statistics from './Statistics';
import { Separator } from '@/components/ui/separator';

export default function Schedule() {
  const {
    courses,
    semesters,
    semestersP2,
    loading: coursesLoading,
    setCourses,
    setSemesters,
    setSemestersP2,
  } = useCourseData();

  const { user, loading: userLoading, error: userError } = useUserData();

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

  if (coursesLoading || userLoading) return <div>Loading...</div>;
  if (userError) return <div>Error loading user data</div>;

  return (
    <div className="flex flex-col gap-8">
      {user && <Statistics courses={courses} user={user} />}

      <Separator />

      <ScheduleView
        semesters={semesters}
        semestersP2={semestersP2}
        loading={coursesLoading}
        handleUpdateAfterDeletion={handleUpdateAfterDeletion}
        handleDragAndDrop={handleDragAndDrop}
        draggable={true} // Enable drag-and-drop
      />
    </div>
  );
}
