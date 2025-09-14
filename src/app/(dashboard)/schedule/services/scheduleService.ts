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
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const url = userId
        ? `${this.BASE_URL}?userId=${userId}&t=${timestamp}`
        : `${this.BASE_URL}?t=${timestamp}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        console.error(
          'Schedule API error:',
          response.status,
          response.statusText
        );

        let errorDetails = '';
        try {
          const errorData = await response.json();
          errorDetails = errorData.message || errorData.error || '';
        } catch (e) {
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

      if (error instanceof Error) {
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
      console.log('ScheduleService: Updating course schedule:', update);

      // Even though we send the period, the API will ignore it and use the course's actual period
      // We're just keeping the interface consistent for the frontend
      const { courseId, semester, period } = update;

      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const response = await fetch(`${this.BASE_URL}/course?t=${timestamp}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        credentials: 'include',
        body: JSON.stringify({ courseId, semester, period }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorBody = await response.text();
        console.error(
          `Update course error:`,
          response.status,
          response.statusText,
          errorBody
        );
        throw new Error(
          `Error updating course schedule: ${response.statusText}. ${errorBody}`
        );
      }

      const responseData = await response.json();
      console.log(`ScheduleService: Update course response:`, responseData);
      return responseData.data || (responseData.course as CourseWithEnrollment);
    } catch (error) {
      console.error('Error updating course schedule:', error);
      throw new Error('Failed to update course placement');
    }
  }
  /**
   * Add course to schedule
   */
  static async addCourseToSchedule(
    courseId: string,
    semester: number,
    period: number[]
  ): Promise<CourseWithEnrollment> {
    try {
      const timestamp = new Date().getTime(); // Add timestamp to prevent caching
      const response = await fetch(`${this.BASE_URL}/course?t=${timestamp}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        credentials: 'include',
        body: JSON.stringify({
          courseId,
          semester,
          period,
        }),
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          'Add course error:',
          response.status,
          response.statusText,
          errorText
        );
        throw new Error(
          `Failed to add course: ${response.statusText}. ${errorText}`
        );
      }

      const result = await response.json();
      console.log('Add course response:', result);
      return result.data || result.course;
    } catch (error) {
      console.error('Error adding course to schedule:', error);
      throw new Error('Failed to add course to schedule');
    }
  }

  /**
   * Remove course from schedule
   */
  static async removeCourseFromSchedule(enrollmentId: string): Promise<any> {
    try {
      console.log(
        `ScheduleService: Removing course ${enrollmentId} from schedule`
      );

      // URL encode the enrollment ID to handle any special characters
      const encodedEnrollmentId = encodeURIComponent(enrollmentId);
      const url = `${this.BASE_URL}/course/${encodedEnrollmentId}`;

      const response = await fetch(url, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
          Expires: '0',
        },
        credentials: 'include',
        cache: 'no-store',
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(
          `Remove course error:`,
          response.status,
          response.statusText,
          errorText
        );

        // Special handling for 404 errors which might mean the course was already deleted
        if (response.status === 404) {
          console.warn(
            `Course ${enrollmentId} not found, may have been already removed`
          );
          return { success: true, alreadyRemoved: true, enrollmentId };
        }

        throw new Error(
          `Failed to remove course: ${response.statusText}. ${errorText}`
        );
      }

      const result = await response.json();
      console.log(`Course ${enrollmentId} removed successfully:`, result);
      return result.data || result;
    } catch (error) {
      console.error('Error removing course from schedule:', error);
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
      ((data.data &&
        data.data.enrollments &&
        Array.isArray(data.data.enrollments)) ||
        (data.enrollments && Array.isArray(data.enrollments)))
    ) {
      const enrollments = data.data ? data.data.enrollments : data.enrollments;
      enrollments.forEach((enrollmentData: any) => {
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
          period: Array.isArray(enrollmentData.period)
            ? enrollmentData.period
            : [enrollmentData.period || 1],
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
            const enrollmentPeriod = enrollment.period;
            if (Array.isArray(enrollmentPeriod)) {
              enrollmentPeriod.forEach((period: number) => {
                if (period === 1 || period === 2) {
                  const periodKey = `period${period}` as 'period1' | 'period2';
                  schedule[semesterKey][periodKey].push(courseWithEnrollment);
                }
              });
            } else if (enrollmentPeriod === 1 || enrollmentPeriod === 2) {
              const periodKey = `period${enrollmentPeriod}` as
                | 'period1'
                | 'period2';
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
