'use client';

import React from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, Calendar, Clock, BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Course {
  id: string;
  code: string;
  name: string;
  credits: number;
  mainFieldOfStudy: string[];
  advanced: boolean;
  semester: number[];
  period: number[];
  block: number[];
  campus: string;
  content?: string;
}

interface LandingCourseCardProps {
  course: Course;
  className?: string;
}

/**
 * Landing Course Card Component
 * 
 * A streamlined, informative course card for the landing page carousel.
 * Focuses on the most important course information in a clean design.
 */
export function LandingCourseCard({ course, className }: LandingCourseCardProps) {
  const primaryField = course.mainFieldOfStudy[0] || 'General';
  const semesterText = course.semester.length > 1 
    ? `S${course.semester.join(', ')}`
    : `S${course.semester[0]}`;
  const periodText = course.period.length > 1
    ? `P${course.period.join('+')}`
    : `P${course.period[0]}`;

  return (
    <Card 
      className={cn(
        "h-full transition-all duration-300 hover:shadow-lg hover:scale-[1.02] group cursor-pointer",
        "bg-gradient-to-br from-white to-gray-50/50 dark:from-gray-900 dark:to-gray-800/50",
        "border border-gray-200 dark:border-gray-700",
        className
      )}
    >
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-base leading-tight line-clamp-2 group-hover:text-primary transition-colors">
              {course.name}
            </h3>
            <p className="text-sm font-mono text-muted-foreground mt-1">
              {course.code}
            </p>
          </div>
          <div className="flex flex-col items-end gap-1">
            <Badge 
              variant={course.advanced ? "default" : "secondary"}
              className="text-xs"
            >
              {course.credits} hp
            </Badge>
            {course.advanced && (
              <Badge variant="outline" className="text-xs border-amber-400 text-amber-600">
                Advanced
              </Badge>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0 space-y-3">
        {/* Main Field of Study */}
        <div className="flex items-center gap-2">
          <BookOpen className="h-4 w-4 text-primary flex-shrink-0" />
          <span className="text-sm font-medium text-foreground line-clamp-1">
            {primaryField}
          </span>
          {course.mainFieldOfStudy.length > 1 && (
            <Badge variant="outline" className="text-xs">
              +{course.mainFieldOfStudy.length - 1}
            </Badge>
          )}
        </div>

        {/* Location */}
        <div className="flex items-center gap-2">
          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {course.campus}
          </span>
        </div>

        {/* Schedule Information */}
        <div className="flex items-center justify-between pt-2 border-t border-border">
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {semesterText}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Clock className="h-3 w-3 text-muted-foreground" />
              <span className="text-xs text-muted-foreground">
                {periodText}
              </span>
            </div>
          </div>
          <div className="text-xs text-muted-foreground">
            Block {course.block.join(', ')}
          </div>
        </div>

        {/* Course Content Preview */}
        {course.content && (
          <div className="pt-2">
            <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
              {course.content}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
