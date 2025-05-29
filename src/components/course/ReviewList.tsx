import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Star } from 'lucide-react';
import { Review } from '@/types/types';
import React from 'react';

interface ReviewListProps {
  reviews: Review[];
}

const ReviewList: React.FC<ReviewListProps> = ({ reviews }) => {
  return (
    <div className="flex flex-col gap-4">
      <h5>Reviews</h5>
      {reviews.map(({ id, user, rating, comment, createdAt }) => (
        <Card key={id}>
          <CardContent className="flex flex-col items-start gap-2">
            <div className="flex flex-row items-center gap-4">
              <Avatar className="h-10 w-10 rounded-full">
                {user?.image ? (
                  <AvatarImage src={user.image} alt={user.name} />
                ) : (
                  <AvatarFallback>
                    {user.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                )}
              </Avatar>
              <div className="flex flex-col gap-1">
                <span className="font-bold">{user.name}</span>
                <span className="text-muted-foreground">
                  {new Date(createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <Star size={12} />
              {rating}
            </div>
            <p>{comment || 'No comment'}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default React.memo(ReviewList);
