'use client';

import React from 'react';
import { ScheduleProvider } from './components/ScheduleProvider';
import { ScheduleContainer } from './components/ScheduleContainer';
import { ScheduleHeader } from './components/ScheduleHeader';
import { ScheduleStatistics } from './components/ScheduleStatistics';
import { ScheduleGrid } from './components/ScheduleGrid';
import { Separator } from '@/components/ui/separator';

// Define a simplified user type
interface ServerUser {
  id: string;
  name: string | null;
  email: string;
  colorScheme: string;
  isPublic: boolean;
  program: string | null;
  image: string | null;
}

interface ScheduleClientProps {
  serverUser: ServerUser;
}

/**
 * The main schedule page component.
 *
 * This component displays a grid of courses for each semester and period,
 * allowing users to visualize their course schedule.
 */
export default function ScheduleClient({ serverUser }: ScheduleClientProps) {
  // We can now skip all client-side auth checks because server has already verified authentication

  return (
    <ScheduleProvider userId={serverUser.id}>
      <div className="mb-12 space-y-6">
        <ScheduleHeader viewingUserName={serverUser.name || 'User'} />
        <ScheduleContainer>
          <ScheduleStatistics />
          <Separator className="my-6" />
          <ScheduleGrid />
        </ScheduleContainer>
      </div>
    </ScheduleProvider>
  );
}
