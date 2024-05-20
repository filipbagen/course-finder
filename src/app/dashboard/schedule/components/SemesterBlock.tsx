import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Course } from '@/app/utilities/types';
import CourseCard from '@/app/components/CourseCard';

export const SemesterBlock = ({
  semester,
  courses,
  period,
  handleUpdateAfterDeletion,
  draggable,
}: {
  semester: number;
  courses: Course[];
  period: string;
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  draggable?: boolean;
}) => (
  <div key={`${semester}-${period}`} className="w-full">
    <h5 className="mb-4">Semester {semester}</h5>
    {draggable ? (
      <Droppable
        droppableId={`${semester}-${period}`}
        type={semester === 8 ? `unique-${period}` : `movable-${period}`}
      >
        {(provided) => (
          <div
            className="h-max p-4 bg-primary/10 dark:bg-gray-800 rounded-md flex flex-col gap-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {courses.length > 0 ? (
              courses.map((course: Course, index: number) => (
                <Draggable
                  draggableId={`${course.id}-${period}`}
                  index={index}
                  key={`${course.id}-${period}`}
                >
                  {(provided) => (
                    <div
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      style={{
                        minHeight: 40,
                        ...provided.draggableProps.style,
                      }}
                    >
                      <CourseCard
                        variant="schedule"
                        course={course}
                        handleUpdateAfterDeletion={handleUpdateAfterDeletion}
                        dragHandleProps={provided.dragHandleProps}
                      />
                    </div>
                  )}
                </Draggable>
              ))
            ) : (
              <div className="text-center text-gray-500">
                No courses this semester
              </div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ) : (
      <div className="h-max p-4 bg-primary/10 dark:bg-gray-800 rounded-md flex flex-col gap-4">
        {courses.length > 0 ? (
          courses.map((course: Course) => (
            <div key={`${course.id}-${period}`} style={{ minHeight: 40 }}>
              <CourseCard
                variant="user-visit"
                course={course}
                handleUpdateAfterDeletion={handleUpdateAfterDeletion}
              />
            </div>
          ))
        ) : (
          <div className="text-center text-gray-500">
            No courses this semester
          </div>
        )}
      </div>
    )}
  </div>
);
