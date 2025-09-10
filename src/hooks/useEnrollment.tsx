import { useCallback } from 'react';
import { toast } from 'sonner';

export const useEnrollment = (
  courseName: string,
  handleUpdateAfterDeletion?: (enrollmentId: string) => void
) => {
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
          const errorData = await response.json();
          if (response.status === 409 && errorData.error) {
            console.log('Already added');
          } else {
            throw new Error(`Error: ${response.status}`);
          }
          return;
        }

        const result = await response.json();
        console.log('Enrollment API response:', result); // Debug log

        // Check if the response has the expected structure
        if (
          !result ||
          !result.data ||
          !result.data.enrollment ||
          !result.data.enrollment.id
        ) {
          console.error('Invalid enrollment response structure:', result);
          toast.success(`Added ${courseName} to schedule 🎉`);
          return;
        }

        const enrollment = result.data;

        toast.success(`Added ${courseName} to schedule 🎉`, {
          action: {
            label: 'Ångra',
            onClick: () => deleteEnrollment(enrollment.enrollment.id),
          },
        });
      } catch (error) {
        console.error('Error in addToEnrollment:', error);
        toast.error('Failed to add course to schedule');
      }
    },
    [courseName, deleteEnrollment]
  );

  return { addToEnrollment, deleteEnrollment };
};
