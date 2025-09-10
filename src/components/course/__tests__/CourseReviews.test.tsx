import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import CourseReviews from '@/components/course/CourseReviews';
import { AuthProvider } from '@/components/providers/AuthProvider';

// Mock the fetch API
global.fetch = jest.fn();

// Mock the auth provider
jest.mock('@/components/providers/AuthProvider', () => ({
  useAuth: () => ({
    user: { id: 'test-user-id', name: 'Test User' },
    loading: false,
  }),
}));

// Mock the user enrollments hook
jest.mock('@/hooks/useUserEnrollments', () => ({
  useUserEnrollments: () => ({
    enrolledCourses: [{ id: 'test-course-id' }],
    loading: false,
  }),
}));

// Mock child components
jest.mock('@/components/course/ReviewForm', () => ({
  default: ({ onReviewSubmitted }: any) => (
    <div data-testid="review-form">
      <button onClick={onReviewSubmitted} data-testid="submit-review">
        Submit Review
      </button>
    </div>
  ),
}));

jest.mock('@/components/course/ReviewList', () => ({
  default: ({ reviews, onReviewDeleted }: any) => (
    <div data-testid="review-list">
      {reviews.map((review: any) => (
        <div key={review.id} data-testid={`review-${review.id}`}>
          <p>{review.comment}</p>
          {review.userId === 'test-user-id' && (
            <button
              onClick={() => onReviewDeleted()}
              data-testid="delete-review"
            >
              Delete
            </button>
          )}
        </div>
      ))}
    </div>
  ),
}));

jest.mock('@/components/course/StarRating', () => ({
  StarRating: ({ initialValue }: any) => (
    <div data-testid="star-rating">{initialValue} stars</div>
  ),
}));

describe('CourseReviews Component', () => {
  const mockReviews = [
    {
      id: 'review-1',
      rating: 4.5,
      comment: 'Great course!',
      userId: 'test-user-id',
      courseId: 'test-course-id',
      createdAt: '2024-01-01T00:00:00Z',
      updatedAt: '2024-01-01T00:00:00Z',
      User: {
        id: 'test-user-id',
        name: 'Test User',
        email: 'test@example.com',
        image: null,
      },
    },
    {
      id: 'review-2',
      rating: 3.0,
      comment: 'Decent course',
      userId: 'other-user-id',
      courseId: 'test-course-id',
      createdAt: '2024-01-02T00:00:00Z',
      updatedAt: '2024-01-02T00:00:00Z',
      User: {
        id: 'other-user-id',
        name: 'Other User',
        email: 'other@example.com',
        image: null,
      },
    },
  ];

  const mockApiResponse = {
    success: true,
    data: {
      reviews: mockReviews,
      averageRating: 3.75,
    },
  };

  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockApiResponse),
    });
  });

  it('fetches and displays reviews correctly', async () => {
    render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    // Should show loading state initially
    expect(screen.getByTestId('review-list')).toBeInTheDocument();

    // Wait for reviews to load
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/courses/test-course-id/reviews'
      );
    });

    // Should display reviews
    await waitFor(() => {
      expect(screen.getByText('Great course!')).toBeInTheDocument();
      expect(screen.getByText('Decent course')).toBeInTheDocument();
    });

    // Should display average rating
    expect(screen.getByText('3.8')).toBeInTheDocument(); // 3.75 rounded to 1 decimal
    expect(screen.getByText('2 recensioner')).toBeInTheDocument();
  });

  it('shows review form for enrolled users', async () => {
    render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('review-form')).toBeInTheDocument();
    });
  });

  it('handles review submission', async () => {
    const mockOnReviewDataUpdate = jest.fn();

    render(
      <CourseReviews
        courseId="test-course-id"
        onReviewDataUpdate={mockOnReviewDataUpdate}
      />
    );

    await waitFor(() => {
      expect(screen.getByTestId('review-form')).toBeInTheDocument();
    });

    // Click submit review button
    fireEvent.click(screen.getByTestId('submit-review'));

    // Should refetch reviews after submission
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial load + after submission
    });
  });

  it('handles review deletion', async () => {
    render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByTestId('review-list')).toBeInTheDocument();
    });

    // Click delete review button
    fireEvent.click(screen.getByTestId('delete-review'));

    // Should refetch reviews after deletion
    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(2); // Initial load + after deletion
    });
  });

  it('handles API errors gracefully', async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ success: false, error: 'API Error' }),
    });

    render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    await waitFor(() => {
      expect(screen.getByText('API Error')).toBeInTheDocument();
    });
  });

  it('only makes one API call per course change', async () => {
    const { rerender } = render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    // Rerender with same courseId - should not make another call
    rerender(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    // Should still only have been called once
    expect(global.fetch).toHaveBeenCalledTimes(1);
  });

  it('makes new API call when courseId changes', async () => {
    const { rerender } = render(
      <CourseReviews courseId="test-course-id" onReviewDataUpdate={jest.fn()} />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/courses/test-course-id/reviews'
      );
    });

    // Rerender with different courseId
    rerender(
      <CourseReviews
        courseId="different-course-id"
        onReviewDataUpdate={jest.fn()}
      />
    );

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/courses/different-course-id/reviews'
      );
    });

    expect(global.fetch).toHaveBeenCalledTimes(2);
  });
});
