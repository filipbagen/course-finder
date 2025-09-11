'use client';

import React, { useEffect, useState } from 'react';
import { ScheduleProvider } from './components/ScheduleProvider';
import { ScheduleContainer } from './components/ScheduleContainer';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleStatistics } from './components/ScheduleStatistics';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Separator } from '@/components/ui/separator';
import { useAuth } from '@/components/providers/AuthProvider';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * The main schedule page component.
 *
 * This component displays a grid of courses for each semester and period,
 * allowing users to visualize their course schedule.
 */
export default function ScheduleClient() {
  const { user, loading: authLoading } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for auth state to be confirmed before rendering schedule
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true);
    }
  }, [authLoading]);

  // Don't render the schedule until auth state is confirmed
  if (!authChecked) {
    return (
      <div className="mb-12 space-y-6">
        <Skeleton className="h-16 w-full mb-6" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  return (
    <ScheduleProvider>
      <div className="mb-12 space-y-6">
        <ScheduleHeader />
        <ScheduleContainer>
          <ScheduleStatistics />
          <Separator className="my-6" />
          <ScheduleGrid />
        </ScheduleContainer>
      </div>
    </ScheduleProvider>
  );
}
