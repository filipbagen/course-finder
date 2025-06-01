
'use client';

import React from 'react';
import { useSchedule } from './ScheduleProvider';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
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
  EyeOff
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
 * Displays the page header with breadcrumbs, title, and actions.
 * Provides context-aware actions based on readonly state.
 * 
 * Features:
 * - Breadcrumb navigation
 * - Schedule actions (export, share, settings)
 * - Loading state handling
 * - User context for viewing other schedules
 */
export function ScheduleHeader({ 
  readonly = false, 
  viewingUserId,
  viewingUserName 
}: ScheduleHeaderProps) {
  const { state, dispatch } = useSchedule();
  const { loading, lastUpdated } = state;

  // Handle refresh
  const handleRefresh = () => {
    dispatch({ type: ScheduleActions.FETCH_SCHEDULE_START });
    // The actual fetch will be handled by the provider
  };

  // Handle export
  const handleExport = () => {
    // TODO: Implement schedule export (PDF, CSV, etc.)
    console.log('Export schedule');
  };

  // Handle share
  const handleShare = () => {
    // TODO: Implement schedule sharing
    console.log('Share schedule');
  };

  // Handle settings
  const handleSettings = () => {
    // TODO: Navigate to schedule settings
    console.log('Schedule settings');
  };

  // Toggle readonly mode (for testing)
  const handleToggleReadonly = () => {
    // This would typically be handled at a higher level
    console.log('Toggle readonly mode');
  };

  return (
    <div className="space-y-4">
      {/* Breadcrumbs */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard">Dashboard</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          {readonly && viewingUserName ? (
            <>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard/students">Students</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>{viewingUserName}'s Schedule</BreadcrumbPage>
              </BreadcrumbItem>
            </>
          ) : (
            <BreadcrumbItem>
              <BreadcrumbPage>My Schedule</BreadcrumbPage>
            </BreadcrumbItem>
          )}
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header Content */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Calendar className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                {readonly && viewingUserName 
                  ? `${viewingUserName}'s Schedule`
                  : 'My Schedule'
                }
              </h1>
              <p className="text-muted-foreground">
                {readonly 
                  ? 'View student course schedule and progress'
                  : 'Plan and manage your academic journey'
                }
              </p>
            </div>
          </div>

          {/* Status Indicators */}
          <div className="flex items-center gap-2">
            {readonly && (
              <Badge variant="secondary" className="gap-1">
                <Eye className="h-3 w-3" />
                View Only
              </Badge>
            )}
            
            {loading && (
              <Badge variant="outline" className="gap-1">
                <RefreshCw className="h-3 w-3 animate-spin" />
                Loading
              </Badge>
            )}

            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Last updated: {new Date(lastUpdated).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {/* Refresh Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleRefresh}
            disabled={loading}
            className="gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>

          {/* Primary Actions */}
          {!readonly && (
            <>
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="gap-2"
              >
                <Download className="h-4 w-4" />
                Export
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={handleShare}
                className="gap-2"
              >
                <Share2 className="h-4 w-4" />
                Share
              </Button>
            </>
          )}

          {/* More Actions Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {!readonly && (
                <>
                  <DropdownMenuItem onClick={handleSettings}>
                    <Settings className="h-4 w-4 mr-2" />
                    Schedule Settings
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                </>
              )}
              
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as PDF
              </DropdownMenuItem>
              
              <DropdownMenuItem onClick={handleExport}>
                <Download className="h-4 w-4 mr-2" />
                Export as CSV
              </DropdownMenuItem>

              {!readonly && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleShare}>
                    <Share2 className="h-4 w-4 mr-2" />
                    Share Schedule
                  </DropdownMenuItem>
                </>
              )}

              {/* Development/Debug Actions */}
              {process.env.NODE_ENV === 'development' && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleToggleReadonly}>
                    {readonly ? (
                      <>
                        <EyeOff className="h-4 w-4 mr-2" />
                        Enable Editing
                      </>
                    ) : (
                      <>
                        <Eye className="h-4 w-4 mr-2" />
                        View Only Mode
                      </>
                    )}
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}
