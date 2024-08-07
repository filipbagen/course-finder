import React from 'react';
import { Droppable, Draggable } from '@hello-pangea/dnd';
import { Course } from '@/app/utilities/types';
import CourseCard from '@/app/components/course/CourseCard';
import { SkeletonCard } from '@/app/components/SkeletonComponent';

interface SemesterBlockProps {
  semester: number;
  courses: Course[];
  period: string;
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  draggable?: boolean;
  loading?: boolean;
}

const SemesterBlock: React.FC<SemesterBlockProps> = ({
  semester,
  courses,
  period,
  handleUpdateAfterDeletion,
  draggable = true,
  loading = false,
}) => (
  <div key={`${semester}-${period}`} className="w-full pt-1">
    <p className="md:hidden text-sm font-medium">Period {period}</p>
    {draggable ? (
      <Droppable
        droppableId={`${semester}-${period}`}
        type={semester === 8 ? `unique-${period}` : `movable-${period}`}
      >
        {(provided) => (
          <div
            className="h-max p-4 bg-primary/10 rounded-md flex flex-col gap-4"
            {...provided.droppableProps}
            ref={provided.innerRef}
          >
            {loading ? (
              <SkeletonCard variant="schedule" /> // Render one skeleton card per semester and period
            ) : courses.length > 0 ? (
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
              <div className="text-center text-ring">Inga kurser inlagda.</div>
            )}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    ) : (
      <div
        className="h-max p-4 bg-primary/10 rounded-md flex flex-col gap-4"
        style={{ width: '100%' }}
      >
        {loading ? (
          <SkeletonCard variant="schedule" /> // Render one skeleton card per semester and period
        ) : courses.length > 0 ? (
          courses.map((course: Course) => (
            <div key={`${course.id}-${period}`}>
              <CourseCard
                variant="user-visit"
                course={course}
                handleUpdateAfterDeletion={handleUpdateAfterDeletion}
              />
            </div>
          ))
        ) : (
          <div className="text-center text-ring">Inga kurser inlagda.</div>
        )}
      </div>
    )}
  </div>
);

export default SemesterBlock;
