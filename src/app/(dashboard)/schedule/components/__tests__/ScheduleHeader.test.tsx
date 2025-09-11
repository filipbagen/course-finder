import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import { ScheduleHeader } from './ScheduleHeader';

// Mock the hooks
jest.mock('./ScheduleProvider', () => ({
  useSchedule: () => ({
    state: { loading: false },
  }),
}));

jest.mock('@/hooks/useUserEnrollments', () => ({
  useUserEnrollments: jest.fn(),
}));

// Mock the tooltip components
jest.mock('@/components/ui/tooltip', () => ({
  TooltipProvider: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  Tooltip: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
  TooltipContent: ({ children }: { children: React.ReactNode }) => (
    <>{children}</>
  ),
}));

// Mock lucide icons
jest.mock('lucide-react', () => ({
  CircleCheck: () => <div data-testid="circle-check">✓</div>,
  CircleAlert: () => <div data-testid="circle-alert">⚠</div>,
  RefreshCw: () => <div data-testid="refresh">⟳</div>,
  Eye: () => <div data-testid="eye">👁</div>,
  Calendar: () => <div>📅</div>,
  Download: () => <div>⬇</div>,
  Share2: () => <div>📤</div>,
  Settings: () => <div>⚙</div>,
  MoreHorizontal: () => <div>⋯</div>,
  EyeOff: () => <div>🙈</div>,
}));

describe('ScheduleHeader', () => {
  const mockUseUserEnrollments =
    require('@/hooks/useUserEnrollments').useUserEnrollments;

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('shows CircleCheck icon when no conflicts exist', () => {
    mockUseUserEnrollments.mockReturnValue({
      enrolledCourses: [
        {
          id: '1',
          code: 'TEST101',
          name: 'Test Course 1',
          exclusions: [],
        },
        {
          id: '2',
          code: 'TEST102',
          name: 'Test Course 2',
          exclusions: [],
        },
      ],
      loading: false,
    });

    render(<ScheduleHeader />);

    expect(screen.getByTestId('circle-check')).toBeInTheDocument();
    expect(screen.queryByTestId('circle-alert')).not.toBeInTheDocument();
  });

  it('shows CircleAlert icon when conflicts exist', () => {
    mockUseUserEnrollments.mockReturnValue({
      enrolledCourses: [
        {
          id: '1',
          code: 'TEST101',
          name: 'Test Course 1',
          exclusions: ['TEST102'], // Excludes TEST102
        },
        {
          id: '2',
          code: 'TEST102',
          name: 'Test Course 2',
          exclusions: [],
        },
      ],
      loading: false,
    });

    render(<ScheduleHeader />);

    expect(screen.getByTestId('circle-alert')).toBeInTheDocument();
    expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument();
  });

  it('does not show status icon when loading enrollments', () => {
    mockUseUserEnrollments.mockReturnValue({
      enrolledCourses: [],
      loading: true,
    });

    render(<ScheduleHeader />);

    expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument();
    expect(screen.queryByTestId('circle-alert')).not.toBeInTheDocument();
  });

  it('does not show status icon in readonly mode', () => {
    mockUseUserEnrollments.mockReturnValue({
      enrolledCourses: [],
      loading: false,
    });

    render(<ScheduleHeader readonly={true} />);

    expect(screen.queryByTestId('circle-check')).not.toBeInTheDocument();
    expect(screen.queryByTestId('circle-alert')).not.toBeInTheDocument();
  });

  it('displays correct title for readonly mode with viewing user', () => {
    mockUseUserEnrollments.mockReturnValue({
      enrolledCourses: [],
      loading: false,
    });

    render(<ScheduleHeader readonly={true} viewingUserName="John Doe" />);

    expect(screen.getByText('John Does schema')).toBeInTheDocument();
  });
});
