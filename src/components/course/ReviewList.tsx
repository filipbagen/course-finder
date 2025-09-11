import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import { StarRating } from './StarRating';
import { useAuth } from '@/components/providers/AuthProvider';

interface ReviewUser {
  id: string;
  name: string;
  email: string;
  image: string | null;
}

interface ReviewData {
  id: string;
  rating: number;
  comment: string | null;
  createdAt: string;
  updatedAt: string;
  userId: string;
  courseId: string;
  User?: {
    id: string;
    name: string;
    email: string;
    image: string | null;
  };
}

interface ReviewListProps {
  reviews: ReviewData[];
  currentUserId?: string | null;
  onReviewDeleted: () => void;
}

const ReviewList: React.FC<ReviewListProps> = ({
  reviews,
  currentUserId,
  onReviewDeleted,
}) => {
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const { refreshAuth } = useAuth();

  // Helper function to check if current user is the owner of a review
  const isReviewOwner = (
    review: ReviewData,
    userId: string | null | undefined
  ): boolean => {
    if (!userId) return false;

    return !!(
      userId === review.userId ||
      (review.User && userId === review.User.id)
    );
  };

  const deleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);

    try {
      console.log('Deleting review:', reviewId);

      // Add cache-busting query parameter
      const timestamp = new Date().getTime();
      const response = await fetch(
        `/api/courses/review?reviewId=${reviewId}&_=${timestamp}`,
        {
          method: 'DELETE',
          headers: {
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            Pragma: 'no-cache',
          },
        }
      );

      // Handle timeout (Vercel's function timeout is typically 10s)
      const responseData = (await Promise.race([
        response.json(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Request timed out')), 8000)
        ),
      ])) as any;

      // Check for auth issues and refresh auth state if needed
      if (response.status === 401 || response.status === 403) {
        console.log(
          'Auth issue detected during review deletion, refreshing state'
        );
        await refreshAuth();
      }

      if (!response.ok || !responseData.success) {
        throw new Error(responseData.error || 'Failed to delete review');
      }

      console.log('Review deleted successfully');
      onReviewDeleted();
    } catch (error) {
      console.error('Error deleting review:', error);

      // Show user-friendly error message
      alert(
        'Det gick inte att ta bort recensionen. Vänligen försök igen senare.'
      );
    } finally {
      setDeletingId(null);
    }
  };

  if (reviews.length === 0) {
    return (
      <p className="text-muted-foreground text-center py-4">
        Inga recensioner ännu. Bli den första att recensera!
      </p>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {reviews.map((review) => (
        <Card key={review.id} className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-3">
                {/* User info and date */}
                <div className="flex items-center gap-3">
                  <Avatar className="h-9 w-9">
                    {review.User?.image ? (
                      <AvatarImage
                        src={review.User.image}
                        alt={review.User.name || 'Användare'}
                      />
                    ) : (
                      <AvatarFallback>
                        {(review.User?.name?.charAt(0) || 'A').toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-0">
                    <span className="font-medium">
                      {review.User?.name || 'Anonym användare'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                      {review.createdAt !== review.updatedAt && ' (redigerad)'}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center gap-1 flex-row">
                  <StarRating
                    initialValue={review.rating}
                    size={16}
                    allowFraction
                    readonly
                    fillColor="#ffd700"
                    emptyColor="#e4e5e9"
                    className="flex-shrink-0"
                  />
                  <span className="text-sm text-muted-foreground ml-1">
                    {review.rating.toFixed(1)}
                  </span>
                </div>

                {/* Comment */}
                {review.comment && (
                  <div className="text-sm text-muted-foreground whitespace-pre-wrap break-words">
                    {review.comment}
                  </div>
                )}
              </div>

              {/* Delete button (only for user's own reviews) */}
              {isReviewOwner(review, currentUserId) && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => deleteReview(review.id)}
                  disabled={deletingId === review.id}
                  className="text-destructive"
                >
                  {deletingId === review.id ? (
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  ) : (
                    <Trash2 size={16} />
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(ReviewList);
