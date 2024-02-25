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
import { Button } from '@/components/ui/button';

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
  checkedStatus: Record<string, Record<string | number, boolean>>;
  resetSelectedFilters: () => void;
}

// CheckboxItem component
const CheckboxItem = ({
  filterType,
  value,
  displayValue,
  handleFilterChange,
  isChecked,
}: {
  filterType: string | number;
  value: string | number;
  displayValue: string;
  handleFilterChange: Function;
  isChecked: boolean;
}) => (
  <div className="items-top flex space-x-2">
    <Checkbox
      onCheckedChange={handleFilterChange(filterType, value)}
      checked={isChecked}
    />
    <div className="grid gap-1.5 leading-none">{displayValue}</div>
  </div>
);

const Filter: React.FC<FilterProps> = ({
  handleFilterChange,
  checkedStatus,
  resetSelectedFilters,
}: FilterProps) => {
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

  const isAnyCheckboxChecked = (filterType: keyof SelectedFilters) => {
    return Object.values(checkedStatus[filterType] || {}).some(Boolean);
  };

  const resetFilters = () => {
    // Iterate over each filter type
    for (const filterType in checkedStatus) {
      // Iterate over each value in the current filter type
      for (const value in checkedStatus[filterType]) {
        // Uncheck the current checkbox
        handleFilterChange(filterType as keyof SelectedFilters, value)(false);
      }
    }

    // Reset the selected filters
    resetSelectedFilters(); // Update this line
  };

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
                <div className="flex items-center">
                  <CardTitle>{item.title}</CardTitle>
                  {isAnyCheckboxChecked(
                    item.filterType as keyof SelectedFilters
                  ) && (
                    <span className="ml-4 h-2 w-2 rounded-full bg-primary"></span>
                  )}
                </div>
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
                      isChecked={
                        checkedStatus[item.filterType]?.[option] || false
                      }
                    />
                  );
                })}
              </CardContent>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
      <CardFooter>
        <Button onClick={resetFilters}>Reset Filter</Button>
      </CardFooter>
    </Card>
  );
};

export default Filter;
