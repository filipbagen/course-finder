import React from 'react';
import { useDroppable, useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Course } from '@/app/utilities/types';
import CourseCard from '@/app/components/course/CourseCard';
import { SkeletonCard } from '@/app/components/SkeletonComponent';
import { DragItemData } from '@/app/utilities/dnd-types';

interface SemesterBlockProps {
  semester: number;
  courses: Course[];
  period: string; // number?
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  draggable?: boolean;
  loading?: boolean;
}

interface DraggableCourseProps {
  course: Course;
  index: number;
  semester: number;
  period: string; // number?
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
}

const DraggableCourse: React.FC<DraggableCourseProps> = ({
  course,
  index,
  semester,
  period,
  handleUpdateAfterDeletion,
}) => {
  const id = `${course.id}-${period}`;
  const { attributes, listeners, setNodeRef, transform } = useDraggable({
    id,
    data: {
      id,
      courseId: course.id,
      index,
      semesterId: semester,
      period,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    minHeight: 40,
  };

  return (
    <div ref={setNodeRef} style={style}>
      <CourseCard
        variant="schedule"
        course={course}
        handleUpdateAfterDeletion={handleUpdateAfterDeletion}
        dragHandleProps={{ attributes, listeners }}
      />
    </div>
  );
};

const SemesterBlock: React.FC<SemesterBlockProps> = ({
  semester,
  courses,
  period,
  handleUpdateAfterDeletion,
  draggable = true,
  loading = false,
}) => {
  const droppableId = `${semester}-${period}`;
  const { setNodeRef } = useDroppable({
    id: droppableId,
    data: {
      semesterId: semester,
      period,
      index: courses.length, // For placing at end of list
    },
  });

  return (
    <div key={droppableId} className="w-full pt-1">
      <p className="md:hidden text-sm font-medium">Period {period}</p>
      {draggable ? (
        <div
          ref={setNodeRef}
          className="h-max p-4 bg-primary/10 rounded-md flex flex-col gap-4"
        >
          {loading ? (
            <SkeletonCard variant="schedule" />
          ) : courses.length > 0 ? (
            courses.map((course: Course, index: number) => (
              <DraggableCourse
                key={`${course.id}-${period}`}
                course={course}
                index={index}
                semester={semester}
                period={period}
                handleUpdateAfterDeletion={handleUpdateAfterDeletion}
              />
            ))
          ) : (
            <div className="text-center text-ring">Inga kurser inlagda.</div>
          )}
        </div>
      ) : (
        <div
          className="h-max p-4 bg-primary/10 rounded-md flex flex-col gap-4"
          style={{ width: '100%' }}
        >
          {loading ? (
            <SkeletonCard variant="schedule" />
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
};

export default SemesterBlock;
