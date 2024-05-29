export interface User {
  id: string;
  name: string;
  email: string;
  colorScheme: string;
  isPublic: boolean;
  image: string;
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

export interface CourseWithEnrollment extends Course {
  enrollmentId: string;
}

export const isCourseWithEnrollment = (
  course: Course | CourseWithEnrollment
): course is CourseWithEnrollment => {
  return 'enrollmentId' in course;
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
