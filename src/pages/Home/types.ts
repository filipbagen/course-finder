export type FilterState = {
  semester: string[];
  period: string[];
  // Add other filters here
};

export type Course = {
  courseName: string;
  credits: string;
  courseCode: string;
  mainFieldOfStudy: string[];
  courseLevel: string;
  semester: string[];
  period: string[];
  block: string[];
  location: string;
  url: string;
  prerequisites: string;
  exclusions: string[];
  studyPace: string;
  examination: { [key: string]: any }[];
};
