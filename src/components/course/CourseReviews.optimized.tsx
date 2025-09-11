import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserEnrollments } from '@/hooks/useUserEnrollments';
import { Review } from '@/types/types';
import { StarRating } from './StarRating';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface CourseReviewsProps {
  courseId: string;
  onReviewDataUpdate?: (averageRating: number, count: number) => void;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  onReviewDataUpdate,
}) => {
  const {
    user,
    loading: authLoading,
    isAuthenticated,
    refreshAuth,
  } = useAuth();
  const { enrolledCourses, loading: enrollmentsLoading } = useUserEnrollments();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Add a ref to track whether we've already updated the parent
  const hasUpdatedParent = useRef(false);
  const [retryCount, setRetryCount] = useState(0);

  // Check if the user is enrolled in this course
  const isUserEnrolled = React.useMemo(() => {
    // If the user has a review, they must be enrolled
    if (userReview) return true;

    // Check enrollment from the global store
    const hasEnrollment =
      !enrollmentsLoading &&
      enrolledCourses &&
      Array.isArray(enrolledCourses) &&
      enrolledCourses.some((course) => course && course.id === courseId);

    console.log(
      `Enrollment check for course ${courseId}: enrolled=${hasEnrollment}, enrolledCourses.length=${
        enrolledCourses?.length || 0
      }`
    );

    return hasEnrollment;
  }, [userReview, enrollmentsLoading, enrolledCourses, courseId]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Add cache-busting parameter to prevent stale data
      const timestamp = new Date().getTime();

      // Use timeout protection for the fetch request
      const fetchPromise = fetch(
        `/api/courses/${courseId}/reviews?_=${timestamp}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
        }
      );

      // Race the fetch against a timeout
      const response = (await Promise.race([
        fetchPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Review fetch timed out')), 6000)
        ),
      ])) as Response;

      // Handle potential auth issues
      if (response.status === 401 || response.status === 403) {
        console.log(
          'Auth issue detected during review fetch, refreshing state'
        );
        await refreshAuth();
      }

      // If we hit a 500 error, it might be a serverless timeout
      if (response.status === 500 || response.status === 504) {
        console.error('Server error when fetching reviews, may be a timeout');
        throw new Error('Server timeout, please try again');
      }

      // Parse JSON with timeout protection
      const jsonPromise = response.json();
      const result = (await Promise.race([
        jsonPromise,
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('JSON parsing timed out')), 3000)
        ),
      ])) as any;

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      setReviews(result.data.reviews);
      setAverageRating(result.data.averageRating);
      setRetryCount(0); // Reset retry count on success

      // Find the current user's review if exists
      if (user) {
        const userReview = result.data.reviews.find(
          (review: any) =>
            review.userId === user.id ||
            (review.user && review.user.id === user.id) ||
            (review.User && review.User.id === user.id)
        );
        setUserReview(userReview || null);
      }
    } catch (error: any) {
      const errorMsg = error.message || 'Could not load reviews';
      setError(errorMsg);
      console.error('Error fetching reviews:', error);

      // If there was a timeout or network error, show a user-friendly message
      if (
        errorMsg.includes('timeout') ||
        errorMsg.includes('network') ||
        errorMsg.includes('failed to fetch')
      ) {
        setError('Kunde inte ladda recensioner. Prova att uppdatera sidan.');
      }
    } finally {
      setLoading(false);
    }
  }, [courseId, user, refreshAuth]);

  // Add a retry handler
  const handleRetry = useCallback(() => {
    setRetryCount((count) => count + 1);
    fetchReviews();
  }, [fetchReviews]);

  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId, fetchReviews]);

  // Separate effect to update parent component when review data changes
  // Using a ref to prevent excessive updates
  useEffect(() => {
    if (onReviewDataUpdate && !loading && !hasUpdatedParent.current) {
      onReviewDataUpdate(averageRating, reviews.length);
      hasUpdatedParent.current = true;
    }
  }, [onReviewDataUpdate, averageRating, reviews.length, loading]);

  const handleReviewSubmitted = useCallback(() => {
    fetchReviews();
    // Reset the update flag so we can update the parent again after a new review
    hasUpdatedParent.current = false;
  }, [fetchReviews]);

  const handleReviewDeleted = useCallback(() => {
    fetchReviews();
    // Reset the update flag so we can update the parent again after a review is deleted
    hasUpdatedParent.current = false;
  }, [fetchReviews]);

  const getReviewSubmitInfo = useCallback(() => {
    if (userReview) return null;

    // Don't show any message while still loading
    if (authLoading || enrollmentsLoading) return null;

    // This is a critical check - only show login message if explicitly not logged in
    // Use the explicit isAuthenticated flag from AuthProvider
    if (!isAuthenticated && !authLoading) {
      return 'Du måste vara inloggad för att recensera kursen.';
    }

    // Only check enrollment if the user is definitely logged in
    if (user && !isUserEnrolled && !enrollmentsLoading) {
      return 'Du måste lägga till kursen i ditt schema för att kunna recensera den.';
    }

    return null;
  }, [
    userReview,
    authLoading,
    enrollmentsLoading,
    user,
    isUserEnrolled,
    isAuthenticated,
  ]);

  // Memoize the result to prevent recalculation on every render
  const reviewSubmitInfo = React.useMemo(
    () => getReviewSubmitInfo(),
    [getReviewSubmitInfo]
  );

  return (
    <div className="space-y-4">
      {loading ? (
        <div className="space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      ) : error ? (
        <div className="flex flex-col items-center gap-4 py-4">
          <p className="text-red-500 text-center">{error}</p>
          <Button
            variant="outline"
            size="sm"
            onClick={handleRetry}
            disabled={loading}
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Försök igen {retryCount > 0 ? `(${retryCount})` : ''}
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Review stats */}
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1 flex-row">
                <StarRating
                  initialValue={averageRating}
                  size={20}
                  allowFraction
                  readonly
                  fillColor="#ffd700"
                  emptyColor="#e4e5e9"
                  className="flex-shrink-0"
                />
                <span className="font-medium ml-2">
                  {averageRating.toFixed(1)}
                </span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-5 w-5" />
                <span>
                  {reviews.length}{' '}
                  {reviews.length === 1 ? 'recension' : 'recensioner'}
                </span>
              </div>
            </div>
          </div>

          {/* Reviews list */}
          <ReviewList
            reviews={reviews}
            currentUserId={user?.id}
            onReviewDeleted={handleReviewDeleted}
          />

          {/* Review form for enrolled users */}
          {isAuthenticated &&
            (isUserEnrolled || userReview) &&
            !authLoading && (
              <div className="pt-6 border-t border-border">
                <h3 className="text-lg font-semibold mb-4">
                  {userReview ? 'Redigera din recension' : 'Skriv en recension'}
                </h3>
                <ReviewForm
                  courseId={courseId}
                  onReviewSubmitted={handleReviewSubmitted}
                  existingRating={userReview?.rating}
                  existingComment={userReview?.comment}
                />
              </div>
            )}

          {/* Message for users who can't review */}
          {reviewSubmitInfo && (
            <div className="pt-6 border-t border-border">
              <p className="text-muted-foreground">{reviewSubmitInfo}</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default CourseReviews;
