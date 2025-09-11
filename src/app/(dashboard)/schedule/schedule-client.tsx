'use client';

import React from 'react';
import { ScheduleProvider } from './components/ScheduleProvider';
import { ScheduleContainer } from './components/ScheduleContainer';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleStatistics } from './components/ScheduleStatistics';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Separator } from '@/components/ui/separator';

/**
 * The main schedule page component.
 *
 * This component displays a grid of courses for each semester and period,
 * allowing users to visualize their course schedule.
 */
export default function ScheduleClient() {
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
