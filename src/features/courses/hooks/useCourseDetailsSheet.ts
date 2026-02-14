'use client';

import { create } from 'zustand';
import { Course } from '@/types/types';

interface CourseDetailsSheetState {
  isOpen: boolean;
  course: Course | null;
  loading: boolean;
  error: string | null;
  courseId: string | null;
  onOpen: (course: Course) => void;
  onClose: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setCourse: (course: Course | null) => void;
  setCourseId: (courseId: string | null) => void;
}

export const useCourseDetailsSheet = create<CourseDetailsSheetState>((set) => ({
  isOpen: false,
  course: null,
  loading: false,
  error: null,
  courseId: null,
  onOpen: (course) =>
    set({
      isOpen: true,
      course: course, // Store the basic course info initially
      courseId: course.id,
      loading: true,
      error: null,
    }),
  onClose: () => set({ isOpen: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),
  setCourse: (course) => set({ course }),
  setCourseId: (courseId) => set({ courseId }),
}));
