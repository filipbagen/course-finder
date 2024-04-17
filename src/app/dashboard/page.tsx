'use client';

// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';

// icons
import {
  MapPin,
  BookText,
  SignpostBig,
  NotebookPen,
  LayoutGrid,
} from 'lucide-react';

// components
import Filter from './Filter';

// react
import React, { useState, useEffect, useRef } from 'react';

// icons
import {
  School,
  Gauge,
  Blocks,
  BetweenHorizontalStart,
  AlignVerticalJustifyCenter,
  Network,
} from 'lucide-react';

type FilterState = {
  location: string[];
};

export default function Dashboard() {
  const [courses, setCourses] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortOrder, setSortOrder] = useState<string>('');
  const [filters, setFilters] = useState<FilterState>({ location: [] });

  const handleLocationChange = (location: string, isChecked: boolean) => {
    setFilters((prev) => ({
      ...prev,
      location: isChecked
        ? [...prev.location, location]
        : prev.location.filter((l) => l !== location),
    }));
  };

  useEffect(() => {
    const fetchData = async () => {
      const query = new URLSearchParams({
        q: encodeURIComponent(searchQuery),
        sort: encodeURIComponent(sortOrder),
        location: filters.location.join(','),
      }).toString();
      const response = await fetch(`/api/search?${query}`);
      const data = await response.json();
      setCourses(data);
    };

    fetchData().catch(console.error);
  }, [searchQuery, sortOrder, filters]);

  return (
    <div className="mt-28 sm:mt-24 flex gap-4">
      {/* Location filters */}
      {['Norrköping', 'Linköping'].map((location) => (
        <div key={location}>
          <input
            type="checkbox"
            id={location}
            onChange={(e) => handleLocationChange(location, e.target.checked)}
          />
          <label
            htmlFor={location}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
          >
            {location}
          </label>
        </div>
      ))}

      <div className="flex flex-col gap-4 w-full">
        <Input
          type="text"
          placeholder="Search course"
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="flex gap-4 items-center justify-between">
          <p>
            Showing <b>{courses.length}</b> search results
          </p>

          <div className="flex items-center gap-4">
            <Select onValueChange={(value) => setSortOrder(value)}>
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

            <LayoutGrid size={24} />
          </div>
        </div>

        <div className="flex flex-wrap gap-4 justify-between">
          {courses.map((course: any) => (
            <Card key={course.courseId} className="flex-grow h-min">
              <CardHeader>
                <div className="flex justify-between">
                  <div>
                    <CardTitle>{course.courseName}</CardTitle>
                    <CardDescription className="mt-0">
                      {course.courseCode}
                    </CardDescription>
                  </div>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="icon"
                        aria-label={`Add ${course.courseName} to your schedule`}
                      >
                        +
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56">
                      <DropdownMenuItem>7</DropdownMenuItem>
                      <DropdownMenuItem>8</DropdownMenuItem>
                      <DropdownMenuItem>9</DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardHeader>

              <CardContent>
                <div className="flex gap-2 items-center mb-4">
                  <MapPin size={16} />
                  <p className="[&:not(:first-child)]:mt-0">
                    {course.location}
                  </p>
                </div>

                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="mainFieldOfStudy" border={false}>
                    <div className="flex justify-between">
                      <CardFooter className="flex gap-4">
                        <div>
                          <p>Termin {course.semester}</p>
                        </div>
                        <div>
                          <p>Period {course.period}</p>
                        </div>
                        <div>
                          <p>Block {course.block}</p>
                        </div>
                      </CardFooter>
                      <AccordionTrigger className="p-0" />
                    </div>

                    <AccordionContent className="flex flex-col gap-4 p-0  mt-6">
                      <div>
                        <div className="flex items-center gap-2">
                          <BookText size={16} />
                          <h6>Förkunskaper</h6>
                        </div>
                        <p>{course.prerequisites}</p>
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <SignpostBig size={16} />
                          <h6>Huvudområde</h6>
                        </div>

                        {course.mainFieldOfStudy.length != 0 ? (
                          <p>{course.mainFieldOfStudy}</p>
                        ) : (
                          <p>Inget huvudområde</p>
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <NotebookPen size={16} />
                          <h6>Examination</h6>
                        </div>
                        <ul>
                          {course.examinations &&
                            course.examinations.map((ex: any) => (
                              <li key={ex.examId}>
                                {ex.examName}, {ex.examCode},{' '}
                                {ex.examGradingScale}, {ex.examCredits}hp
                              </li>
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
}
