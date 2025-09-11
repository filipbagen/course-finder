import { NextRequest } from 'next/server';
import { POST } from '@/app/api/test-conflict/route';

// Mock Prisma
jest.mock('@/lib/prisma', () => ({
  prisma: {
    course: {
      findUnique: jest.fn(),
    },
    enrollment: {
      findMany: jest.fn(),
    },
  },
}));

// Mock auth
jest.mock('@/lib/auth', () => ({
  getAuthenticatedUser: jest.fn(),
}));

import { prisma } from '@/lib/prisma';
import { getAuthenticatedUser } from '@/lib/auth';

const mockPrisma = prisma as jest.Mocked<typeof prisma>;
const mockGetAuthenticatedUser = getAuthenticatedUser as jest.MockedFunction<
  typeof getAuthenticatedUser
>;

describe('/api/test-conflict', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return no conflict when course has no exclusions', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1' });

    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'course-1',
      code: 'TEST101',
      name: 'Test Course',
      exclusions: [],
    });

    mockPrisma.enrollment.findMany.mockResolvedValue([]);

    const request = new NextRequest('http://localhost/api/test-conflict', {
      method: 'POST',
      body: JSON.stringify({ courseId: 'course-1' }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.hasConflict).toBe(false);
  });

  it('should detect conflict when enrolled course excludes the target course', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1' });

    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'course-1',
      code: 'TEST101',
      name: 'Test Course',
      exclusions: [],
    });

    mockPrisma.enrollment.findMany.mockResolvedValue([
      {
        id: 'enrollment-1',
        userId: 'user-1',
        courseId: 'enrolled-course-1',
        semester: 1,
        course: {
          id: 'enrolled-course-1',
          code: 'EXCL101',
          name: 'Excluding Course',
          exclusions: ['TEST101'], // This course excludes TEST101
        },
      },
    ]);

    const request = new NextRequest('http://localhost/api/test-conflict', {
      method: 'POST',
      body: JSON.stringify({ courseId: 'course-1' }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.hasConflict).toBe(true);
    expect(result.data.conflictingCourse.code).toBe('EXCL101');
  });

  it('should detect conflict when target course excludes enrolled course', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1' });

    mockPrisma.course.findUnique.mockResolvedValue({
      id: 'course-1',
      code: 'TEST101',
      name: 'Test Course',
      exclusions: ['ENROLLED101'], // This course excludes ENROLLED101
    });

    mockPrisma.enrollment.findMany.mockResolvedValue([
      {
        id: 'enrollment-1',
        userId: 'user-1',
        courseId: 'enrolled-course-1',
        semester: 1,
        course: {
          id: 'enrolled-course-1',
          code: 'ENROLLED101',
          name: 'Enrolled Course',
          exclusions: [],
        },
      },
    ]);

    const request = new NextRequest('http://localhost/api/test-conflict', {
      method: 'POST',
      body: JSON.stringify({ courseId: 'course-1' }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(200);
    expect(result.success).toBe(true);
    expect(result.data.hasConflict).toBe(true);
    expect(result.data.conflictingCourse.code).toBe('ENROLLED101');
  });

  it('should return 400 when courseId is missing', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1' });

    const request = new NextRequest('http://localhost/api/test-conflict', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(400);
    expect(result.success).toBe(false);
    expect(result.error).toContain('courseId is required');
  });

  it('should return 404 when course is not found', async () => {
    mockGetAuthenticatedUser.mockResolvedValue({ id: 'user-1' });

    mockPrisma.course.findUnique.mockResolvedValue(null);

    const request = new NextRequest('http://localhost/api/test-conflict', {
      method: 'POST',
      body: JSON.stringify({ courseId: 'non-existent-course' }),
    });

    const response = await POST(request);
    const result = await response.json();

    expect(response.status).toBe(404);
    expect(result.success).toBe(false);
    expect(result.error).toContain('Course not found');
  });
});
