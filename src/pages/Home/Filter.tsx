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
      <Accordion
        type="multiple"
        defaultValue={[
          'item1',
          // 'item2',
          // 'item3',
          // 'item4',
          // 'item5',
          // 'item6',
          // 'item7',
        ]}
        className="w-full"
      >
        <AccordionItem value="item1">
          <AccordionTrigger>
            {/* Semester */}
            <CardHeader>
              <CardTitle>Termin</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('semester', 7)} />
                <div className="grid gap-1.5 leading-none">Termin 7</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('semester', 8)} />
                <div className="grid gap-1.5 leading-none">Termin 8</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('semester', 9)} />
                <div className="grid gap-1.5 leading-none">Termin 9</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item2">
          <AccordionTrigger>
            {/* Period */}
            <CardHeader>
              <CardTitle>Period</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('period', 1)} />
                <div className="grid gap-1.5 leading-none">Period 1</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('period', 2)} />
                <div className="grid gap-1.5 leading-none">Period 2</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item3">
          <AccordionTrigger>
            {/* Block */}
            <CardHeader>
              <CardTitle>Block</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('block', 1)} />
                <div className="grid gap-1.5 leading-none">Block 1</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('block', 2)} />
                <div className="grid gap-1.5 leading-none">Block 2</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('block', 2)} />
                <div className="grid gap-1.5 leading-none">Block 3</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox onCheckedChange={handleFilterChange('block', 2)} />
                <div className="grid gap-1.5 leading-none">Block 4</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item4">
          <AccordionTrigger>
            {/* Study pace */}
            <CardHeader>
              <CardTitle>Studietakt</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange('studyPace', 'Helfart')}
                />
                <div className="grid gap-1.5 leading-none">Helfart</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange('studyPace', 'Halvfart')}
                />
                <div className="grid gap-1.5 leading-none">Halvfart</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item5">
          <AccordionTrigger>
            {/* Level */}
            <CardHeader>
              <CardTitle>Utbildningsnivå</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange(
                    'courseLevel',
                    'Grundnivå'
                  )}
                />
                <div className="grid gap-1.5 leading-none">Grundnivå</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange(
                    'courseLevel',
                    'Avancerad nivå'
                  )}
                />
                <div className="grid gap-1.5 leading-none">Avancerad nivå</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item6">
          <AccordionTrigger>
            {/* Field of study */}
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

        {/* Examination */}
        <AccordionItem value="itemExaminations">
          <AccordionTrigger>
            <CardHeader>
              <CardTitle>Examination Type</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              {['Tentamen', 'Laboration', 'Projekt', 'Övrigt'].map(
                (type, index) => (
                  <div key={index} className="items-top flex space-x-2">
                    <Checkbox
                      onCheckedChange={handleFilterChange(
                        'examination',
                        type.toLowerCase()
                      )}
                    />
                    <div className="grid gap-1.5 leading-none">{type}</div>
                  </div>
                )
              )}
            </CardContent>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item8">
          <AccordionTrigger>
            {/* Campus */}
            <CardHeader>
              <CardTitle>Campus</CardTitle>
            </CardHeader>
          </AccordionTrigger>
          <AccordionContent>
            <CardContent className="flex flex-col gap-4">
              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange('location', 'Norrköping')}
                />
                <div className="grid gap-1.5 leading-none">Norrköping</div>
              </div>

              <div className="items-top flex space-x-2">
                <Checkbox
                  onCheckedChange={handleFilterChange('location', 'Linköping')}
                />
                <div className="grid gap-1.5 leading-none">Linköping</div>
              </div>
            </CardContent>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </Card>
  );
};

export default Filter;
