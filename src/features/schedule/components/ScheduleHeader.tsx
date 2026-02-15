'use client'

import React from 'react'
import { useSchedule } from './ScheduleProvider'

import { Badge } from '@/components/ui/badge'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { RefreshCw, Eye, CircleCheck, CircleAlert } from 'lucide-react'
import { useUserEnrollments } from '@/hooks/useUserEnrollments'

interface ScheduleHeaderProps {
  readonly?: boolean
  viewingUserId?: string
  viewingUserName?: string
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
  viewingUserId: _viewingUserId,
  viewingUserName,
}: ScheduleHeaderProps) {
  const { state } = useSchedule()
  const { loading } = state
  const { enrolledCourses, loading: enrollmentsLoading } = useUserEnrollments()

  // Check for course conflicts
  const conflicts = React.useMemo(() => {
    if (enrollmentsLoading || !enrolledCourses) return []

    const conflictList: Array<{
      course1: { id: string; code: string; name: string }
      course2: { id: string; code: string; name: string }
    }> = []

    for (let i = 0; i < enrolledCourses.length; i++) {
      for (let j = i + 1; j < enrolledCourses.length; j++) {
        const course1 = enrolledCourses[i]
        const course2 = enrolledCourses[j]
        if (!course1 || !course2) continue

        // Check for exclusion conflicts
        if (course1.exclusions && course1.exclusions.includes(course2.code)) {
          conflictList.push({
            course1: { id: course1.id, code: course1.code, name: course1.name },
            course2: { id: course2.id, code: course2.code, name: course2.name },
          })
        }
        // Check if course2 excludes course1
        else if (
          course2.exclusions &&
          course2.exclusions.includes(course1.code)
        ) {
          conflictList.push({
            course1: { id: course2.id, code: course2.code, name: course2.name },
            course2: { id: course1.id, code: course1.code, name: course1.name },
          })
        }
      }
    }

    return conflictList
  }, [enrolledCourses, enrollmentsLoading])

  const hasConflicts = conflicts.length > 0

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
              <TooltipContent className="rounded-lg border border-border bg-popover text-foreground shadow-lg backdrop-blur-md">
                {hasConflicts ? (
                  <div className="max-w-xs">
                    <p className="mb-2 font-semibold">
                      Schema-konflikter upptäckta:
                    </p>
                    <ul className="space-y-1 text-sm">
                      {conflicts.map((conflict, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <CircleAlert className="mt-0.5 h-4 w-4 flex-shrink-0 text-red-500" />
                          <div>
                            <span className="font-medium">
                              {conflict.course1.name} ({conflict.course1.code})
                            </span>
                            {' ↔ '}
                            <span className="font-medium">
                              {conflict.course2.name} ({conflict.course2.code})
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
  )
}
