import { CourseWithEnrollment } from '@/types/types';
import { ScheduleData, ScheduleUpdate } from '../types/schedule.types';

/**
 * Schedule Service
 *
 * Handles all API calls related to schedule management.
 * Implements the Repository pattern for clean separation of concerns.
 */
export class ScheduleService {
  private static readonly BASE_URL = '/api/schedule';

  /**
   * Fetch user's schedule data
   */
  static async fetchSchedule(userId?: string): Promise<ScheduleData> {
    try {
      const url = userId ? `${this.BASE_URL}?userId=${userId}` : this.BASE_URL;

      // Add cache busting parameter to avoid stale cache issues
      const cacheBuster = `_=${Date.now()}`;
      const finalUrl = `${url}${url.includes('?') ? '&' : '?'}${cacheBuster}`;

      const response = await fetch(finalUrl, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        credentials: 'include',
        // Extend timeout for fetch operations to 8 seconds
        next: { revalidate: 0 },
      });

      if (!response.ok) {
        console.error(
          'Schedule API error:',
          response.status,
          response.statusText
        );

        // Try to get more detailed error information from the response
        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || '';
        } catch (e) {
          // If we can't parse JSON, try to get text
          errorDetails = await response.text();
        }

        throw new Error(
          `Failed to fetch schedule: ${errorDetails || response.statusText}`
        );
      }

      const data = await response.json();
      console.log('Schedule API response:', data);

      // Transform the data to match our ScheduleData interface
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);

      // Provide a more specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('Failed to fetch')) {
          throw new Error(
            'Network error: Could not connect to the server. Please check your internet connection and try again.'
          );
        } else if (
          error.message.includes('Database is temporarily unavailable')
        ) {
          throw new Error(
            'Database connection error: Our systems are experiencing temporary issues. Please try again in a few moments.'
          );
        } else if (error.message.includes('timed out')) {
          throw new Error(
            'Request timed out: The server took too long to respond. Please try again.'
          );
        }

        // Pass through the specific error message
        throw error;
      }

      throw new Error(
        'Failed to load schedule data. Please try refreshing the page.'
      );
    }
  }

  /**
   * Update course placement in schedule
   */
  static async updateCourseSchedule(
    update: ScheduleUpdate
  ): Promise<CourseWithEnrollment> {
    try {
      console.log('Updating course schedule:', update);

      // Create a unique request ID for tracking
      const requestId = Math.random().toString(36).substring(2, 8);

      const response = await fetch(`${this.BASE_URL}/course`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'X-Request-ID': requestId,
        },
        credentials: 'include',
        body: JSON.stringify(update),
      });

      // Handle potential timeout
      const responsePromise = async () => {
        if (!response.ok) {
          const errorBody = await response.text();
          console.error(
            `Update course error (${requestId}):`,
            response.status,
            response.statusText,
            errorBody
          );
          throw new Error(
            `Error updating course schedule: ${response.statusText}. ${errorBody}`
          );
        }
        return await response.json();
      };

      const responseData = await Promise.race([
        responsePromise(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        ),
      ]);

      console.log(`Update course response (${requestId}):`, responseData);
      return responseData as CourseWithEnrollment;
    } catch (error) {
      console.error('Error updating course schedule:', error);

      // Provide a more specific error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          throw new Error(
            'Uppdateringen tog för lång tid. Vänligen försök igen.'
          );
        } else if (error.message.includes('fetch')) {
          throw new Error(
            'Kunde inte ansluta till servern. Kontrollera din internetanslutning.'
          );
        }
      }

      throw new Error('Failed to update course placement');
    }
  }
  /**
   * Add course to schedule
   */
  static async addCourseToSchedule(
    courseId: string,
    semester: number,
    period: number
  ): Promise<CourseWithEnrollment> {
    try {
      const response = await fetch(`${this.BASE_URL}/course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          semester,
          period,
        }),
      });

      if (!response.ok) {
        console.error(
          'Add course error:',
          response.status,
          response.statusText
        );
        throw new Error(`Failed to add course: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error adding course to schedule:', error);
      throw new Error('Failed to add course to schedule');
    }
  }

  /**
   * Remove course from schedule
   */
  static async removeCourseFromSchedule(enrollmentId: string): Promise<void> {
    try {
      // Create a unique request ID for tracking
      const requestId = Math.random().toString(36).substring(2, 8);
      console.log(
        `Removing course ${enrollmentId} from schedule (${requestId})`
      );

      // URL encode the enrollment ID to handle any special characters
      const encodedEnrollmentId = encodeURIComponent(enrollmentId);

      // Add cache-busting timestamp
      const timestamp = Date.now();
      const url = `${this.BASE_URL}/course/${encodedEnrollmentId}?_=${timestamp}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          'X-Request-ID': requestId,
        },
        credentials: 'include',
      });

      // Handle potential timeout with Promise.race
      await Promise.race([
        (async () => {
          if (!response.ok) {
            const errorText = await response.text();
            console.error(
              `Remove course error (${requestId}):`,
              response.status,
              response.statusText,
              errorText
            );
            throw new Error(
              `Failed to remove course: ${response.statusText}. ${errorText}`
            );
          }

          // Only try to parse JSON if there's a content
          if (response.headers.get('content-length') !== '0') {
            const data = await response.json();
            console.log(`Remove course response (${requestId}):`, data);
          } else {
            console.log(
              `Remove course successful (${requestId}) - no content returned`
            );
          }
        })(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        ),
      ]);

      console.log(`Course ${enrollmentId} removed successfully (${requestId})`);
    } catch (error) {
      console.error('Error removing course from schedule:', error);

      // Provide a user-friendly error message based on the error type
      if (error instanceof Error) {
        if (error.message.includes('timed out')) {
          throw new Error(
            'Borttagningen tog för lång tid. Vänligen försök igen eller uppdatera sidan.'
          );
        } else if (error.message.includes('fetch')) {
          throw new Error(
            'Kunde inte ansluta till servern. Kontrollera din internetanslutning.'
          );
        }
      }

      throw new Error('Failed to remove course from schedule');
    }
  }

  /**
   * Transform API response to match our interface
   */
  private static transformApiResponse(data: any): ScheduleData {
    const schedule: ScheduleData = {
      semester7: { period1: [], period2: [] },
      semester8: { period1: [], period2: [] },
      semester9: { period1: [], period2: [] },
    };

    // Group courses by semester and period
    if (
      data &&
      data.data &&
      data.data.enrollments &&
      Array.isArray(data.data.enrollments)
    ) {
      data.data.enrollments.forEach((enrollmentData: any) => {
        if (!enrollmentData || !enrollmentData.course) {
          console.warn(
            'Missing course data in enrollment:',
            enrollmentData?.id
          );
          return;
        }

        const course = enrollmentData.course;
        const enrollment = {
          id: enrollmentData.id,
          semester: enrollmentData.semester,
          period: enrollmentData.period || 1,
          userId: enrollmentData.userId,
          courseId: enrollmentData.course.id,
          status: enrollmentData.status || 'enrolled',
          grade: enrollmentData.grade || null,
          enrolledAt: enrollmentData.enrolledAt || new Date(),
        };

        const semester = enrollment.semester;

        if (semester >= 7 && semester <= 9) {
          const semesterKey = `semester${semester}` as keyof ScheduleData;

          const courseWithEnrollment: CourseWithEnrollment = {
            ...course,
            enrollment,
          };

          // Handle multi-period courses: if course.period includes multiple periods,
          // show the course in all those periods
          if (course.period && Array.isArray(course.period)) {
            course.period.forEach((coursePeriod: number) => {
              if (coursePeriod === 1 || coursePeriod === 2) {
                const periodKey = `period${coursePeriod}` as
                  | 'period1'
                  | 'period2';
                schedule[semesterKey][periodKey].push(courseWithEnrollment);
              }
            });
          } else {
            // Fallback: use enrollment period if course.period is not available
            const period = enrollment.period;
            if (period === 1 || period === 2) {
              const periodKey = `period${period}` as 'period1' | 'period2';
              schedule[semesterKey][periodKey].push(courseWithEnrollment);
            }
          }
        }
      });
    } else {
      console.warn('Invalid API response format:', data);
    }

    return schedule;
  }
  /**
   * Calculate schedule statistics
   */
  static calculateStatistics(schedule: ScheduleData) {
    let totalCourses = 0;
    let totalCredits = 0;
    let coursesPerSemester = { 7: 0, 8: 0, 9: 0 };
    let creditsPerSemester = { 7: 0, 8: 0, 9: 0 };
    let allCourses: CourseWithEnrollment[] = [];

    Object.entries(schedule).forEach(([semesterKey, semesterData]) => {
      const semester = parseInt(semesterKey.replace('semester', '')) as
        | 7
        | 8
        | 9;

      Object.values(semesterData).forEach((courses) => {
        const courseArray = courses as CourseWithEnrollment[];
        courseArray.forEach((course) => {
          // Avoid counting the same course multiple times (for multi-period courses)
          if (!allCourses.some((c) => c.id === course.id)) {
            totalCourses++;
            totalCredits += Number(course.credits) || 0;
            allCourses.push(course);
          }
          coursesPerSemester[semester]++;
          creditsPerSemester[semester] += Number(course.credits) || 0;
        });
      });
    });

    // Calculate main field of study based on credits
    const creditCount = allCourses.reduce(
      (acc: { [key: string]: number }, course) => {
        course.mainFieldOfStudy.forEach((field) => {
          acc[field] = (acc[field] || 0) + Number(course.credits);
        });
        return acc;
      },
      {}
    );

    const maxCredits = Math.max(...Object.values(creditCount));
    const topFieldsOfStudy = Object.keys(creditCount).filter(
      (field) => creditCount[field] === maxCredits
    );

    return {
      totalCourses,
      totalCredits,
      coursesPerSemester,
      creditsPerSemester,
      averageCreditsPerSemester: totalCredits / 3,
      topFieldsOfStudy,
      creditsByField: creditCount,
    };
  }
}
