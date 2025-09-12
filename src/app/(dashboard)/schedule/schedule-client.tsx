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
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { AuthDebug } from './components/AuthDebug';

/**
 * The main schedule page component.
 *
 * This component displays a grid of courses for each semester and period,
 * allowing users to visualize their course schedule.
 */
export default function ScheduleClient() {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    refreshAuth,
  } = useAuth();
  const [authChecked, setAuthChecked] = useState(false);

  // Wait for auth state to be confirmed before rendering schedule
  useEffect(() => {
    if (!authLoading) {
      setAuthChecked(true);
    }
  }, [authLoading]);

  // Attempt to refresh auth state if it's inconsistent
  useEffect(() => {
    if (authChecked && !authLoading) {
      // If we have a user but isAuthenticated is false, there's an inconsistency
      if (user && !isAuthenticated) {
        console.log('Auth state inconsistency detected, refreshing...');
        refreshAuth();
      }
    }
  }, [authChecked, authLoading, user, isAuthenticated, refreshAuth]);

  // Don't render the schedule until auth state is confirmed
  if (!authChecked || authLoading) {
    return (
      <div className="mb-12 space-y-6">
        <Skeleton className="h-16 w-full mb-6" />
        <Skeleton className="h-24 w-full mb-6" />
        <Skeleton className="h-[600px] w-full" />
      </div>
    );
  }

  // If we don't have a user or not authenticated, show a login message with debug info in development
  if (!isAuthenticated || !user) {
    return (
      <div className="mb-12 space-y-6">
        {process.env.NODE_ENV === 'development' && <AuthDebug />}

        <div className="flex flex-col items-center justify-center py-12">
          <h2 className="text-xl font-semibold mb-4">
            Please log in to view your schedule
          </h2>
          <p className="text-muted-foreground mb-6">
            You need to be logged in to view and manage your course schedule.
          </p>

          <div className="flex gap-4">
            <Button asChild>
              <Link href="/login">Go to Login</Link>
            </Button>

            <Button onClick={() => refreshAuth()} variant="outline">
              Refresh Authentication
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ScheduleProvider>
      <div className="mb-12 space-y-6">
        {process.env.NODE_ENV === 'development' && <AuthDebug />}
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
