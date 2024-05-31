import { useCallback } from 'react';
import { toast } from 'sonner';

export const useEnrollment = (
  courseName: string,
  handleUpdateAfterDeletion?: (enrollmentId: string) => void
) => {
  const addToEnrollment = useCallback(
    async (courseId: string, semester: number) => {
      try {
        const response = await fetch('/api/enrollment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId, semester }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const enrollment = await response.json();

        toast.success(`Added ${courseName} to schedule 🎉`, {
          action: {
            label: 'Undo',
            onClick: () => deleteEnrollment(enrollment.enrollment.id),
          },
        });
      } catch (error) {
        console.error(error);
      }
    },
    [courseName]
  );

  const deleteEnrollment = useCallback(
    async (enrollmentId: string) => {
      try {
        const response = await fetch('/api/enrollment', {
          method: 'DELETE',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ enrollmentId }),
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        toast.success(`Removed ${courseName} from schedule`);
        if (handleUpdateAfterDeletion) {
          handleUpdateAfterDeletion(enrollmentId);
        }
      } catch (error) {
        console.error(error);
      }
    },
    [courseName, handleUpdateAfterDeletion]
  );

  return { addToEnrollment, deleteEnrollment };
};
