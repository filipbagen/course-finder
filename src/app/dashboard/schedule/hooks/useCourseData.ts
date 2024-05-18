import { useState, useEffect } from 'react';
import {
  CourseWithEnrollment,
  SemesterCourses,
  Course,
  SemesterGroupings,
} from '@/app/utilities/types';

export default function useCourseData() {
  const [courses, setCourses] = useState<CourseWithEnrollment[]>([]);
  const [semesters, setSemesters] = useState<SemesterCourses>({});
  const [semestersP2, setSemestersP2] = useState<SemesterCourses>({});
  const [loading, setLoading] = useState(true);

  // Same getCourses function goes here
  const getCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/enrollment');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data.courses);

      const groupedP1 = data.courses.reduce(
        (acc: SemesterGroupings, course: Course) => {
          const key = course.semester.toString(); // Ensure the key is a string, adjust as necessary
          if (!acc[key]) acc[key] = [];
          if (course.period.includes(1)) {
            acc[key].push(course);
          }
          return acc;
        },
        {}
      );

      const groupedP2 = data.courses.reduce(
        (acc: SemesterGroupings, course: Course) => {
          const key = course.semester.toString(); // Ensure the key is a string, adjust as necessary
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
