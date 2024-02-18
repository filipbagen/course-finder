// react
import React, { useState, useEffect, useCallback } from 'react';

// components
import Filter from './Filter';

// icons
import { MapPin } from 'lucide-react';

// data
import courses from '../../data/courses';

// shadcn
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';

import { Course, SelectedFilters } from '../../types/types'; // Extract types into a separate file
import { useFilterCourses } from '../../hooks/hooks'; // Extract course filtering into a custom hook

// hooks
import useSortCourses from '../../hooks/useSortCourses'; // New custom hook for sorting

const showSonner = (courseName: string) => {
  toast('Course added!', {
    description: `You added ${courseName} to your schedule.`,
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  });
};

const Dashboard = () => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    period: [],
    semester: [],
    block: [],
    courseLevel: '',
    mainFieldOfStudy: [],
    location: '',
    studyPace: '',
    examination: [],
  });

  const [searchTerm, setSearchTerm] = useState(''); // New state for search term
  const [selectedValue, setSelectedValue] = useState('courseCode');
  const [displayedCourses, setDisplayedCourses] = useState<Course[]>(
    courses.map((course) => ({
      ...course,
      block: course.block.map((block) =>
        typeof block === 'string' ? parseInt(block) : block
      ),
    }))
  ); // replace originalCourses with your initial courses array
  // const [displayedCourses, setDisplayedCourses] = useState<Course[]>([]);

  const sortedCourses = useSortCourses(displayedCourses, selectedValue); // Use custom hook for sorting

  const handleFilterChange = useCallback(
    (filterType: keyof SelectedFilters, value: number | string) =>
      (checked: boolean) => {
        setSelectedFilters((prevFilters) => {
          const currentFilterValues = prevFilters[filterType] as (
            | number
            | string
          )[];
          if (checked) {
            return {
              ...prevFilters,
              [filterType]: [...currentFilterValues, value],
            };
          } else {
            return {
              ...prevFilters,
              [filterType]: currentFilterValues.filter(
                (item) => item !== value
              ),
            };
          }
        });
      },
    []
  );

  // Convert searchTerm to lowercase only once
  const lowerCaseSearchTerm = searchTerm.toLowerCase();

  const filteredCourses = useFilterCourses(
    courses as Course[],
    selectedFilters
  ); // Use custom hook for filtering

  // Filter courses based on search term
  useEffect(() => {
    const filtered = filteredCourses.filter(
      (course) =>
        course.courseName.toLowerCase().includes(lowerCaseSearchTerm) ||
        course.courseCode.toLowerCase().includes(lowerCaseSearchTerm)
    );
    setDisplayedCourses(filtered);
  }, [filteredCourses, lowerCaseSearchTerm]);

  return (
    <div className="mt-28 sm:mt-40 flex gap-4">
      <Filter handleFilterChange={handleFilterChange} />

      <div className="flex flex-col gap-4 w-full">
        <Input
          type="text"
          placeholder="Search course"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />

        <div className="flex justify-between">
          <p>
            Showing <b>{displayedCourses.length}</b> search results
          </p>

          <Select onValueChange={setSelectedValue}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Sort" />
            </SelectTrigger>
            <SelectContent>
              <SelectGroup>
                <SelectItem value="courseCode">Course Code (A-Z)</SelectItem>
                <SelectItem value="courseCodeReversed">
                  Course Code (Z-A)
                </SelectItem>
                <SelectItem value="courseName">Course Name (A-Z)</SelectItem>
                <SelectItem value="courseNameReverse">
                  Course Name (Z-A)
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>

        <div className="flex overflow-auto flex-wrap gap-4 justify-between">
          {sortedCourses.map((course) => (
            <Card key={course.courseCode} className="flex-grow h-min">
              <CardHeader>
                <div className="flex justify-between gap-2">
                  <CardTitle>{course.courseName}</CardTitle>
                  <Button
                    onClick={() => showSonner(course.courseName)}
                    size={'icon'}
                    aria-label={`Add ${course.courseName} to your schedule`}
                  >
                    +
                  </Button>
                </div>
                <CardDescription>{course.courseCode}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex gap-2 items-center mb-4">
                  <MapPin size={16} />
                  <p>{course.location}</p>
                </div>

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="mainFieldOfStudy" border={false}>
                    <div className="flex justify-between">
                      <CardFooter className="flex gap-4">
                        <p>Termin {course.semester.join(', ')}</p>
                        <p>Period {course.period.join(', ')}</p>
                        <p>Block {course.block.join(', ')}</p>
                      </CardFooter>
                      <AccordionTrigger className="p-0" />
                    </div>

                    <AccordionContent className="flex flex-col gap-4 p-0  mt-6">
                      <div>
                        <h3>Förkunskaper</h3>
                        <p>{course.prerequisites}</p>
                      </div>

                      <div>
                        <h3>Huvudområde</h3>
                        <p>{course.mainFieldOfStudy.join(', ')}</p>
                      </div>

                      <div>
                        <h3>Examination</h3>
                        <ul>
                          {course.examination.map((ex) => (
                            <li key={ex.name}>{ex.name}</li>
                          ))}
                        </ul>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
