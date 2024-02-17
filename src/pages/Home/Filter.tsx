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
    setUniqueFields(Array.from(fields));
  }, []);

  return (
    <Card
      className="sticky inset-x-0 top-16 overflow-y-auto h-full"
      style={{ maxHeight: 'calc(100vh - 74px)' }}
    >
      {/* Accordion */}
      <Accordion type="multiple" defaultValue={['semester']} className="w-full">
        <AccordionItem value="semester">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Termin</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {[7, 8, 9].map((semester) => (
                <CheckboxItem
                  key={semester}
                  filterType="semester"
                  displayValue={`Termin ${semester}`}
                  value={semester}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="period">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Period</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((period) => (
                <CheckboxItem
                  key={period}
                  filterType="period"
                  displayValue={`Period ${period}`}
                  value={period}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="block">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Block</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {[1, 2, 3, 4].map((block) => (
                <CheckboxItem
                  key={block}
                  filterType="block"
                  displayValue={`Block ${block}`}
                  value={block}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="studyPace">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Studietakt</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {['Helfart', 'Halvfart'].map((pace) => (
                <CheckboxItem
                  key={pace}
                  filterType="studyPace"
                  displayValue={pace}
                  value={pace}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="level">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Utbildningsnivå</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {['Grundnivå', 'Avancerad nivå'].map((level) => (
                <CheckboxItem
                  key={level}
                  filterType="courseLevel"
                  displayValue={level}
                  value={level}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="fieldOfStudy">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Huvudområde</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {uniqueFields.map((field, index) => (
                <div key={index} className="items-top flex space-x-2">
                  <Checkbox
                    onCheckedChange={handleFilterChange(
                      'mainFieldOfStudy',
                      field
                    )}
                  />
                  <div className="grid gap-1.5 leading-none">{field}</div>
                </div>
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="examination">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Examination</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {['Tentamen', 'Laboration', 'Projekt', 'Övrigt'].map((type) => (
                <CheckboxItem
                  key={type}
                  filterType="examination"
                  displayValue={type}
                  value={type.toLowerCase()}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="campus">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Campus</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {['Norrköping', 'Linköping'].map((campus) => (
                <CheckboxItem
                  key={campus}
                  filterType="location"
                  displayValue={campus}
                  value={campus}
                  handleFilterChange={handleFilterChange}
                />
              ))}
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default Filter;
