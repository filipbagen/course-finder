// types.ts
import React from 'react';

interface FilterState {
  semester: string[];
  period: string[];
  block: string[];
  studyPace: string[];
  courseLevel: string[];
  mainFieldOfStudy: string[];
  examinations: string[];
  location: string[];
}

export interface AccordionItemProps {
  value: string;
  title: string;
  options: (string | number)[];
  filterType: keyof FilterState;
  displayValue: (value: string | number) => string;
  icon: React.ElementType; // Use ElementType to accept any component type
}
