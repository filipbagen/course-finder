'use client';

import React from 'react';
import { useSchedule } from './ScheduleProvider';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Calendar,
  Download,
  Share2,
  Settings,
  MoreHorizontal,
  RefreshCw,
  Eye,
  EyeOff,
  CircleCheck,
  CircleAlert,
} from 'lucide-react';
import { useUserEnrollments } from '@/hooks/useUserEnrollments';

interface ScheduleHeaderProps {
  readonly?: boolean;
  viewingUserId?: string;
  viewingUserName?: string;
}

/**
 * Schedule Header Component
 *
 * Displays the page header with title, and actions.
 * Provides context-aware actions based on readonly state.
 *
 * Features:
 * - Schedule actions (export, share, settings)
 * - Loading state handling
 * - User context for viewing other schedules
 */
export function ScheduleHeader({
  readonly = false,
  viewingUserId,
  viewingUserName,
}: ScheduleHeaderProps) {
  const { state } = useSchedule();
  const { loading } = state;
  const { enrolledCourses, loading: enrollmentsLoading } = useUserEnrollments();

  // Check for course conflicts
  const conflicts = React.useMemo(() => {
    if (enrollmentsLoading || !enrolledCourses) return [];

    const conflictList: Array<{
      course1: { id: string; code: string; name: string };
      course2: { id: string; code: string; name: string };
      type: 'exclusion' | 'scheduling';
    }> = [];

    // Helper function to check if two arrays have common elements
    const hasOverlap = (arr1: number[], arr2: number[]): boolean => {
      return arr1.some((item) => arr2.includes(item));
    };

    for (let i = 0; i < enrolledCourses.length; i++) {
      for (let j = i + 1; j < enrolledCourses.length; j++) {
        const course1 = enrolledCourses[i];
        const course2 = enrolledCourses[j];

        // Check for exclusion conflicts
        if (course1.exclusions && course1.exclusions.includes(course2.code)) {
          conflictList.push({
            course1: { id: course1.id, code: course1.code, name: course1.name },
            course2: { id: course2.id, code: course2.code, name: course2.name },
            type: 'exclusion',
          });
        }
        // Check if course2 excludes course1
        else if (
          course2.exclusions &&
          course2.exclusions.includes(course1.code)
        ) {
          conflictList.push({
            course1: { id: course2.id, code: course2.code, name: course2.name },
            course2: { id: course1.id, code: course1.code, name: course1.name },
            type: 'exclusion',
          });
        }
        // Check for scheduling conflicts (same block, semester, and period)
        else if (
          hasOverlap(course1.semester, course2.semester) &&
          hasOverlap(course1.period, course2.period) &&
          hasOverlap(course1.block, course2.block)
        ) {
          conflictList.push({
            course1: { id: course1.id, code: course1.code, name: course1.name },
            course2: { id: course2.id, code: course2.code, name: course2.name },
            type: 'scheduling',
          });
        }
      }
    }

    return conflictList;
  }, [enrolledCourses, enrollmentsLoading]);

  const hasConflicts = conflicts.length > 0;

  return (
    <div className="space-y-4">
      {/* Header Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            {/* <Calendar className="h-8 w-8 text-primary" /> */}
            <div className="px-2">
              <h1 className="text-3xl font-bold tracking-tight">
                {readonly && viewingUserName
                  ? `${viewingUserName}s schema`
                  : 'Mitt schema'}
              </h1>
              <p className="text-muted-foreground">
                {readonly
                  ? 'Visa studentens kurser och framsteg'
                  : 'Planera och hantera din akademiska resa'}
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {readonly && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                Endast visning
              </Badge>
            )}

            {loading && (
              <Badge variant="outline" className="gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Laddar
              </Badge>
            )}
          </div>
        </div>

        {/* Schedule Status Icon */}
        {!readonly && !enrollmentsLoading && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <div className="flex items-center">
                  {hasConflicts ? (
                    <CircleAlert className="h-6 w-6 text-red-500" />
                  ) : (
                    <CircleCheck className="h-6 w-6 text-green-500" />
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent className="backdrop-blur-md bg-white/80 border border-gray-200 rounded-lg shadow-lg">
                {hasConflicts ? (
                  <div className="max-w-xs">
                    <p className="font-semibold mb-2">
                      Schema-konflikter upptäckta:
                    </p>
                    <ul className="space-y-1 text-sm">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CircleAlert className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                          <div>
                            <span className="font-medium">
                              {conflict.course1.name} ({conflict.course1.code})
                            </span>
                            {' ↔ '}
                            <span className="font-medium">
                              {conflict.course2.name} ({conflict.course2.code})
                            </span>
                            <br />
                            <span className="text-xs text-muted-foreground">
                              {conflict.type === 'exclusion'
                                ? 'Kursuteslutning'
                                : 'Samma block, termin och period'}
                            </span>
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <p>Inga konflikter i ditt schema</p>
                )}
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    </div>
  );
}
