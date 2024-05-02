export interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  mainFieldOfStudy: string;
  courseLevel: string;
  semester: string;
  period: string;
  block: string | number;
  location: string;
  url: string;
  prerequisites: string;
  exclusions: string;
  studyPace: string;
  examinations: Examination[];
}

export interface Examination {
  examId: string;
  courseId: string;
  examCode: string;
  examName: string;
  examCredits: number;
  examGradingScale: string;
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

export interface SemesterGroupings {
  [key: string]: Course[];
}
