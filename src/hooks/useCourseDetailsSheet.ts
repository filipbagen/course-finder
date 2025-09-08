'use client';

import { create } from 'zustand';
import { Course } from '@/types/types';

interface CourseDetailsSheetState {
  isOpen: boolean;
  course: Course | null;
  onOpen: (course: Course) => void;
  onClose: () => void;
}

export const useCourseDetailsSheet = create<CourseDetailsSheetState>((set) => ({
  isOpen: false,
  course: null,
  onOpen: (course) => set({ isOpen: true, course }),
  onClose: () => set({ isOpen: false, course: null }),
}));
