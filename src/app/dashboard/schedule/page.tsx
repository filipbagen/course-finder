'use client';

import { SemesterCourses } from '@/app/utilities/types';
import useDragAndDrop from './hooks/useDragAndDrop';
import useCourseData from './hooks/useCourseData';
import useUserData from './hooks/useUserData';
import ScheduleView from './components/ScheduleView';
import Statistics from './Statistics';
import { Separator } from '@/components/ui/separator';
import { User } from '@/app/utilities/types';

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

  if (userError) return <div>Error loading user data</div>;

  const defaultUser: User = {
    id: '',
    name: 'Unknown',
    image: '',
    program: '',
    colorScheme: 'theme-blue',
    email: '',
    isPublic: true,
  };

  return (
    <div className="flex flex-col gap-8">
      <Statistics
        courses={courses}
        user={user || defaultUser}
        loading={userLoading || coursesLoading}
      />

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
