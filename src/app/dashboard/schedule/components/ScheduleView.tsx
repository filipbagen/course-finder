import React from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Course, SemesterCourses } from '@/app/utilities/types';
import Statistics from '../Statistics';
import { SemesterBlock } from './SemesterBlock';

interface ScheduleViewProps {
  courses: Course[];
  semesters: SemesterCourses;
  semestersP2: SemesterCourses;
  loading: boolean;
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  handleDragAndDrop?: any;
  draggable?: boolean;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  courses,
  semesters,
  semestersP2,
  loading,
  handleUpdateAfterDeletion,
  handleDragAndDrop,
  draggable = true,
}) => {
  if (loading) {
    return <div>Loading...</div>;
  }

  // Ensure at least 3 columns for each period
  const fixedSemesters = [7, 8, 9];

  const renderSemesterBlock = (
    period: string,
    semestersData: SemesterCourses
  ) => (
    <div className="flex flex-col gap-8">
      <h5>Period {period}</h5>
      <div className="flex w-full justify-between gap-4">
        {fixedSemesters.map((semester) => (
          <SemesterBlock
            key={semester}
            semester={semester}
            courses={semestersData[semester] || []}
            period={period}
            handleUpdateAfterDeletion={handleUpdateAfterDeletion}
            draggable={draggable}
          />
        ))}
      </div>
    </div>
  );

  return (
    <div className="flex flex-col gap-12">
      <Statistics courses={courses} />
      {draggable ? (
        <DragDropContext onDragEnd={handleDragAndDrop}>
          {renderSemesterBlock('P1', semesters)}
          {renderSemesterBlock('P2', semestersP2)}
        </DragDropContext>
      ) : (
        <>
          {renderSemesterBlock('P1', semesters)}
          {renderSemesterBlock('P2', semestersP2)}
        </>
      )}
    </div>
  );
};

export default ScheduleView;
