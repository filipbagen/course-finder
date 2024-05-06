'use client';

// React and Libraries
// import React, { useState, useEffect } from 'react';
import { LayoutGrid } from 'lucide-react';
import { Course, FilterState } from '@/app/utilities/types';

// Components and Styles
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import Filter from './Filter';
import CourseCard from '../components/CourseCard';
import { useState, useEffect } from 'react';

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-muted p-8 flex flex-col gap-4 justify-between min-w-80 basis-1 flex-grow h-[218px]">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-6 w-6" />
      </div>

      <Skeleton className="h-4 w-[72px]" />
      <Skeleton className="h-4 w-[128px]" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}

export default function Dashboard() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({
    semester: [],
    period: [],
    block: [],
    studyPace: [],
    courseLevel: [],
    mainFieldOfStudy: [],
    examinations: [],
    location: [],
  });

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    isChecked: boolean
  ) => {
    setFilters((prev) => {
      const updatedValues = isChecked
        ? [...prev[filterType], value]
        : prev[filterType].filter((v) => v !== value);

      const newFilters = { ...prev, [filterType]: updatedValues };
      return newFilters;
    });
  };

  useEffect(() => {
    fetchData().catch(console.error);
  }, [searchQuery, sortOrder, filters]);

  const fetchData = async () => {
    const query = new URLSearchParams({
      q: encodeURIComponent(searchQuery),
      sort: encodeURIComponent(sortOrder), // Ensure this matches the backend expected keys
    });

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) {
        query.set(key, values.join(',')); // Append filter settings
      }
    });

    const response = await fetch(`/api/search?${query.toString()}`);
    const data = await response.json();

    setCourses(data); // Set the fetched data to state
    setLoading(false); // Set loading to false after data is fetched
  };

  const fetchFilteredCourses = async (filter: { semester: number[] }) => {
    const query = filter.semester.length
      ? `?semester=${filter.semester.join(',')}`
      : '';
    const url = `/api/search${query}`;
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
    }
  };

  useEffect(() => {
    fetchFilteredCourses({ semester: [] }); // Initial load with no filters
  }, []);

  return (
    <div className="mt-28 sm:mt-24 flex gap-4">
      <Filter onFilterChange={handleFilterChange} currentFilters={filters} />

      <div className="flex flex-col gap-4 w-full">
        <Input
          type="text"
          placeholder="Search course"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4 items-center justify-between">
          <p>
            Showing <b>{courses.length}</b> search results
          </p>

          <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sort" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="courseCode">Course Code (A-Z)</SelectItem>
                  <SelectItem value="courseCodeReversed">
                    Course Code (Z-A)
                  </SelectItem>
                  <SelectItem value="courseName">Course Name (A-Z)</SelectItem>
                  <SelectItem value="courseNameReverse">
                    Course Name (Z-A)
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <LayoutGrid size={24} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-between">
          {loading && (
            <>
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard key={index} />
              ))}
            </>
          )}

          {courses.map((course: Course) => (
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}

// pages/index.tsx
// import React, { useEffect, useState } from 'react';
// function CourseList() {
//   const [courses, setCourses] = useState<Course[]>([]);

//   // Modify fetchCourses to accept filters and apply them in the API call
//   async function fetchCourses(filters: Record<string, string[]>) {
//     const query = new URLSearchParams();

//     // Construct query parameters from filters
//     for (const [key, values] of Object.entries(filters)) {
//       values.forEach((value) => query.append(key, value));
//     }

//     try {
//       const response = await fetch(`/api/search?${query.toString()}`);
//       if (!response.ok) {
//         throw new Error('Network response was not ok');
//       }
//       const data = await response.json();
//       setCourses(data);
//     } catch (error) {
//       console.error('Failed to fetch courses:', error);
//     }
//   }

//   useEffect(() => {
//     // Assuming you might want to filter by semester initially, just as an example
//     fetchCourses({ semester: ['7', '8', '9'] });
//   }, []);

//   return (
//     <div>
//       <h1>Courses</h1>
//       <ul>
//         {courses.map((course) => (
//           <li key={course.id}>{course.name}</li>
//         ))}
//       </ul>
//     </div>
//   );
// }

// export default CourseList;
