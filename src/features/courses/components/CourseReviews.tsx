import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useAuth } from '@/components/providers/AuthProvider';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';
import { useUserEnrollments } from '@/hooks/useUserEnrollments';
import { Review } from '@/types/types';
import { StarRating } from './StarRating';

interface CourseReviewsProps {
  courseId: string;
  onReviewDataUpdate?: (averageRating: number, count: number) => void;
  isFromSchedule?: boolean; // Indicates if user is viewing from their schedule
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  onReviewDataUpdate,
  isFromSchedule = false,
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

  // Check if the user is enrolled in this course
  const isUserEnrolled = React.useMemo(() => {
    // If viewing from schedule, user is definitely enrolled
    if (isFromSchedule) return true;

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
      }, isFromSchedule=${isFromSchedule}`
    );

    return hasEnrollment;
  }, [
    userReview,
    enrollmentsLoading,
    enrolledCourses,
    courseId,
    isFromSchedule,
  ]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Add cache-busting parameter to prevent stale data
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/courses/${courseId}/reviews?_=${timestamp}`,
        {
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
            Expires: '0',
          },
          credentials: 'include', // Include cookies for authentication
        }
      );

      // Handle potential auth issues
      if (response.status === 401 || response.status === 403) {
        console.log(
          'Auth issue detected during review fetch, refreshing state'
        );
        await refreshAuth();
      }

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      setReviews(result.data.reviews);
      setAverageRating(result.data.averageRating);

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
      setError(error.message || 'Could not load reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  }, [courseId, user, refreshAuth]);

  // Reset reviews when course ID changes to prevent showing cached reviews from previous courses
  useEffect(() => {
    if (courseId) {
      // Clear previous reviews first
      setReviews([]);
      setAverageRating(0);
      setUserReview(null);
      // Then fetch new reviews
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

  const handleReviewSubmitted = useCallback(
    async (reviewData?: { rating: number; comment: string }) => {
      // If we have review data, do optimistic update
      if (reviewData && user) {
        const tempId = `temp-${Date.now()}`;

        // Create optimistic review object
        const optimisticReview: Review = {
          id: tempId, // Temporary ID - will be replaced with real ID
          rating: reviewData.rating,
          comment: reviewData.comment,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          userId: user.id,
          courseId: courseId,
          User: {
            id: user.id,
            name: user.name || 'Du',
            email: user.email,
            image: user.image || null,
          },
        };

        // Optimistically update the reviews list
        setReviews((prevReviews) => {
          // Remove any existing user review first
          const filteredReviews = prevReviews.filter(
            (review) => review.userId !== user.id
          );
          // Add the new review
          return [...filteredReviews, optimisticReview];
        });

        // Update user review state
        setUserReview(optimisticReview);

        // Calculate new average rating optimistically
        setReviews((currentReviews) => {
          const newReviews = [...currentReviews];
          if (newReviews.length > 0) {
            const totalRating = newReviews.reduce(
              (sum, review) => sum + review.rating,
              0
            );
            const newAverage = totalRating / newReviews.length;
            setAverageRating(newAverage);
          }
          return newReviews;
        });

        // Reset the update flag so we can update the parent again
        hasUpdatedParent.current = false;

        // Make the API call and update with real data
        try {
          await fetchReviews();
        } catch (error) {
          console.error('Error fetching reviews after submission:', error);
          // If the API call fails, we could show an error or revert the optimistic update
          // For now, we'll just log the error since the optimistic update gives immediate feedback
        }
      } else {
        // Fallback to regular fetch if no review data
        fetchReviews().catch((error) => {
          console.error('Error fetching reviews after submission:', error);
        });
      }
    },
    [user, courseId, fetchReviews]
  );

  const handleReviewDeleted = useCallback(
    async (deletedReviewId?: string) => {
      // If we have a specific review ID to delete
      if (deletedReviewId && user) {
        // Check if this is a temporary review (optimistic update)
        const isTempReview = deletedReviewId.startsWith('temp-');

        if (isTempReview) {
          // For temporary reviews, just remove from local state
          setReviews((prevReviews) => {
            const filteredReviews = prevReviews.filter(
              (review) => review.id !== deletedReviewId
            );

            // Recalculate average rating after removal
            if (filteredReviews.length > 0) {
              const totalRating = filteredReviews.reduce(
                (sum, review) => sum + review.rating,
                0
              );
              const newAverage = totalRating / filteredReviews.length;
              setAverageRating(newAverage);
            } else {
              setAverageRating(0);
            }

            return filteredReviews;
          });

          // Clear user review state if it was the user's own review
          setUserReview(null);

          // Reset the update flag
          hasUpdatedParent.current = false;
        } else {
          // For real reviews, make API call and optimistic update
          // Optimistically remove the review from the list
          setReviews((prevReviews) => {
            const filteredReviews = prevReviews.filter(
              (review) => review.id !== deletedReviewId
            );

            // Recalculate average rating after removal
            if (filteredReviews.length > 0) {
              const totalRating = filteredReviews.reduce(
                (sum, review) => sum + review.rating,
                0
              );
              const newAverage = totalRating / filteredReviews.length;
              setAverageRating(newAverage);
            } else {
              setAverageRating(0);
            }

            return filteredReviews;
          });

          // Clear user review state if it was the user's own review
          setUserReview(null);

          // Reset the update flag
          hasUpdatedParent.current = false;

          // Make the API call in the background
          try {
            await fetchReviews();
          } catch (error) {
            console.error('Error fetching reviews after deletion:', error);
          }
        }
      } else {
        // Fallback - just fetch reviews
        fetchReviews().catch((error) => {
          console.error('Error fetching reviews after deletion:', error);
        });
      }
    },
    [user, fetchReviews]
  );

  const getReviewSubmitInfo = useCallback(() => {
    // Don't show any message while still loading
    if (authLoading) return null;

    // This is a critical check - only show login message if explicitly not logged in
    // Use the explicit isAuthenticated flag from AuthProvider
    if (!isAuthenticated && !authLoading) {
      return 'Du måste vara inloggad för att recensera kursen.';
    }

    // Since we always show the form for authenticated users,
    // enrollment validation happens on submission
    return null;
  }, [authLoading, isAuthenticated]);

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
        <p className="text-red-500">{error}</p>
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

          {/* Review form for authenticated users */}
          {isAuthenticated && !authLoading && (
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
