'use client';

// React and Libraries
import { LayoutGrid, Rows3 } from 'lucide-react';
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
import Filter from './Filter';
import CourseCard from '../components/CourseCard';
import { useState, useEffect } from 'react';
import { SkeletonCard } from '../components/SkeletonComponent';

export default function Dashboard() {
  const [isGrid, setIsGrid] = useState(true);
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
    campus: [],
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
    const query = new URLSearchParams();
    if (searchQuery) query.append('q', searchQuery);
    if (sortOrder) query.append('sort', sortOrder);

    // Loop over each filter and append it to the query if it has selected values
    Object.entries(filters).forEach(([key, values]) => {
      if (values.length) {
        query.append(key, values.join(','));
      }
    });

    console.log(`/api/search?${query.toString()}`);

    try {
      const response = await fetch(`/api/search?${query.toString()}`);
      if (!response.ok) {
        throw new Error('Failed to fetch: ' + response.statusText);
      }
      const data = await response.json();
      setCourses(data);
      setLoading(false);
    } catch (error) {
      console.error('Failed to fetch courses:', error);
      setLoading(false);
    }
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

  const toggleLayout = () => {
    setIsGrid((prev) => !prev);
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
            <CourseCard key={course.id} course={course} />
          ))}
        </div>
      </div>
    </div>
  );
}
