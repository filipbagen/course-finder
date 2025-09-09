import React, { useState, useEffect } from 'react';
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
}

const CourseReviews: React.FC<CourseReviewsProps> = ({
  courseId,
  onReviewDataUpdate,
}) => {
  const { user, loading: authLoading } = useAuth();
  const { enrolledCourses, loading: enrollmentsLoading } = useUserEnrollments();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<Review | null>(null);

  // Check if the user is enrolled in this course
  const isUserEnrolled =
    (!enrollmentsLoading &&
      enrolledCourses &&
      Array.isArray(enrolledCourses) &&
      enrolledCourses.some((course) => course.id === courseId)) ||
    // If the user has a review for this course, they must be enrolled
    !!userReview;

  const fetchReviews = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(`/api/courses/${courseId}/reviews`);
      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to fetch reviews');
      }

      setReviews(result.data.reviews);
      setAverageRating(result.data.averageRating);

      // Update parent component with review data
      if (onReviewDataUpdate) {
        onReviewDataUpdate(
          result.data.averageRating,
          result.data.reviews.length
        );
      }

      // Find the current user's review if exists
      if (user) {
        const userReview = result.data.reviews.find(
          (review: any) => review.userId === user.id
        );
        setUserReview(userReview || null);
      }
    } catch (error: any) {
      setError(error.message || 'Could not load reviews');
      console.error('Error fetching reviews:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courseId) {
      fetchReviews();
    }
  }, [courseId, user]);

  const handleReviewSubmitted = () => {
    fetchReviews();
  };

  const handleReviewDeleted = () => {
    fetchReviews();
  };

  const getReviewSubmitInfo = () => {
    if (userReview) return null;
    if (authLoading || enrollmentsLoading) return null;

    if (user === null && !authLoading) {
      return 'Du måste vara inloggad för att recensera kursen.';
    } else if (user && !isUserEnrolled && !enrollmentsLoading) {
      return 'Du måste lägga till kursen i ditt schema för att kunna recensera den.';
    }
    return null;
  };

  const reviewSubmitInfo = getReviewSubmitInfo();

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

          {/* Review form for enrolled users */}
          {user !== null && (isUserEnrolled || userReview) && !authLoading && (
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
