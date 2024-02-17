// react
import { useState } from 'react';

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

import { Course, SelectedFilters } from '../../types/types'; // Extract types into a separate file
import { useFilterCourses } from '../../hooks/hooks'; // Extract course filtering into a custom hook

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

  const handleFilterChange =
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
            [filterType]: currentFilterValues.filter((item) => item !== value),
          };
        }
      });
    };

  const filteredCourses = useFilterCourses(
    courses as Course[],
    selectedFilters
  ); // Use custom hook for filtering

  const showSonner = (courseName: string) => {
    toast('Course added!', {
      description: `You added ${courseName} to your schedule.`,
      action: {
        label: 'Undo',
        onClick: () => console.log('Undo'),
      },
    });
  };

  return (
    <div className="mt-28 sm:mt-40 flex gap-4">
      <Filter handleFilterChange={handleFilterChange} />

      <div className="flex h-full flex-wrap gap-4 justify-between">
        {filteredCourses.map((course) => (
          <Card key={course.courseCode} className="flex-grow">
            <CardHeader>
              <div className="flex justify-between">
                <CardTitle>{course.courseName}</CardTitle>
                <Button
                  onClick={() => showSonner(course.courseName)}
                  size={'icon'}
                >
                  +
                </Button>
              </div>
              <CardDescription>{course.courseCode}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 items-center">
                <MapPin size={16} />
                <p>{course.location}</p>
              </div>
            </CardContent>
            <CardFooter className="flex gap-4">
              <p>Termin {course.semester.join(', ')}</p>
              <p>Period {course.period.join(', ')}</p>
              <p>Block {course.block.join(', ')}</p>
            </CardFooter>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Dashboard;
