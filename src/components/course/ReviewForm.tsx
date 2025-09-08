import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import StarRatings from 'react-star-ratings';
import { SubmitReviewButton } from '@/components/shared/SubmitButtons';
import { Review } from '@/types/types';

type ReviewFormProps = {
  courseId: string;
  onReviewSubmitted: () => void;
  existingRating?: number;
  existingComment?: string;
};

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  onReviewSubmitted,
  existingRating = 0,
  existingComment = '',
}) => {
  const [rating, setRating] = useState(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/courses/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          rating,
          comment,
          courseId,
        }),
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.error || 'Failed to post review');
      }

      // Notify parent component that a review was submitted
      onReviewSubmitted();

      // Only reset form if this is a new review (not editing)
      if (!existingRating && !existingComment) {
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      setError(error.message || 'Failed to post review');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 p-4 bg-muted/30 rounded-lg"
    >
      <h3 className="text-lg font-medium">
        {existingRating ? 'Redigera din recension' : 'Skriv en recension'}
      </h3>
      <div className="flex items-center gap-2">
        <label>Betyg</label>
        <StarRatings
          rating={rating}
          starRatedColor="#ffd700"
          changeRating={handleRatingChange}
          numberOfStars={5}
          name="rating"
          starDimension="24px"
          starSpacing="2px"
          starHoverColor="#ffd700"
          starEmptyColor="#e4e5e9"
          halfStarEnabled={true}
        />
      </div>
      <div className="flex gap-2">
        <Textarea
          value={comment}
          placeholder="Skriv vad du tycker om kursen..."
          onChange={(e) => setComment(e.target.value)}
          className="min-h-[100px]"
        />
      </div>
      <div className="flex justify-end">
        <SubmitReviewButton loading={loading} text={existingRating ? 'Uppdatera recension' : 'Skicka recension'} />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default ReviewForm;
