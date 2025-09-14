import { CourseWithEnrollment } from '@/types/types';
import { ScheduleData, ScheduleUpdate } from '../types/schedule.types';

/**
 * Schedule Service
 *
 * Handles all API calls related to schedule management.
 */
export class ScheduleService {
  private static readonly BASE_URL = '/api/schedule';

  /**
   * Fetch user's schedule data
   */
  static async fetchSchedule(userId?: string): Promise<ScheduleData> {
    const timestamp = new Date().getTime();
    const url = userId
      ? `${this.BASE_URL}?userId=${userId}&t=${timestamp}`
      : `${this.BASE_URL}?t=${timestamp}`;

    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch schedule: ${response.statusText}`);
    }

    const data = await response.json();
    return this.transformApiResponse(data);
  }

  /**
   * Update course placement in schedule
   */
  static async updateCourseSchedule(
    update: ScheduleUpdate
  ): Promise<CourseWithEnrollment> {
    const { courseId, semester, period } = update;

    const response = await fetch(`${this.BASE_URL}/course`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
      body: JSON.stringify({ courseId, semester, period }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to update course: ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();
    return result.course;
  }

  /**
   * Add course to schedule
   */
  static async addCourseToSchedule(
    courseId: string,
    semester: number,
    period: number
  ): Promise<CourseWithEnrollment> {
    const response = await fetch(`${this.BASE_URL}/course`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
      body: JSON.stringify({ courseId, semester, period }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Failed to add course: ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();
    return result.course;
  }

  /**
   * Remove course from schedule
   */
  static async removeCourseFromSchedule(enrollmentId: string): Promise<any> {
    const encodedId = encodeURIComponent(enrollmentId);
    const response = await fetch(`${this.BASE_URL}/course/${encodedId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-cache',
      },
      credentials: 'include',
    });

    if (!response.ok) {
      if (response.status === 404) {
        return { success: true, alreadyRemoved: true, enrollmentId };
      }
      const errorText = await response.text();
      throw new Error(
        `Failed to remove course: ${response.statusText}. ${errorText}`
      );
    }

    const result = await response.json();
    return result;
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

    const enrollments = data.data ? data.data.enrollments : data.enrollments;

    if (enrollments && Array.isArray(enrollments)) {
      enrollments.forEach((enrollmentData: any) => {
        if (!enrollmentData?.course) return;

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

          // Handle multi-period courses
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
            const period = enrollment.period;
            if (period === 1 || period === 2) {
              const periodKey = `period${period}` as 'period1' | 'period2';
              schedule[semesterKey][periodKey].push(courseWithEnrollment);
            }
          }
        }
      });
    }

    return schedule;
  }
}
