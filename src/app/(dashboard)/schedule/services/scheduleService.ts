
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
      const url = userId 
        ? `${this.BASE_URL}?userId=${userId}` 
        : this.BASE_URL;
      
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.statusText}`);
      }

      const data = await response.json();
      
      // Transform the data to match our ScheduleData interface
      return this.transformApiResponse(data);
    } catch (error) {
      console.error('Error fetching schedule:', error);
      throw new Error('Failed to load schedule data');
    }
  }

  /**
   * Update course placement in schedule
   */
  static async updateCourseSchedule(update: ScheduleUpdate): Promise<CourseWithEnrollment> {
    try {
      const response = await fetch(`${this.BASE_URL}/course`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(update),
      });

      if (!response.ok) {
        throw new Error(`Failed to update course: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error updating course schedule:', error);
      throw new Error('Failed to update course placement');
    }
  }

  /**
   * Add course to schedule
   */
  static async addCourseToSchedule(courseId: string, semester: number, period: number): Promise<CourseWithEnrollment> {
    try {
      const response = await fetch(`${this.BASE_URL}/course`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          courseId,
          semester,
          period,
        }),
      });

      if (!response.ok) {
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
      const response = await fetch(`${this.BASE_URL}/course/${enrollmentId}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Failed to remove course: ${response.statusText}`);
      }
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
    if (data.enrollments && Array.isArray(data.enrollments)) {
      data.enrollments.forEach((enrollmentData: any) => {
        const course = enrollmentData.course;
        const enrollment = {
          id: enrollmentData.id,
          semester: enrollmentData.semester,
          period: enrollmentData.period,
          status: enrollmentData.status,
          grade: enrollmentData.grade,
          enrolledAt: enrollmentData.enrolledAt,
        };
        
        const semester = enrollment.semester;
        const period = enrollment.period;

        if (semester >= 7 && semester <= 9 && (period === 1 || period === 2)) {
          const semesterKey = `semester${semester}` as keyof ScheduleData;
          const periodKey = `period${period}` as 'period1' | 'period2';
          
          const courseWithEnrollment: CourseWithEnrollment = {
            ...course,
            enrollment,
          };
          
          schedule[semesterKey][periodKey].push(courseWithEnrollment);
        }
      });
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

    Object.entries(schedule).forEach(([semesterKey, semesterData]) => {
      const semester = parseInt(semesterKey.replace('semester', '')) as 7 | 8 | 9;
      
      Object.values(semesterData).forEach((courses) => {
        const courseArray = courses as CourseWithEnrollment[];
        courseArray.forEach((course) => {
          totalCourses++;
          totalCredits += course.credits || 0;
          coursesPerSemester[semester]++;
          creditsPerSemester[semester] += course.credits || 0;
        });
      });
    });

    return {
      totalCourses,
      totalCredits,
      coursesPerSemester,
      creditsPerSemester,
      averageCreditsPerSemester: totalCredits / 3,
    };
  }
}
