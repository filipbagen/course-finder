import { Course } from '@/app/utilities/types';
import { DropResult } from '@hello-pangea/dnd';
import { SemesterCourses } from '@/app/utilities/types';

export default function useDragAndDrop({
  semesters,
  setSemesters,
  semestersP2,
  setSemestersP2,
}: {
  semesters: SemesterCourses;
  setSemesters: React.Dispatch<React.SetStateAction<SemesterCourses>>;
  semestersP2: SemesterCourses;
  setSemestersP2: React.Dispatch<React.SetStateAction<SemesterCourses>>;
}) {
  const handleDragAndDrop = async (results: DropResult) => {
    const { source, destination, type } = results;

    if (!destination) return; // No valid drop location
    if (
      source.droppableId === destination.droppableId &&
      source.index === destination.index
    ) {
      return; // Dropped in the same place, no action needed
    }

    const sourceSemesterId = parseInt(source.droppableId.split('-')[0], 10);
    const destinationSemesterId = parseInt(
      destination.droppableId.split('-')[0],
      10
    );
    const period = type.endsWith('P1') ? 'P1' : 'P2';

    // Choose the correct state and setter based on the period
    const semesterKey = period === 'P1' ? semesters : semestersP2;
    const setSemesterKey = period === 'P1' ? setSemesters : setSemestersP2;

    // Only allow same-semester movement for 'unique' types
    if (
      type.startsWith('unique') &&
      sourceSemesterId !== destinationSemesterId
    ) {
      return;
    }

    // Clone the source and destination course arrays
    const newSourceCourses = [...semesterKey[sourceSemesterId]];
    const newDestinationCourses =
      sourceSemesterId === destinationSemesterId
        ? newSourceCourses
        : [...(semesterKey[destinationSemesterId] || [])];
    const movedCourse = newSourceCourses[source.index];
    newSourceCourses.splice(source.index, 1);
    newDestinationCourses.splice(destination.index, 0, movedCourse);

    // Update the state for the current period
    setSemesterKey((prev) => ({
      ...prev,
      [sourceSemesterId]: newSourceCourses,
      [destinationSemesterId]: newDestinationCourses,
    }));

    // Synchronize the course across periods if it runs in both '1' and '2'
    if (movedCourse.period.includes(1) && movedCourse.period.includes(2)) {
      const otherPeriodKey = period === 'P1' ? semestersP2 : semesters;
      const setOtherPeriodKey = period === 'P1' ? setSemestersP2 : setSemesters;

      // We need to find the same course in the other period array and move it to the same semester but not necessarily to the same index
      const otherPeriodCourses = otherPeriodKey[sourceSemesterId] || [];
      const otherCourseIndex = otherPeriodCourses.findIndex(
        (course: Course) => course.id === movedCourse.id
      );
      if (otherCourseIndex !== -1) {
        const newOtherSourceCourses = [...otherPeriodCourses];
        const newOtherDestinationCourses =
          sourceSemesterId === destinationSemesterId
            ? newOtherSourceCourses
            : [...(otherPeriodKey[destinationSemesterId] || [])];
        const otherMovedCourse = newOtherSourceCourses.splice(
          otherCourseIndex,
          1
        )[0];

        // Decide on a suitable index for the course in the new semester
        const appropriateIndex = newOtherDestinationCourses.findIndex(
          (c: Course) => c.semester.includes(destinationSemesterId)
        );
        newOtherDestinationCourses.splice(
          appropriateIndex === -1
            ? newOtherDestinationCourses.length
            : appropriateIndex,
          0,
          otherMovedCourse
        );

        setOtherPeriodKey((prev) => ({
          ...prev,
          [sourceSemesterId]: newOtherSourceCourses,
          [destinationSemesterId]: newOtherDestinationCourses,
        }));
      }
    }

    // Update the database with the new semester
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

  return handleDragAndDrop;
}
