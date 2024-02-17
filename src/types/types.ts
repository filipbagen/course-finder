export interface Course {
  courseName: string;
  credits: number;
  courseCode: string;
  mainFieldOfStudy: string[];
  courseLevel: string;
  semester: number[];
  period: number[];
  block: number[];
  location: string;
  url: string;
  prerequisites: string;
  exclusions: string[];
  studyPace: string;
  examination: {
    code: string;
    name: string;
    credits: number;
    gradingScale: string;
    type: string;
  }[];
}

export interface SelectedFilters {
  period: number[];
  semester: number[];
  block: number[];
  courseLevel: string;
  mainFieldOfStudy: string[];
  location: string;
  studyPace: string;
  examination: string[];
}
