'use client';

import React, { useState } from 'react';
import { LayoutGrid, Rows3 } from 'lucide-react';
import { Course, FilterState } from '@/app/utilities/types';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import Filter from './Filter';
import CourseCard from '../components/CourseCard';
import { SkeletonCard } from '../components/SkeletonComponent';
import { useCourses } from '../hooks/courses/useCourses';
import { useEnrollments } from '../hooks/courses/useEnrollments';

export default function Dashboard() {
  const [isGrid, setIsGrid] = useState(true);
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
    campus: [],
  });

  const { courses, loading } = useCourses(searchQuery, sortOrder, filters);
  const { enrollments } = useEnrollments();

  const handleFilterChange = (
    filterType: keyof FilterState,
    value: string,
    isChecked: boolean
  ) => {
    setFilters((prev) => {
      const updatedValues = isChecked
        ? [...prev[filterType], value]
        : prev[filterType].filter((v) => v !== value);

      return { ...prev, [filterType]: updatedValues };
    });
  };

  const toggleLayout = () => {
    setIsGrid((prev) => !prev);
  };

  const checkExclusions = (course: Course) => {
    return enrollments.some((enrollment) =>
      course.exclusions.includes(enrollment.code)
    );
  };

  return (
    <div className="mt-28 sm:mt-24 flex gap-4">
      <Filter onFilterChange={handleFilterChange} currentFilters={filters} />

      <div className="flex flex-col gap-4 w-full">
        <Input
          type="text"
          placeholder="Sök kurs..."
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4 items-center justify-between">
          <p>
            Visar <b>{courses.length}</b> sökresultat
          </p>

          <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSortOrder(value)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Sortera" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="courseCode">Kurskod (A-Z)</SelectItem>
                  <SelectItem value="courseCodeReversed">
                    Kurskod (Z-A)
                  </SelectItem>
                  <SelectItem value="courseName">Namn (A-Z)</SelectItem>
                  <SelectItem value="courseNameReverse">Namn (Z-A)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

            <div className="hover:text-primary transition">
              {isGrid ? (
                <Rows3
                  size={24}
                  onClick={toggleLayout}
                  className="cursor-pointer"
                />
              ) : (
                <LayoutGrid
                  size={24}
                  onClick={toggleLayout}
                  className="cursor-pointer"
                />
              )}
            </div>
          </div>
        </div>

        <div
          className={`flex ${
            isGrid ? 'flex-wrap' : 'flex-col'
          } gap-4 justify-between`}
        >
          {loading && (
            <>
              {Array.from({ length: 12 }).map((_, index) => (
                <SkeletonCard variant="default" key={index} />
              ))}
            </>
          )}

          {courses.map((course: Course) => (
            <CourseCard
              key={course.id}
              course={course}
              hasExclusion={checkExclusions(course)}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
