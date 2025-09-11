import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { SubmitReviewButton } from '@/components/shared/SubmitButtons';
import { StarRating } from './StarRating';

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
  const [rating, setRating] = useState<number>(existingRating);
  const [comment, setComment] = useState(existingComment);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Vänligen välj ett betyg');
      return;
    }

    setLoading(true);
    setError('');

    try {
      console.log('Submitting review for course:', courseId);

      const response = await fetch('/api/courses/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        body: JSON.stringify({
          rating,
          comment,
          courseId,
        }),
      });

      const result = await response.json();
      console.log('Review submission response:', result);

      if (!response.ok || !result.success) {
        console.error('Review submission failed:', result);
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
      console.error('Review submission error:', error);
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
      <div className="flex flex-col gap-1 mb-2">
        <div className="flex items-center gap-2 flex-row">
          <label>Betyg</label>
          <StarRating
            onClick={handleRatingChange}
            initialValue={rating}
            size={30}
            allowFraction
            fillColor="#ffd700"
            emptyColor="#e4e5e9"
            className="flex-shrink-0"
          />
          {rating > 0 && (
            <span className="text-sm ml-2 font-medium">
              {rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>

      <Textarea
        value={comment}
        placeholder="Skriv vad du tycker om kursen..."
        onChange={(e) => setComment(e.target.value)}
        className="min-h-[100px]"
      />

      <div className="flex justify-end">
        <SubmitReviewButton
          loading={loading}
          text={existingRating ? 'Uppdatera recension' : 'Skicka recension'}
        />
      </div>
      {error && <p className="text-red-500 text-sm">{error}</p>}
    </form>
  );
};

export default ReviewForm;
