'use client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
} from '@hello-pangea/dnd';
import { reorder, remove, appendAt } from './utils';
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

      setCourses(data.courses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load enrollments:', error);
      setLoading(false); // Ensure loading is set to false even on error
    }
  };

  useEffect(() => {
    getCourses();
  }, []);

  function handleDragEnd(result: DropResult) {
    const { source, destination } = result;

    if (!destination) {
      return;
    }

    if (source.droppableId === destination.droppableId) {
      const items = reorder(courses, source.index, destination.index);
      setCourses(items);
    } else {
      const srcItems = remove(courses, source.index);
      const destItems = appendAt(
        srcItems,
        destination.index,
        courses[source.index]
      );

      setCourses(destItems);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      {['1', '2'].map((period) => (
        <DragDropContext key={period} onDragEnd={handleDragEnd}>
          <h5>Period {period}</h5>
          <div className="flex justify-between">
            {['7', '8', '9'].map((semester) => (
              <div key={semester} className="flex flex-col gap-4 w-64">
                <h6>Termin {semester}</h6>
                <Droppable droppableId={`semester${semester}`}>
                  {(provided) => (
                    <div ref={provided.innerRef} {...provided.droppableProps}>
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
                                draggableId={course.courseId}
                                index={index}
                              >
                                {(provided) => (
                                  <div
                                    ref={provided.innerRef}
                                    {...provided.draggableProps}
                                    {...provided.dragHandleProps}
                                    className="w-48"
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
                  )}
                </Droppable>
              </div>
            ))}
          </div>
        </DragDropContext>
      ))}
    </div>
  );
}
