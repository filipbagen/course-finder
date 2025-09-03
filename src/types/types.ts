export interface User {
  id: string;
  name: string;
  email: string;
  colorScheme: string;
  isPublic: boolean;
  program: string | null;
  image: string | null;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  campus: string;
  mainFieldOfStudy: string[];
  advanced: boolean;
  courseType?: string;
  examiner?: string;
  exclusions: string[];
  scheduledHours: number | null;
  selfStudyHours: number | null;
  semester: number[];
  period: number[];
  block: number[];
  learningOutcomes?: { paragraph: string | null; list_items: string[] };
  content?: { paragraph: string | null; list_items: string[] };
  teachingMethods?: { paragraph: string | null; list_items: string[] };
  prerequisites?: { paragraph: string | null; list_items: string[] };
  recommendedPrerequisites?: { paragraph: string | null; list_items: string[] };
  offeredFor: string[];
  examination?: {
    code: string;
    name: string;
    credits: number;
    gradingScale: string;
  }[];
  programInfo?: {
    programCode: string;
    programName: string;
    semester: number;
    period: number[];
    block: number[];
    language: string;
    campus: string;
    vof: string;
  }[];
}

export interface Enrollment {
  id: string;
  semester: number;
  userId: string;
  courseId: string;
}

export interface CourseWithEnrollment extends Omit<Course, 'semester'> {
  enrollment: Enrollment;
  semester: number[]; // Keeping the same type as Course for consistency
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

export type TriState = 'checked' | 'unchecked' | 'indeterminate';

export type FilterState = {
  semester: string[];
  period: string[];
  block: string[];
  studyPace: string[];
  courseLevel: string[];
  mainFieldOfStudy: string[];
  examinations: Record<string, TriState>;
  campus: string[];
};

export interface FilterProps {
  onFilterChange: (
    filterType: keyof FilterState,
    value: string,
    newState: TriState | boolean
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
