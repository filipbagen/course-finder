'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import CourseCard from '@/app/components/CourseCard';

interface Course {
  courseId: string;
  courseCode: string;
  courseName: string;
  credits: number;
  mainFieldOfStudy: string;
  courseLevel: string;
  semester: string;
  period: string;
  block: string;
  location: string;
  url: string;
  prerequisites: string;
  exclusions: string;
  studyPace: string;
}

export default function Schedule() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [semesters, setSemesters] = useState<{ [key: number]: Course[] }>({});
  const [semestersP2, setSemestersP2] = useState<{ [key: number]: Course[] }>(
    {}
  );
  const [loading, setLoading] = useState(true);

  const getCourses = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/enrollment');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCourses(data.courses);
      const groupedP1 = data.courses.reduce((acc: any, course: Course) => {
        const key = course.semester;
        if (!acc[key]) acc[key] = [];
        if (course.period.includes('1')) {
          acc[key].push(course);
        }
        return acc;
      }, {});

      const groupedP2 = data.courses.reduce((acc: any, course: Course) => {
        const key = course.semester;
        if (!acc[key]) acc[key] = [];
        if (course.period.includes('2')) {
          acc[key].push(course);
        }
        return acc;
      }, {});

      setSemesters(groupedP1);
      setSemestersP2(groupedP2);
    } catch (error) {
      console.error('Failed to load courses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  const handleDragAndDrop = (results: DropResult) => {
    const { source, destination, type } = results;

    if (!destination) return; // No valid drop location
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // Dropped in the same place, no action needed
    }

    const sourceSemesterId = parseInt(source.droppableId.split('-')[0], 10);
    const destinationSemesterId = parseInt(
      destination.droppableId.split('-')[0],
      10
    );
    const period = type.endsWith('P1') ? 'P1' : 'P2';

    // Choose the correct state and setter based on the period
    const semesterKey = period === 'P1' ? semesters : semestersP2;
    const setSemesterKey = period === 'P1' ? setSemesters : setSemestersP2;

    // Only allow same-semester movement for 'unique' types
    if (
      type.startsWith('unique') &&
      sourceSemesterId !== destinationSemesterId
    ) {
      return;
    }

    // Clone the source and destination course arrays
    const newSourceCourses = [...semesterKey[sourceSemesterId]];
    const newDestinationCourses =
      sourceSemesterId === destinationSemesterId
        ? newSourceCourses
        : [...(semesterKey[destinationSemesterId] || [])];
    const movedCourse = newSourceCourses[source.index];
    newSourceCourses.splice(source.index, 1);
    newDestinationCourses.splice(destination.index, 0, movedCourse);

    // Update the state for the current period
    setSemesterKey((prev) => ({
      ...prev,
      [sourceSemesterId]: newSourceCourses,
      [destinationSemesterId]: newDestinationCourses,
    }));

    // Synchronize the course across periods if it runs in both '1' and '2'
    if (movedCourse.period.includes('1') && movedCourse.period.includes('2')) {
      const otherPeriodKey = period === 'P1' ? semestersP2 : semesters;
      const setOtherPeriodKey = period === 'P1' ? setSemestersP2 : setSemesters;

      // We need to find the same course in the other period array and move it to the same semester but not necessarily to the same index
      const otherPeriodCourses = otherPeriodKey[sourceSemesterId] || [];
      const otherCourseIndex = otherPeriodCourses.findIndex(
        (course) => course.courseId === movedCourse.courseId
      );
      if (otherCourseIndex !== -1) {
        const newOtherSourceCourses = [...otherPeriodCourses];
        const newOtherDestinationCourses =
          sourceSemesterId === destinationSemesterId
            ? newOtherSourceCourses
            : [...(otherPeriodKey[destinationSemesterId] || [])];
        const otherMovedCourse = newOtherSourceCourses.splice(
          otherCourseIndex,
          1
        )[0];

        // Decide on a suitable index for the course in the new semester
        const appropriateIndex = newOtherDestinationCourses.findIndex(
          (c: any) => c.semester === destinationSemesterId
        );
        newOtherDestinationCourses.splice(
          appropriateIndex === -1
            ? newOtherDestinationCourses.length
            : appropriateIndex,
          0,
          otherMovedCourse
        );

        setOtherPeriodKey((prev) => ({
          ...prev,
          [sourceSemesterId]: newOtherSourceCourses,
          [destinationSemesterId]: newOtherDestinationCourses,
        }));
      }
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragAndDrop}>
      <div className="flex w-full justify-between gap-4 bg-red-500">
        {Object.keys(semesters).map((semester) => (
          <div key={`${semester}-P1`} className="bg-green-500 p-4 w-full">
            <h2>Semester {semester}</h2>
            <Droppable
              droppableId={`${semester}-P1`}
              type={semester === '8' ? `unique-P1` : 'movable-P1'}
            >
              {(provided) => (
                <div
                  className="h-full bg-yellow-400"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {semesters[semester as any].map((course, index) => (
                    <Draggable
                      draggableId={`${course.courseId}-P1`}
                      index={index}
                      key={`${course.courseId}-P1`}
                    >
                      {(provided) => (
                        <div
                          className="bg-blue-500"
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <p className="p-4">{course.courseName}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>

      <div className="flex w-full justify-between gap-4 bg-red-500">
        {Object.keys(semestersP2).map((semester) => (
          <div key={`${semester}-P2`} className="bg-green-500 p-4 w-full">
            <h2>Semester {semester}</h2>
            <Droppable
              droppableId={`${semester}-P2`}
              type={semester === '8' ? `unique-P2` : 'movable-P2'}
            >
              {(provided) => (
                <div
                  className="h-full bg-yellow-400"
                  {...provided.droppableProps}
                  ref={provided.innerRef}
                >
                  {semestersP2[semester as any].map((course, index) => (
                    <Draggable
                      draggableId={`${course.courseId}-P2`}
                      index={index}
                      key={`${course.courseId}-P2`}
                    >
                      {(provided) => (
                        <div
                          className="bg-blue-500"
                          {...provided.dragHandleProps}
                          {...provided.draggableProps}
                          ref={provided.innerRef}
                        >
                          <p className="p-4">{course.courseName}</p>
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
}
