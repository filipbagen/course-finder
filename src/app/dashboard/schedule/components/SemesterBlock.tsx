import { Course } from '@/app/utilities/types';
import { Draggable, Droppable } from '@hello-pangea/dnd';
import CourseCardSchedule from './CourseCardSchedule';

export const SemesterBlock = ({
  semester,
  courses,
  period,
  handleUpdateAfterDeletion,
}: {
  semester: number;
  courses: Course[];
  period: string;
  handleUpdateAfterDeletion: (enrollmentId: string) => void;
}) => (
  <div key={`${semester}-${period}`} className="w-full">
    <h5 className="mb-4">Semester {semester}</h5>
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
            courses.map((course: any, index: number) => (
              <Draggable
                draggableId={`${course.id}-${period}`}
                index={index}
                key={`${course.id}-${period}`}
              >
                {(provided) => (
                  <div
                    {...provided.dragHandleProps}
                    {...provided.draggableProps}
                    ref={provided.innerRef}
                  >
                    <CourseCardSchedule
                      course={course}
                      handleUpdateAfterDeletion={handleUpdateAfterDeletion}
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
  </div>
);
