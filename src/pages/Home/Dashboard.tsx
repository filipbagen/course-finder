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

interface Course {
  [x: string]: any;
  courseName: string;
  credits: number;
  courseCode: string;
  location: string;
  semester: number[];
  period: number[];
  block: number[];
  courseLevel: string;
  mainFieldOfStudy: string[];
  studyPace: string;
  // Add other course properties as needed
}

interface SelectedFilters {
  period: number[];
  semester: number[];
  block: number[];
  courseLevel: string;
  mainFieldOfStudy: string[];
  location: string;
  studyPace: string;
  examination: string;
}

const Dashboard = () => {
  const [selectedFilters, setSelectedFilters] = useState<SelectedFilters>({
    period: [],
    semester: [],
    block: [],
    courseLevel: '',
    mainFieldOfStudy: [],
    location: '',
    studyPace: '',
    examination: '',
    // Initialize other filters as needed
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

  const filterCourses = (courses: Course[]) => {
    return courses.filter((course) => {
      return Object.entries(selectedFilters).every(
        ([filterType, filterValues]) => {
          if (filterValues.length === 0) {
            return true; // If no filter values are selected, always include the course
          }
          // Special handling for examination type filters
          if (filterType === 'examination') {
            const examinationMapping = {
              tentamen: 'tenta',
              laboration: 'lab',
              projekt: 'projekt',
              // Note: "övrigt" is handled separately
            };

            // Filter logic for examination names
            return course.examination.some((exam: { name: string }) => {
              const examinationMapping: { [key: string]: string } = {
                tentamen: 'tenta',
                laboration: 'lab',
                projekt: 'projekt',
                // Note: "övrigt" is handled separately
              };

              const examNameLower = exam.name.toLowerCase();
              const hasSpecificType = filterValues.some(
                (filterValue: string) => {
                  if (filterValue === 'övrigt') {
                    // For "Övrigt", check if the examination name does not contain any specific keywords
                    return !Object.values(examinationMapping).some((keyword) =>
                      examNameLower.includes(keyword)
                    );
                  } else {
                    // Check if the examination name contains the specific keyword
                    const keyword = examinationMapping[filterValue];
                    return keyword ? examNameLower.includes(keyword) : false;
                  }
                }
              );
              return hasSpecificType;
            });
          } else {
            // Handling for other filter types
            const courseValue = course[filterType as keyof Course];
            if (Array.isArray(courseValue)) {
              // If courseValue is an array, check if it includes any of the filterValues
              return filterValues.some((filterValue: string | number) =>
                (courseValue as (number | string)[]).includes(filterValue)
              );
            } else {
              // If courseValue is not an array, check if it matches any of the filterValues
              return filterValues.includes(courseValue as number | string);
            }
          }
        }
      );
    });
  };

  const filteredCourses = filterCourses(courses as Course[]);

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
