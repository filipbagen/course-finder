import { Course } from './types';

export interface DragItemData {
  id: string;
  courseId: string;
  index: number;
  semesterId: number;
  period: string;
}

export interface DropResult {
  sourceSemesterId: number;
  destinationSemesterId: number;
  sourceIndex: number;
  destinationIndex: number;
  period: string;
  course: Course;
}