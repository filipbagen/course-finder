import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Review } from '@/app/utilities/types';

const ReviewList = ({ reviews }: { reviews: Review[] }) => {
  return (
    <div className="flex flex-col gap-4">
      <h5>Reviews</h5>
      {reviews.map((review) => (
        <Card key={review.id}>
          <CardContent className="flex flex-col items-start gap-2">
            <div className="flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10 rounded-full">
                {review.user?.image ? (
                  <AvatarImage src={review.user.image} alt={review.user.name} />
                ) : (
                  <AvatarFallback>
                    {review.user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-bold">{review.user.name}</span>
                <span className="text-muted-foreground">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="flex gap-2 items-center">
              <Star size={12} />
              {review.rating}
            </div>

            {review.comment ? review.comment : 'No comment'}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default ReviewList;
