import { Course, SemesterCourses } from '@/app/utilities/types';
import { DragEndEvent } from '@dnd-kit/core';
import { DragItemData, DropResult } from '@/app/utilities/dnd-types';

interface UseDragAndDropProps {
  semesters: SemesterCourses;
  setSemesters: React.Dispatch<React.SetStateAction<SemesterCourses>>;
  semestersP2: SemesterCourses;
  setSemestersP2: React.Dispatch<React.SetStateAction<SemesterCourses>>;
}

export default function useDragAndDrop({
  semesters,
  setSemesters,
  semestersP2,
  setSemestersP2,
}: UseDragAndDropProps) {
  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;

    if (!active || !over || active.id === over.id) return;

    const activeData = active.data.current as DragItemData;
    const overData = over.data.current as DragItemData;

    // Extract needed information
    const sourceSemesterId = activeData.semesterId;
    const destinationSemesterId = overData.semesterId;
    const sourceIndex = activeData.index;
    const destinationIndex = overData.index;
    const period = activeData.period === '1' ? 'P1' : 'P2';

    const semesterKey = period === 'P1' ? semesters : semestersP2;
    const setSemesterKey = period === 'P1' ? setSemesters : setSemestersP2;

    // Handle special case for semester 8 (unique-period constraint)
    if (sourceSemesterId === 8 && destinationSemesterId !== 8) {
      return;
    }

    const newSourceCourses = [...(semesterKey[sourceSemesterId] || [])];
    const newDestinationCourses =
      sourceSemesterId === destinationSemesterId
        ? newSourceCourses
        : [...(semesterKey[destinationSemesterId] || [])];

    const movedCourse = newSourceCourses[sourceIndex];

    if (!movedCourse) {
      return;
    }

    newSourceCourses.splice(sourceIndex, 1);
    newDestinationCourses.splice(destinationIndex, 0, movedCourse);

    setSemesterKey((prev) => ({
      ...prev,
      [sourceSemesterId]: newSourceCourses,
      [destinationSemesterId]: newDestinationCourses,
    }));

    // Handle courses that span both periods
    if (movedCourse.period.includes(1) && movedCourse.period.includes(2)) {
      const otherPeriodKey = period === 'P1' ? semestersP2 : semesters;
      const setOtherPeriodKey = period === 'P1' ? setSemestersP2 : setSemesters;
      const otherSourceCourses = [...(otherPeriodKey[sourceSemesterId] || [])];
      const otherDestinationCourses = [
        ...(otherPeriodKey[destinationSemesterId] || []),
      ];
      const otherCourseIndex = otherSourceCourses.findIndex(
        (course: Course) => course.id === movedCourse.id
      );

      if (otherCourseIndex !== -1) {
        const otherMovedCourse = otherSourceCourses[otherCourseIndex];
        otherSourceCourses.splice(otherCourseIndex, 1);
        if (
          !otherDestinationCourses.some(
            (course) => course.id === otherMovedCourse.id
          )
        ) {
          otherDestinationCourses.push(otherMovedCourse);
        }

        setOtherPeriodKey((prev) => ({
          ...prev,
          [sourceSemesterId]: otherSourceCourses,
          [destinationSemesterId]: otherDestinationCourses,
        }));
      }
    }

    try {
      const response = await fetch('/api/enrollment/update', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId: movedCourse.id,
          newSemester: destinationSemesterId,
        }),
      });
      if (!response.ok) {
        throw new Error(`Failed to update course semester: ${response.status}`);
      }
    } catch (error) {
      console.error('Error updating course semester:', error);
    }
  };

  return handleDragEnd;
}
