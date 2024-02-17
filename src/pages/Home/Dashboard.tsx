// react
import React, { useState, ChangeEvent } from 'react';

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

interface Course {
  courseCode: string;
  courseName: string;
  location: string;
  semester: string[];
  period: string[];
  block: string[];
  // Add other course properties as needed
}

interface SelectedFilters {
  period: string[];
  semester: string[];
  // Add other filter types as needed, for example:
  // block: string[];
}

const Dashboard = () => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    period: [],
    semester: [],
    // Initialize other filters as needed
  });

  const handleFilterChange =
    (filterType: keyof SelectedFilters, value: string) =>
    (checked: boolean) => {
      setSelectedFilters((prevFilters) => {
        const currentFilterValues = prevFilters[filterType] || [];
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

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course) => {
      return Object.entries(selectedFilters).every(
        ([filterType, filterValues]) => {
          if (filterValues.length === 0) {
            return true;
          }
          return filterValues.some((value: string) =>
            course[filterType as keyof Course]?.includes(value)
          );
        }
      );
    });
  };

  const filteredCourses = filterCourses(courses);

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

      <div className="flex flex-wrap gap-4 justify-between">
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
              <p>semester {course.semester.join(', ')}</p>
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
