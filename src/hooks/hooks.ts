import { useEffect, useState } from 'react';
import { Course, SelectedFilters } from '../types/types';

const examinationKeywords = {
  tentamen: 'tenta',
  laboration: 'lab',
  projekt: 'projekt',
};

const filterByExamination = (course: Course, filterValues: string[]) => {
  return course.examination.some((exam) => {
    const examNameLower = exam.name.toLowerCase();
    return filterValues.some((filterValue) => {
      if (filterValue === 'övrigt') {
        return !Object.values(examinationKeywords).some((keyword) =>
          examNameLower.includes(keyword)
        );
      } else {
        const keyword =
          examinationKeywords[filterValue as keyof typeof examinationKeywords];
        return keyword ? examNameLower.includes(keyword) : false;
      }
    });
  });
};

const filterByOther = (
  course: Course,
  filterType: keyof Course,
  filterValues: Array<string | number> // Fix: Specify the type of filterValues as Array<string | number>
) => {
  const courseValue = course[filterType];
  if (Array.isArray(courseValue)) {
    return filterValues.some((filterValue) =>
      (courseValue as (number | string)[]).includes(filterValue)
    );
  } else {
    return filterValues.includes(courseValue as number | string);
  }
};

export const useFilterCourses = (
  courses: Course[],
  selectedFilters: SelectedFilters
) => {
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([]);

  useEffect(() => {
    const newFilteredCourses = courses.filter((course) => {
      return Object.entries(selectedFilters).every(
        ([filterType, filterValues]) => {
          if (filterValues.length === 0) {
            return true; // If no filter values are selected, always include the course
          }
          if (filterType === 'examination') {
            return filterByExamination(course, filterValues);
          } else {
            return filterByOther(
              course,
              filterType as keyof Course,
              filterValues
            ); // Fix: Add type assertion to filterType
          }
        }
      );
    });

    setFilteredCourses(newFilteredCourses);
  }, [courses, selectedFilters]);

  return filteredCourses;
};
