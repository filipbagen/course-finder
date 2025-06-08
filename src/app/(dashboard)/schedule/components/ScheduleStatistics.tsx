'use client';

import React from 'react';
import { useSchedule } from './ScheduleProvider';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  BookOpen,
  GraduationCap,
  Clock,
  Target,
  TrendingUp,
  Award,
} from 'lucide-react';
import { ScheduleService } from '../services/scheduleService';
import { CourseWithEnrollment } from '@/types/types';

/**
 * Schedule Statistics Component
 *
 * Displays key metrics and statistics about the schedule.
 * Provides insights into course distribution, credits, and progress.
 *
 * Features:
 * - Course and credit statistics
 * - Progress indicators
 * - Semester breakdown
 * - Visual progress bars
 */
export function ScheduleStatistics() {
  const { state } = useSchedule();
  const { schedule, loading } = state;

  // Define expected totals based on user requirements
  const expectedTotalCredits = 90; // Total credits needed for 3 semesters
  const expectedAdvancedCredits = 60; // Advanced credits needed
  const requiredFieldCredits = 30; // Advanced credits needed in same field for main field

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (loading || !schedule) {
      return null;
    }
    return ScheduleService.calculateStatistics(schedule);
  }, [schedule, loading]);

  // Calculate advanced credits
  const advancedCredits = React.useMemo(() => {
    if (!schedule) return 0;
    let total = 0;
    let allCourses: CourseWithEnrollment[] = [];

    Object.values(schedule).forEach((semesterData) => {
      Object.values(semesterData).forEach((courses) => {
        const courseArray = courses as CourseWithEnrollment[];
        courseArray.forEach((course) => {
          // Avoid counting the same course multiple times
          if (!allCourses.some((c) => c.id === course.id)) {
            if (course.advanced) {
              total += course.credits || 0;
            }
            allCourses.push(course);
          }
        });
      });
    });

    return total;
  }, [schedule]);

  // Calculate advanced credits by field for main field determination
  const advancedCreditsByField = React.useMemo(() => {
    if (!schedule) return {};
    let allCourses: CourseWithEnrollment[] = [];
    const creditCount: { [key: string]: number } = {};

    Object.values(schedule).forEach((semesterData) => {
      Object.values(semesterData).forEach((courses) => {
        const courseArray = courses as CourseWithEnrollment[];
        courseArray.forEach((course) => {
          // Avoid counting the same course multiple times
          if (!allCourses.some((c) => c.id === course.id) && course.advanced) {
            course.mainFieldOfStudy.forEach((field: string) => {
              creditCount[field] = (creditCount[field] || 0) + course.credits;
            });
            allCourses.push(course);
          }
        });
      });
    });

    return creditCount;
  }, [schedule]);

  // Determine main field of study (requires 30+ advanced credits in same field)
  const mainFieldOfStudy = React.useMemo(() => {
    const validFields = Object.entries(advancedCreditsByField).filter(
      ([_, credits]) => credits >= requiredFieldCredits
    );

    if (validFields.length === 0) return null;

    // Return the field with most credits
    const sortedFields = validFields.sort((a, b) => b[1] - a[1]);
    return {
      field: sortedFields[0][0],
      credits: sortedFields[0][1],
    };
  }, [advancedCreditsByField, requiredFieldCredits]);

  const progressPercentage = React.useMemo(() => {
    return stats
      ? Math.min((stats.totalCredits / expectedTotalCredits) * 100, 100)
      : 0;
  }, [stats, expectedTotalCredits]);

  const advancedProgressPercentage = React.useMemo(() => {
    return Math.min((advancedCredits / expectedAdvancedCredits) * 100, 100);
  }, [advancedCredits, expectedAdvancedCredits]);

  // Early return after all hooks are declared
  if (loading || !stats) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-muted rounded w-20" />
              <div className="h-4 w-4 bg-muted rounded" />
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-muted rounded w-16 mb-2" />
              <div className="h-3 bg-muted rounded w-24" />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Total Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Totala poäng</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits} hp</div>
            <p className="text-xs text-muted-foreground">
              av {expectedTotalCredits} hp krävda
            </p>
            <Progress value={progressPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Advanced Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Avancerade poäng
            </CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{advancedCredits} hp</div>
            <p className="text-xs text-muted-foreground">
              av {expectedAdvancedCredits} hp krävda
            </p>
            <Progress value={advancedProgressPercentage} className="mt-2 h-2" />
          </CardContent>
        </Card>

        {/* Main Field of Study */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Huvudområde</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mainFieldOfStudy ? mainFieldOfStudy.field : 'Ej uppfyllt'}
            </div>
            <p className="text-xs text-muted-foreground">
              {mainFieldOfStudy
                ? `${mainFieldOfStudy.credits} hp avancerade poäng`
                : `Behöver ${requiredFieldCredits} hp i samma område`}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
