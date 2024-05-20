import { useState, useEffect } from 'react';
import {
  CourseWithEnrollment,
  SemesterCourses,
  SemesterGroupings,
} from '@/app/utilities/types';

export default function useCourseData(userId?: string) {
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [semesters, setSemesters] = useState<SemesterCourses>({});
  const [semestersP2, setSemestersP2] = useState<SemesterCourses>({});
  const [loading, setLoading] = useState(true);

  const getCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch(
        userId ? `/api/enrollment?userId=${userId}` : '/api/enrollment'
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();

      setCourses(data.courses);

      const groupedP1 = data.courses.reduce(
        (acc: SemesterGroupings, course: CourseWithEnrollment) => {
          const key = course.semester.toString();
          if (!acc[key]) acc[key] = [];
          if (course.period.includes(1)) {
            acc[key].push(course);
          }
          return acc;
        },
        {}
      );

      const groupedP2 = data.courses.reduce(
        (acc: SemesterGroupings, course: CourseWithEnrollment) => {
          const key = course.semester.toString();
          if (!acc[key]) acc[key] = [];
          if (course.period.includes(2)) {
            acc[key].push(course);
          }
          return acc;
        },
        {}
      );

      setSemesters(groupedP1);
      setSemestersP2(groupedP2);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  useEffect(() => {
    console.log('Semesters:', semesters);
    console.log('SemestersP2:', semestersP2);
  }, [semesters, semestersP2]);

  return {
    courses,
    semesters,
    semestersP2,
    loading,
    setCourses,
    setSemesters,
    setSemestersP2,
  };
}
