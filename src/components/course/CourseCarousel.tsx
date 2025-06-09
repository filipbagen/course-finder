'use client';

import React, { useEffect, useState } from 'react';
import CourseCard from './CourseCard';
import { SkeletonCard } from '@/components/shared/SkeletonComponent';
import { Course as FullCourse } from '@/types/types';
import { ApiResponse } from '@/types/api';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  mainFieldOfStudy: string[];
  advanced: boolean;
  semester: number[];
  period: number[];
  block: number[];
  campus: string;
  content?: string;
}

/**
 * Course Carousel Component
 *
 * Displays a scrolling carousel of random courses from the database.
 * Automatically fetches fresh course data on component mount.
 */
export function CourseCarousel() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/courses/random?count=12');

        if (!response.ok) {
          throw new Error('Failed to fetch courses');
        }

        const result: ApiResponse<Course[]> = await response.json();

        // Handle the new standardized API response format
        if (result.success && result.data) {
          setCourses(result.data);
        } else {
          throw new Error(result.error || 'Failed to fetch courses');
        }
      } catch (err) {
        console.error('Error fetching courses:', err);
        setError('Failed to load courses');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, []);

  if (loading) {
    return (
      <div className="relative text-left my-10 overflow-hidden hidden lg:block md:block">
        <div className="pointer-events-none absolute -top-1 z-10 h-20 w-full bg-gradient-to-b from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -bottom-1 z-10 h-20 w-full bg-gradient-to-t from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -left-1 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent dark:from-background"></div>
        <div className="pointer-events-none absolute -right-1 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent dark:from-background"></div>

        <div className="grid skewAnimation grid-cols-1 gap-7 sm:h-[500px] sm:grid-cols-2">
          {Array.from({ length: 8 }).map((_, index) => (
            <SkeletonCard key={index} variant="course" />
          ))}
        </div>
      </div>
    );
  }

  if (error || courses.length === 0) {
    return (
      <div className="relative text-left my-10 overflow-hidden hidden lg:block md:block">
        <div className="text-center py-20">
          <p className="text-muted-foreground">
            {error || 'No courses available at the moment.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative text-left my-10 overflow-hidden hidden lg:block md:block">
      {/* Gradient overlays */}
      <div className="pointer-events-none absolute -top-1 z-10 h-20 w-full bg-gradient-to-b from-white to-transparent dark:from-background"></div>
      <div className="pointer-events-none absolute -bottom-1 z-10 h-20 w-full bg-gradient-to-t from-white to-transparent dark:from-background"></div>
      <div className="pointer-events-none absolute -left-1 z-10 h-full w-20 bg-gradient-to-r from-white to-transparent dark:from-background"></div>
      <div className="pointer-events-none absolute -right-1 z-10 h-full w-20 bg-gradient-to-l from-white to-transparent dark:from-background"></div>

      {/* Course grid with animation */}
      <div className="grid skewAnimation grid-cols-1 gap-7 sm:h-[500px] sm:grid-cols-2">
        {courses.map((course) => {
          // Convert course to match the full Course type
          const fullCourse: FullCourse = {
            ...course,
            scheduledHours: null,
            selfStudyHours: null,
            exclusions: [],
            offeredFor: [],
            prerequisites: '',
            recommendedPrerequisites: '',
            learningOutcomes: '',
            teachingMethods: '',
            content: course.content || '',
          };

          return (
            <CourseCard
              key={course.id}
              course={fullCourse}
              variant="landing"
              className="flex-grow h-min"
            />
          );
        })}
      </div>
    </div>
  );
}
