import { useCallback } from 'react'
import { toast } from 'sonner'

export const useEnrollment = (
  courseName: string,
  handleUpdateAfterDeletion?: (enrollmentId: string) => void,
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
        })
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`)
        }
        toast.success(`Removed ${courseName} from schedule`)
        if (handleUpdateAfterDeletion) {
          handleUpdateAfterDeletion(enrollmentId)
        }
      } catch {
        // Silent error
      }
    },
    [courseName, handleUpdateAfterDeletion],
  )

  const addToEnrollment = useCallback(
    async (courseId: string | bigint, semester: number) => {
      try {
        const response = await fetch('/api/enrollment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ courseId: courseId.toString(), semester }),
        })

        if (!response.ok) {
          const errorData = await response.json()
          if (response.status === 409) {
            if (errorData.error && errorData.error.includes('conflicts with')) {
              // This is an exclusion conflict
              toast.error(errorData.error, {
                duration: 6000,
              })
            } else {
              // Course already added
            }
          } else {
            throw new Error(`Error: ${response.status}`)
          }
          return
        }

        const result = await response.json()

        // Check if the response has the expected structure
        if (
          !result ||
          !result.data ||
          !result.data.enrollment ||
          !result.data.enrollment.id
        ) {
          // Fallback for unexpected response format
          toast.success(`Added ${courseName} to schedule 🎉`)
          return
        }

        const enrollment = result.data

        toast.success(`Added ${courseName} to schedule 🎉`, {
          action: {
            label: 'Ångra',
            onClick: () => deleteEnrollment(enrollment.enrollment.id),
          },
        })
      } catch {
        // Silent error logging
        toast.error('Failed to add course to schedule')
      }
    },
    [courseName, deleteEnrollment],
  )

  return { addToEnrollment, deleteEnrollment }
}
