import { FilterState } from '@/types/types';
import {
  BetweenHorizontalStart,
  AlignVerticalJustifyCenter,
  Blocks,
  Gauge,
  Network,
  SignpostBig,
  NotebookPen,
  School,
} from 'lucide-react';

export interface AccordionItemProps {
  value: string;
  title: string;
  filterType: keyof FilterState;
  options: string[];
  displayValue: (value: string) => string;
  icon: React.ComponentType<{ size?: number }>;
}

export const accordionItems: AccordionItemProps[] = [
  {
    value: 'semester',
    title: 'Termin',
    filterType: 'semester',
    options: ['7', '8', '9'],
    displayValue: (semester) => `Termin ${semester}`,
    icon: BetweenHorizontalStart,
  },
  {
    value: 'period',
    title: 'Period',
    filterType: 'period',
    options: ['1', '2'],
    displayValue: (period) => `Period ${period}`,
    icon: AlignVerticalJustifyCenter,
  },
  {
    value: 'block',
    title: 'Block',
    filterType: 'block',
    options: ['1', '2', '3', '4'],
    displayValue: (block) => `Block ${block}`,
    icon: Blocks,
  },
  {
    value: 'studyPace',
    title: 'Studietakt',
    filterType: 'studyPace',
    options: ['Helfart', 'Halvfart'],
    displayValue: (pace) => pace,
    icon: Gauge,
  },
  {
    value: 'level',
    title: 'Utbildningsnivå',
    filterType: 'courseLevel',
    options: ['Grundnivå', 'Avancerad nivå'],
    displayValue: (level) => level,
    icon: Network,
  },
  {
    value: 'fieldOfStudy',
    title: 'Huvudområde',
    filterType: 'mainFieldOfStudy',
    options: [
      'Biologi',
      'Bioteknik',
      'Datateknik',
      'Datavetenskap',
      'Design',
      'Elektroteknik',
      'Energi- och miljöteknik',
      'Flygteknik',
      'Fysik',
      'Grafisk design och kommunikation',
      'Industriell ekonomi',
      'Informationsteknologi',
      'Kemi',
      'Kemisk biologi',
      'Kemiteknik',
      'Logistik',
      'Maskinteknik',
      'Matematik',
      'Medicinsk teknik',
      'Medieteknik',
      'Produktutveckling',
      'Programmering',
      'Teknisk biologi',
      'Teknisk fysik',
      'Tillämpad matematik',
      'Transportsystem',
      'Inget huvudområde',
    ],
    displayValue: (field) => field,
    icon: SignpostBig,
  },
  {
    value: 'examinations',
    title: 'Examination',
    filterType: 'examinations',
    options: ['Tentamen', 'Laborationer', 'Projekt', 'Inlämning'],
    displayValue: (type) => type,
    icon: NotebookPen,
  },
  {
    value: 'campus',
    title: 'Campus',
    filterType: 'campus',
    options: ['Norrköping', 'Linköping'],
    displayValue: (campus) => campus,
    icon: School,
  },
];
