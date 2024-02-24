// react
import { useState, useEffect } from 'react';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Checkbox } from '@/components/ui/checkbox';

// data
import courses from '../../data/courses';

interface SelectedFilters {
  period: number[];
  semester: number[];
  block: number[];
  courseLevel: string;
  mainFieldOfStudy: string[];
  location: string;
  studyPace: string;
  examination: string[];
}

interface FilterProps {
  handleFilterChange: (
    filterType: keyof SelectedFilters,
    value: number | string
  ) => (checked: boolean) => void;
}

// CheckboxItem component
const CheckboxItem = ({
  filterType,
  value,
  displayValue,
  handleFilterChange,
}: {
  filterType: string | number;
  value: string | number;
  displayValue: string;
  handleFilterChange: Function;
}) => (
  <div className="items-top flex space-x-2">
    <Checkbox onCheckedChange={handleFilterChange(filterType, value)} />
    <div className="grid gap-1.5 leading-none">{displayValue}</div>
  </div>
);

const Filter: React.FC<FilterProps> = ({ handleFilterChange }) => {
  const [uniqueFields, setUniqueFields] = useState<string[]>([]);

  useEffect(() => {
    const fields = new Set<string>();
    courses.forEach((course) => {
      course.mainFieldOfStudy.forEach((field) => {
        fields.add(field);
      });
    });
    setUniqueFields(Array.from(fields).sort((a, b) => a.localeCompare(b)));
  }, []);

  const accordionItems = [
    {
      value: 'semester',
      title: 'Termin',
      filterType: 'semester',
      options: [7, 8, 9],
      displayValue: (semester: number) => `Termin ${semester}`,
    },
    {
      value: 'period',
      title: 'Period',
      filterType: 'period',
      options: [1, 2],
      displayValue: (period: number) => `Period ${period}`,
    },
    {
      value: 'block',
      title: 'Block',
      filterType: 'block',
      options: [1, 2, 3, 4],
      displayValue: (block: number) => `Block ${block}`,
    },
    {
      value: 'studyPace',
      title: 'Studietakt',
      filterType: 'studyPace',
      options: ['Helfart', 'Halvfart'],
      displayValue: (pace: string) => pace,
    },
    {
      value: 'level',
      title: 'Utbildningsnivå',
      filterType: 'courseLevel',
      options: ['Grundnivå', 'Avancerad nivå'],
      displayValue: (level: string) => level,
    },
    {
      value: 'fieldOfStudy',
      title: 'Huvudområde',
      filterType: 'mainFieldOfStudy',
      options: uniqueFields,
      displayValue: (field: string) => field,
    },
    {
      value: 'examination',
      title: 'Examination',
      filterType: 'examination',
      options: ['Tentamen', 'Laboration', 'Projekt', 'Övrigt'],
      displayValue: (type: string) => type,
    },
    {
      value: 'campus',
      title: 'Campus',
      filterType: 'location',
      options: ['Norrköping', 'Linköping'],
      displayValue: (campus: string) => campus,
    },
    // Add more items here...
  ];

  return (
    <Card
      className="sticky inset-x-0 top-16 overflow-y-auto h-full"
      style={{ maxHeight: 'calc(100vh - 74px)' }}
    >
      {/* Accordion */}
      <Accordion type="multiple" defaultValue={['semester']} className="w-full">
        {accordionItems.map((item) => (
          <AccordionItem value={item.value} key={item.value}>
            <AccordionTrigger>
              <CardHeader>
                <CardTitle>{item.title}</CardTitle>
              </CardHeader>
            </AccordionTrigger>
            <AccordionContent>
              <CardContent className="flex flex-col gap-4">
                {item.options.map((option) => {
                  // Directly use option without casting to any
                  // Bypass TypeScript's type checks - not recommended without thorough consideration
                  const displayValue = (item.displayValue as any)(option);

                  return (
                    <CheckboxItem
                      key={String(option)}
                      filterType={item.filterType}
                      displayValue={displayValue}
                      value={option}
                      handleFilterChange={handleFilterChange}
                    />
                  );
                })}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </Card>
  );
};

export default Filter;
