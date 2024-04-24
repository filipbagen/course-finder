'use client';
import { useEffect, useState } from 'react';
import {
  DragDropContext,
  Draggable,
  Droppable,
  DropResult,
  DroppableProvided,
} from '@hello-pangea/dnd';
import { reorder, remove, appendAt } from './utils';

export default function Schedule() {
  const [userCourseId, setUserCoursId] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const getCourses = async () => {
    try {
      const response = await fetch('/api/enrollment');

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();

      if (!data.courses) {
        throw new Error('Courses data is missing');
      }

      setUserCoursId(data.courses);
      setLoading(false);
    } catch (error) {
      console.error('Failed to load courses:', error);
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
      const items = reorder(userCourseId, source.index, destination.index);
      setUserCoursId(items);
    } else {
      const srcItems = remove(userCourseId, source.index);
      const destItems = appendAt(
        srcItems,
        destination.index,
        userCourseId[source.index]
      );

      setUserCoursId(destItems);
    }
  }

  return (
    <div className="flex flex-col gap-12">
      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex flex-col gap-8">
          <h5>Period 1</h5>

          <div className="flex justify-between">
            <div className="flex flex-col gap-4 w-64">
              <h6>Termin 7</h6>
              <Droppable key={'1'} droppableId="semester7">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="bg-red-200">
                      <div className="flex flex-col gap-4">
                        {loading ? (
                          <p>Loading...</p>
                        ) : (
                          userCourseId.map((course, index) => (
                            <div key={course.courseId}>
                              <p>{course.courseName}</p>
                            </div>
                            // <Draggable
                            //   key={course.enrollmentId}
                            //   draggableId={course.enrollmentId}
                            //   index={index}
                            // >
                            //   {(provided) => (
                            //     <div
                            //       ref={provided.innerRef}
                            //       {...provided.draggableProps}
                            //       {...provided.dragHandleProps}
                            //       className="w-48 bg-blue-500"
                            //     >
                            //       <p key={course.enrollmentId}>
                            //         {course.courseId}
                            //       </p>
                            //     </div>
                            //   )}
                            // </Draggable>
                          ))
                        )}
                        {provided.placeholder}
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            </div>

            <div className="flex flex-col gap-4 w-64">
              <h6>Termin 8</h6>
              <Droppable key={'2'} droppableId="semester8">
                {(provided) => (
                  <div ref={provided.innerRef} {...provided.droppableProps}>
                    <div className="bg-red-200">
                      <p>Render courses here</p>

                      <div className="flex flex-col gap-4">
                        {/* {courses.slice(2, 4).map((course, index) => (
                          <Draggable
                            key={course.enrollmentId}
                            draggableId={course.enrollmentId}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className="w-48 bg-blue-500"
                              >
                                <p key={course.enrollmentId}>
                                  {course.courseId}
                                </p>
                              </div>
                            )}
                          </Draggable>
                        ))} */}
                        {provided.placeholder}
                      </div>
                    </div>
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </div>
      </DragDropContext>
    </div>
  );
}
