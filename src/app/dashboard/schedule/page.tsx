'use client';

import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import CourseCard from '@/app/components/CourseCard';

export default function Schedule() {
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getCourses = async () => {
    try {
      const response = await fetch('/api/enrollment');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      if (!data.courses) {
        throw new Error('Enrollment data is missing');
      }

      // Group courses by period and semester
      const groupedCourses = data.courses.reduce((acc: any, course: any) => {
        const period = `period${course.period}`;
        const semester = `semester${course.semester}`;
        acc[period] = acc[period] || {};
        acc[period][semester] = acc[period][semester] || [];
        acc[period][semester].push(course);
        return acc;
      }, {});

      setCourses(groupedCourses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      setLoading(false); // Ensure loading is set to false even on error
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  function handleDragDrop(result: DropResult) {
    const { source, destination } = result;
    if (!destination) return;
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return;
    }

    // Extracting periods and semesters from IDs
    const [sourcePeriod, sourceSemester] = source.droppableId.split('-') as any;
    const [destPeriod, destSemester] = destination.droppableId.split(
      '-'
    ) as any;

    // Performing the move
    const sourceCourses = [...courses[sourcePeriod][sourceSemester]];
    const destCourses =
      source.droppableId === destination.droppableId
        ? sourceCourses
        : [...courses[destPeriod][destSemester]];
    const [movedCourse] = sourceCourses.splice(source.index, 1);
    destCourses.splice(destination.index, 0, movedCourse);

    // Updating state
    const newCourses = { ...courses };
    newCourses[sourcePeriod][sourceSemester] = sourceCourses;
    if (source.droppableId !== destination.droppableId) {
      newCourses[destPeriod][destSemester] = destCourses;
    }
    setCourses(newCourses);
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="flex flex-col gap-12">
      <DragDropContext onDragEnd={handleDragDrop}>
        {Object.entries(courses).map(([periodKey, semesters]) => (
          <div key={periodKey}>
            <h3>{periodKey.toUpperCase()}</h3>
            <div className="flex justify-between w-full bg-red-500 p-8">
              {Object.entries(semesters).map(
                ([semesterKey, semesterCourses]: any) => (
                  <div key={semesterKey} className="flex flex-col">
                    <p>{semesterKey.toUpperCase()}</p>
                    <Droppable
                      droppableId={`${periodKey}-${semesterKey}`}
                      type="group"
                    >
                      {(provided) => (
                        <div
                          {...provided.droppableProps}
                          ref={provided.innerRef}
                        >
                          {semesterCourses.map((course: any, index: any) => (
                            <Draggable
                              draggableId={course.courseId}
                              key={course.courseId}
                              index={index}
                            >
                              {(provided) => (
                                <div
                                  {...provided.dragHandleProps}
                                  {...provided.draggableProps}
                                  ref={provided.innerRef}
                                >
                                  <p>{course.courseName}</p>
                                </div>
                              )}
                            </Draggable>
                          ))}
                          {provided.placeholder}
                        </div>
                      )}
                    </Droppable>
                  </div>
                )
              )}
            </div>
          </div>
        ))}
      </DragDropContext>
    </div>
  );
}

{
  /* <div className="w-64 bg-blue-500">
  <Draggable key={1} draggableId={'1'} index={1}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <p>Course 1</p>
      </div>
    )}
  </Draggable>

  <Draggable key={2} draggableId={'2'} index={2}>
    {(provided) => (
      <div
        ref={provided.innerRef}
        {...provided.draggableProps}
        {...provided.dragHandleProps}
      >
        <p>Course 2</p>
      </div>
    )}
  </Draggable>

  {provided.placeholder}
</div>; */
}

// old coed
{
  /* <div className="flex flex-col gap-12">
      <DragDropContext onDragEnd={handleDragEnd}>
        {['1', '2'].map((period) => (
          <div key={period}>
            <h5>Period {period}</h5>

            <div className="flex flex-row bg-blue-500">
              <Droppable key={period} droppableId={period} type="test">
                {(provided) => (
                  <div
                    className="flex justify-between w-full"
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {['7', '8', '9'].map((semester) => (
                      <div key={semester}>
                        <h6>Termin {semester}</h6>

                        <div className="flex flex-col gap-4">
                          {loading ? (
                            <p>Loading...</p>
                          ) : (
                            courses
                              .filter(
                                (course) =>
                                  course.semester.includes(semester) &&
                                  course.period.includes(period)
                              )
                              .map((course, index) => (
                                <Draggable
                                  key={course.courseId}
                                  draggableId={`${course.courseId}-${period}-${semester}`}
                                  index={index}
                                >
                                  {(provided) => (
                                    <div
                                      ref={provided.innerRef}
                                      {...provided.draggableProps}
                                      {...provided.dragHandleProps}
                                    >
                                      <CourseCard course={course} />
                                    </div>
                                  )}
                                </Draggable>
                              ))
                          )}
                          {provided.placeholder}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        ))}
      </DragDropContext>
    </div> */
}
