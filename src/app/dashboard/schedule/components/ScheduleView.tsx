import React from 'react';
import { DragDropContext, OnDragEndResponder } from '@hello-pangea/dnd';
import { SemesterCourses } from '@/app/utilities/types';
import SemesterBlock from './SemesterBlock';

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
  const fixedSemesters = [7, 8, 9];

  const renderSemesterBlock = (
    period: string,
    semestersData: SemesterCourses
  ) => (
    <div className="flex flex-col gap-8">
      <p>Period {period}</p>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {fixedSemesters.map((semester) => (
          <div key={semester} className="w-full">
            <h5 className="hidden md:block mb-2">Termin {semester}</h5>
            <SemesterBlock
              semester={semester}
              courses={semestersData[semester] || []}
              period={period}
              handleUpdateAfterDeletion={handleUpdateAfterDeletion}
              draggable={draggable}
              loading={loading}
            />
          </div>
        ))}
      </div>
    </div>
  );

  const renderMobileView = () => (
    <div className="flex flex-col gap-4">
      {fixedSemesters.flatMap((semester) => [
        <div key={`1-${semester}`} className="flex flex-col gap-2">
          <h5 className="text-lg font-semibold">Termin {semester}</h5>
          <SemesterBlock
            semester={semester}
            courses={semesters[semester] || []}
            period="1"
            handleUpdateAfterDeletion={handleUpdateAfterDeletion}
            draggable={draggable}
            loading={loading}
          />
        </div>,
        <div key={`2-${semester}`} className="flex flex-col gap-2">
          <SemesterBlock
            semester={semester}
            courses={semestersP2[semester] || []}
            period="2"
            handleUpdateAfterDeletion={handleUpdateAfterDeletion}
            draggable={draggable}
            loading={loading}
          />
        </div>,
      ])}
    </div>
  );

  return (
    <>
      <h2>Schema</h2>
      <div className="flex flex-col gap-12">
        {draggable ? (
          <>
            <div className="hidden md:block">
              <DragDropContext onDragEnd={handleDragAndDrop || (() => {})}>
                {renderSemesterBlock('1', semesters)}
                {renderSemesterBlock('2', semestersP2)}
              </DragDropContext>
            </div>
            <div className="block md:hidden">
              <DragDropContext onDragEnd={handleDragAndDrop || (() => {})}>
                {renderMobileView()}
              </DragDropContext>
            </div>
          </>
        ) : (
          <>
            <div className="hidden md:block">
              {renderSemesterBlock('1', semesters)}
              {renderSemesterBlock('2', semestersP2)}
            </div>
            <div className="block md:hidden">{renderMobileView()}</div>
          </>
        )}
      </div>
    </>
  );
};

export default ScheduleView;
