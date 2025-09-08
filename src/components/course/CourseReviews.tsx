import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Star, MessageSquare } from 'lucide-react';
import { Skeleton } from '@/components/ui/skeleton';

interface CourseReviewsProps {
  courseId: string;
}

const CourseReviews: React.FC<CourseReviewsProps> = ({ courseId }) => {
  const { user } = useAuth();
  const [reviews, setReviews] = useState<any[]>([]);
  const [averageRating, setAverageRating] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [userReview, setUserReview] = useState<any | null>(null);

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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Recensioner</h3>
          {!loading && (
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
                <span className="font-medium">{averageRating.toFixed(1)}</span>
              </div>
              <div className="flex items-center gap-1">
                <MessageSquare className="h-4 w-4" />
                <span>{reviews.length}</span>
              </div>
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : error ? (
          <p className="text-red-500">{error}</p>
        ) : (
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="mb-4">
              <TabsTrigger value="all">Alla recensioner</TabsTrigger>
              {user && <TabsTrigger value="write">Skriv recension</TabsTrigger>}
            </TabsList>
            <TabsContent value="all">
              <ReviewList
                reviews={reviews}
                currentUserId={user?.id}
                onReviewDeleted={handleReviewDeleted}
              />
            </TabsContent>
            {user && (
              <TabsContent value="write">
                <ReviewForm
                  courseId={courseId}
                  onReviewSubmitted={handleReviewSubmitted}
                  existingRating={userReview?.rating}
                  existingComment={userReview?.comment}
                />
              </TabsContent>
            )}
          </Tabs>
        )}
      </CardContent>
    </Card>
  );
};

export default CourseReviews;
