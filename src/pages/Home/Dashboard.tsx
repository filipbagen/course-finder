// react
import { useState, useEffect, useCallback, useMemo } from 'react';

// components
import Filter from './Filter';

// icons
import { MapPin } from 'lucide-react';
import { LayoutGrid } from 'lucide-react';
import { Rows3 } from 'lucide-react';

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

// types and hooks
import { Course, SelectedFilters } from '../../types/types'; // Extract types into a separate file
import { useFilterCourses } from '../../hooks/hooks'; // Extract course filtering into a custom hook
import useSortCourses from '../../hooks/useSortCourses'; // New custom hook for sorting
import { useFilters } from '../../hooks/useFilters'; // New custom hook for managing filters

const showSonner = (courseName: string) => {
  toast('Course added!', {
    description: `You added ${courseName} to your schedule.`,
    action: {
      label: 'Undo',
      onClick: () => console.log('Undo'),
    },
  });
};

const VIEW_GRID = 'grid';
const VIEW_LIST = 'list';

const Dashboard = () => {
  const initialFilters: SelectedFilters = {
    period: [],
    semester: [],
    block: [],
    courseLevel: '',
    mainFieldOfStudy: [],
    location: '',
    studyPace: '',
    examination: [],
  };

  const { selectedFilters, checkedStatus, handleFilterChange, resetFilters } =
    useFilters(initialFilters);

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedValue, setSelectedValue] = useState<string | null>(null);

  const [view, setView] = useState<typeof VIEW_GRID | typeof VIEW_LIST>(
    VIEW_GRID
  );

  const toggleView = useCallback(() => {
    setView((prevView) => (prevView === VIEW_GRID ? VIEW_LIST : VIEW_GRID));
  }, []);

  const processedCourses = useMemo(
    () =>
      courses.map((course) => ({
        ...course,
        block: course.block.map((block) =>
          typeof block === 'string' ? parseInt(block) : block
        ),
      })),
    [courses]
  );

  const [displayedCourses, setDisplayedCourses] =
    useState<Course[]>(processedCourses);

  const filteredCourses = useFilterCourses(processedCourses, selectedFilters);

  const sortedCourses = useSortCourses(filteredCourses, selectedValue || '');

  useEffect(() => {
    setDisplayedCourses(sortedCourses);
  }, [sortedCourses]);

  const IconComponent = view === VIEW_LIST ? LayoutGrid : Rows3;

  const resetSelectedFilters = () => {
    resetFilters();
  };

  return (
    <div className="mt-28 sm:mt-40 flex gap-4">
      <Filter
        handleFilterChange={handleFilterChange}
        checkedStatus={checkedStatus}
        resetSelectedFilters={resetSelectedFilters}
      />

      <div className="flex flex-col gap-4 w-full">
        <Input
          type="text"
          placeholder="Search course"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
          }}
        />

        <div className="flex gap-4 items-center justify-between">
          <p>
            Showing <b>{displayedCourses.length}</b> search results
          </p>

          <div className="flex items-center gap-4">
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

            <IconComponent
              className="cursor-pointer text-muted-foreground hover:text-primary transition-colors duration-200"
              onClick={toggleView}
            />
          </div>
        </div>

        <div
          className={`flex overflow-auto gap-4 justify-between ${
            view == VIEW_GRID ? 'flex-wrap' : 'flex-col'
          }`}
        >
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
