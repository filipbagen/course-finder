import { create } from 'zustand';
import { Course } from '@/types/types';

interface EnrolledCoursesState {
  enrolledCourses: Course[];
  setEnrolledCourses: (courses: Course[]) => void;
  loading: boolean;
  setLoading: (loading: boolean) => void;
  error: string | null;
  setError: (error: string | null) => void;
}

export const useEnrolledCoursesStore = create<EnrolledCoursesState>((set) => ({
  enrolledCourses: [],
  setEnrolledCourses: (courses) => set({ enrolledCourses: courses }),
  loading: true,
  setLoading: (loading) => set({ loading }),
  error: null,
  setError: (error) => set({ error }),
}));
