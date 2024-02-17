// hooks/useSortCourses.ts
import { useEffect, useState } from 'react';
import { Course } from '../types/types';

const useSortCourses = (courses: Course[], sortBy: string) => {
  const [sortedCourses, setSortedCourses] = useState(courses);

  useEffect(() => {
    let sorted = [...courses];
    switch (sortBy) {
      case 'courseCode':
        sorted.sort((a, b) => a.courseCode.localeCompare(b.courseCode));
        break;
      case 'courseCodeReversed':
        sorted.sort((a, b) => b.courseCode.localeCompare(a.courseCode));
        break;
      case 'courseName':
        sorted.sort((a, b) => a.courseName.localeCompare(b.courseName));
        break;
      case 'courseNameReverse':
        sorted.sort((a, b) => b.courseName.localeCompare(a.courseName));
        break;
      default:
        break;
    }
    setSortedCourses(sorted);
  }, [courses, sortBy]);

  return sortedCourses;
};

export default useSortCourses;
