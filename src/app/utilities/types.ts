export interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  mainFieldOfStudy: string[];
  advanced: boolean;
  semester: number[];
  period: number[];
  block: number[];
  location: string;
  url: string;
  prerequisites: string;
  exclusions: string[];
  examinations?: Examination[];
}

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
  location: string[];
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
