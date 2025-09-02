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
  Calendar,
  Download,
  Share2,
  Settings,
  MoreHorizontal,
  RefreshCw,
  Eye,
  EyeOff,
} from 'lucide-react';
import { ScheduleActions } from '../types/schedule.types';

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
      </div>
    </div>
  );
}
