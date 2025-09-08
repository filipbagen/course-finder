import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { MessageSquare, Trash2 } from 'lucide-react';
import React, { useState } from 'react';
import StarRatings from 'react-star-ratings';

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

  const deleteReview = async (reviewId: string) => {
    setDeletingId(reviewId);

    try {
      const response = await fetch(`/api/courses/review?reviewId=${reviewId}`, {
        method: 'DELETE',
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to delete review');
      }

      // Notify parent component that a review was deleted
      onReviewDeleted();
    } catch (error) {
      console.error('Error deleting review:', error);
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
                        alt={review.User.name}
                      />
                    ) : (
                      <AvatarFallback>
                        {review.User?.name?.charAt(0).toUpperCase() || 'U'}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div className="flex flex-col gap-0">
                    <span className="font-medium">
                      {review.User?.name || 'Anonymous'}
                    </span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(review.createdAt).toLocaleDateString('sv-SE', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating */}
                <div className="flex items-center">
                  <StarRatings
                    rating={review.rating}
                    starRatedColor="#ffd700"
                    numberOfStars={5}
                    starDimension="16px"
                    starSpacing="1px"
                    name={`rating-${review.id}`}
                    halfStarEnabled={true}
                  />
                </div>

                {/* Comment */}
                {review.comment && (
                  <p className="text-sm text-muted-foreground">
                    {review.comment}
                  </p>
                )}
              </div>

              {/* Delete button (only for user's own reviews) */}
              {currentUserId && currentUserId === review.userId && (
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
