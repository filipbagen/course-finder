export interface User {
  id: string;
  name: string; // ← Remove | null since it's required in schema
  email: string;
  colorScheme: string;
  isPublic: boolean;
  program: string | null; // ← This one can be null
  image: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  scheduledHours: number | null;
  selfStudyHours: number | null;
  mainFieldOfStudy: string[];
  advanced: boolean;
  semester: number[];
  period: number[];
  block: number[];
  campus?: string;
  exclusions: string[];
  offeredFor: string[];
  prerequisites: string;
  recommendedPrerequisites: string;
  learningOutcomes: string;
  content: string;
  teachingMethods: string;
  examinations?: Examination[]; // Ensure this is included
}

export interface Enrollment {
  id: string;
  semester: number;
  period: number;
  status: string;
  grade: string | null;
  enrolledAt: Date;
}

export interface CourseWithEnrollment extends Course {
  enrollment: Enrollment;
}

export const isCourseWithEnrollment = (
  course: Course | CourseWithEnrollment
): course is CourseWithEnrollment => {
  return 'enrollment' in course;
};

export interface Examination {
  id: string;
  courseId: string;
  code: string;
  name: string;
  credits: number;
  gradingScale: string;
  course: Course;
}

export interface FilterState {
  semester: string[];
  period: string[];
  block: string[];
  studyPace: string[];
  courseLevel: string[];
  mainFieldOfStudy: string[];
  examinations: string[];
  campus: string[];
}

export interface FilterProps {
  onFilterChange: (
    filterType: keyof FilterState,
    value: string,
    isChecked: boolean
  ) => void;
  currentFilters: FilterState;
  screen: 'desktop' | 'mobile';
}

export interface SemesterGroupings {
  [key: string]: Course[];
}

export interface SemesterCourses {
  [key: number]: CourseWithEnrollment[];
}

export interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  user: User;
}

// Re-export API types for convenience
export type {
  ApiResponse,
  ApiError,
  PaginatedResponse,
  InfiniteResponse,
} from './api';

// API Response Types
export interface CourseSearchResponse {
  items: Course[];
  nextCursor: string | null;
  hasNextPage: boolean;
  totalCount: number | null;
  count: number;
}

export interface ScheduleResponse {
  enrollments: Array<{
    id: string;
    semester: number;
    period: number;
    status: string;
    grade: string | null;
    enrolledAt: Date;
    course: Course;
  }>;
}

export interface UserResponse {
  user: User;
}

export interface EnrollmentResponse {
  courses: CourseWithEnrollment[];
}

export interface ReviewResponse {
  reviews: Review[];
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
  courseId: string;
}

export interface CreateEnrollmentRequest {
  courseId: string;
  semester: number;
}

export interface UpdateScheduleRequest {
  courseId: string;
  semester: number;
  period: number;
}
