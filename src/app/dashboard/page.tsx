'use client';

// React and Libraries
import React, { useState, useEffect } from 'react';
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
      sort: encodeURIComponent(sortOrder),
    });

    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) {
        query.set(key, values.join(',')); // Make sure keys match your server's expected query params
      }
    });

    const response = await fetch(`/api/search?${query.toString()}`);
    const data = await response.json();

    console.log(data); // Check the actual structure of 'data'
    if (!Array.isArray(data)) {
      console.error('Expected an array but got:', data);
    }

    setCourses(data); // This should trigger a re-render with the new, filtered courses
    setLoading(false);
  };

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
