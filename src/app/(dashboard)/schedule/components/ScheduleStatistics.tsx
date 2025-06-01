
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
  Award
} from 'lucide-react';
import { ScheduleService } from '../services/scheduleService';

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

  // Calculate statistics
  const stats = React.useMemo(() => {
    if (loading || !schedule) {
      return null;
    }
    return ScheduleService.calculateStatistics(schedule);
  }, [schedule, loading]);

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

  // Define expected totals (these could come from program requirements)
  const expectedTotalCredits = 180; // Example total credits needed
  const expectedCoursesPerSemester = 5; // Example courses per semester
  const progressPercentage = Math.min((stats.totalCredits / expectedTotalCredits) * 100, 100);

  return (
    <div className="space-y-6">
      {/* Main Statistics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Total Courses */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              Across 3 semesters
            </p>
          </CardContent>
        </Card>

        {/* Total Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCredits}</div>
            <p className="text-xs text-muted-foreground">
              of {expectedTotalCredits} required
            </p>
            <Progress 
              value={progressPercentage} 
              className="mt-2 h-2"
            />
          </CardContent>
        </Card>

        {/* Average Credits */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Credits/Semester</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.averageCreditsPerSemester.toFixed(1)}
            </div>
            <p className="text-xs text-muted-foreground">
              Recommended: 15-18
            </p>
          </CardContent>
        </Card>

        {/* Progress */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Progress</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{progressPercentage.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">
              Program completion
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Semester Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Semester Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            {[7, 8, 9].map(semester => {
              const semesterCourses = stats.coursesPerSemester[semester as keyof typeof stats.coursesPerSemester];
              const semesterCredits = stats.creditsPerSemester[semester as keyof typeof stats.creditsPerSemester];
              const isLightLoad = semesterCredits < 12;
              const isHeavyLoad = semesterCredits > 18;

              return (
                <div key={semester} className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">Semester {semester}</h4>
                    <div className="flex gap-2">
                      {isLightLoad && (
                        <Badge variant="outline" className="text-yellow-600">
                          Light Load
                        </Badge>
                      )}
                      {isHeavyLoad && (
                        <Badge variant="outline" className="text-red-600">
                          Heavy Load
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Courses:</span>
                      <span className="font-medium">{semesterCourses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Credits:</span>
                      <span className="font-medium">{semesterCredits}</span>
                    </div>
                  </div>

                  {/* Credit distribution bar */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Credit Load</span>
                      <span>{semesterCredits}/20</span>
                    </div>
                    <Progress 
                      value={(semesterCredits / 20) * 100} 
                      className="h-2"
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Course Distribution by Period */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Award className="h-5 w-5" />
            Course Distribution
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {[1, 2].map(period => {
              const periodCourses = Object.values(schedule).reduce((total, semester) => {
                const periodKey = `period${period}` as 'period1' | 'period2';
                return total + semester[periodKey].length;
              }, 0);

              return (
                <div key={period} className="space-y-3">
                  <h4 className="font-medium">Period {period}</h4>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Total Courses:</span>
                      <span className="font-medium">{periodCourses}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Avg per Semester:</span>
                      <span className="font-medium">{(periodCourses / 3).toFixed(1)}</span>
                    </div>
                  </div>
                  <Progress 
                    value={(periodCourses / stats.totalCourses) * 100} 
                    className="h-2"
                  />
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
