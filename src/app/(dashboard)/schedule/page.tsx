'use client';

import React from 'react';
import { ScheduleProvider } from './components/ScheduleProvider';
import { ScheduleContainer } from './components/ScheduleContainer';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleStatistics } from './components/ScheduleStatistics';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Separator } from '@/components/ui/separator';

/**
 * Schedule Page Component
 *
 * Main schedule page that displays a 2x3 grid of courses organized by:
 * - Rows: Period 1 and Period 2
 * - Columns: Semester 7, 8, and 9
 *
 * Features:
 * - Drag and drop functionality using dnd-kit
 * - Real-time updates with optimistic UI
 * - Responsive design for mobile and desktop
 * - SOLID principles for maintainability
 * - Reusable components for other views
 */
export default function SchedulePage() {
  return (
    <ScheduleProvider>
      <div className="flex flex-col gap-8">
        <ScheduleHeader />
        <ScheduleStatistics />
        <Separator />
        <ScheduleContainer>
          <ScheduleGrid />
        </ScheduleContainer>
      </div>
    </ScheduleProvider>
  );
}
