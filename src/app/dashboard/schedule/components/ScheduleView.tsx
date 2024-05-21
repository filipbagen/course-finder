import React from 'react';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { SemesterCourses } from '@/app/utilities/types';
import { SemesterBlock } from './SemesterBlock';

interface ScheduleViewProps {
  semesters: SemesterCourses;
  semestersP2: SemesterCourses;
  loading: boolean;
  handleUpdateAfterDeletion?: (enrollmentId: string) => void;
  handleDragAndDrop?: OnDragEndResponder;
  draggable?: boolean;
}

const ScheduleView: React.FC<ScheduleViewProps> = ({
  semesters,
  semestersP2,
  loading,
  handleUpdateAfterDeletion,
  handleDragAndDrop,
  draggable = true,
}) => {
  // Ensure at least 3 columns for each period
  const fixedSemesters = [7, 8, 9];

  const renderSemesterBlock = (
    period: string,
    semestersData: SemesterCourses
  ) => (
    <div className="flex flex-col gap-8">
      <p>Period {period}</p>
      <div className="flex w-full justify-between gap-4">
        {fixedSemesters.map((semester) => (
          <SemesterBlock
            key={semester}
            semester={semester}
            courses={semestersData[semester] || []}
            period={period}
            handleUpdateAfterDeletion={handleUpdateAfterDeletion}
            draggable={draggable}
            loading={loading}
          />
        ))}
      </div>
    </div>
  );

  return (
    <>
      <h2>Schedule</h2>
      <div className="flex flex-col gap-12">
        {draggable ? (
          <DragDropContext onDragEnd={handleDragAndDrop || (() => {})}>
            {renderSemesterBlock('1', semesters)}
            {renderSemesterBlock('2', semestersP2)}
          </DragDropContext>
        ) : (
          <>
            {renderSemesterBlock('1', semesters)}
            {renderSemesterBlock('2', semestersP2)}
          </>
        )}
      </div>
    </>
  );
};

export default ScheduleView;
