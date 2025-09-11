import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { SubmitReviewButton } from '@/components/shared/SubmitButtons';
import { StarRating } from './StarRating';
import { useAuth } from '@/components/providers/AuthProvider';
import { Button } from '@/components/ui/button';
import { AlertTriangle } from 'lucide-react';

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
  const [submitSuccessful, setSubmitSuccessful] = useState(false);
  const { refreshAuth, isAuthenticated } = useAuth();

  const handleRatingChange = (newRating: number) => {
    setRating(newRating);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (rating === 0) {
      setError('Vänligen välj ett betyg');
      return;
    }

    // Clear previous states
    setLoading(true);
    setError('');
    setSubmitSuccessful(false);

    try {
      console.log('Submitting review for course:', courseId);

      // First verify authentication status
      if (!isAuthenticated) {
        await refreshAuth();
        // If still not authenticated after refresh, show an error
        if (!isAuthenticated) {
          throw new Error('Du måste vara inloggad för att recensera kursen');
        }
      }

      // Use a timeout for the request
      const fetchPromise = fetch('/api/courses/review', {
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

      // Race against a timeout
      const response = (await Promise.race([
        fetchPromise,
        new Promise((_, reject) =>
          setTimeout(
            () => reject(new Error('Timeout: Server took too long to respond')),
            5000
          )
        ),
      ])) as Response;

      // Parse JSON with timeout protection
      const jsonPromise = response.json();
      const result = (await Promise.race([
        jsonPromise,
        new Promise((_, reject) =>
          setTimeout(
            () =>
              reject(
                new Error('Timeout: Server response processing took too long')
              ),
            3000
          )
        ),
      ])) as any;

      console.log('Review submission response:', result);

      // Check for auth-related errors and refresh auth state if needed
      if (response.status === 401 || response.status === 403) {
        console.log('Auth issue detected, refreshing auth state');
        await refreshAuth();
        throw new Error(
          'Authentication error. Please try again after refreshing the page.'
        );
      }

      if (!response.ok || !result.success) {
        // Even if we got an error, check if it was actually saved
        // This handles the case where the review was saved but the function timed out
        if (result.requestId) {
          console.log(
            'Got requestId in error response, review might have been saved:',
            result.requestId
          );
          // Set success anyway if we have a requestId, as the review might have been saved
          setSubmitSuccessful(true);
          // Wait a moment then notify parent to refresh
          setTimeout(() => {
            onReviewSubmitted();
          }, 1000);
          return;
        }

        console.error('Review submission failed:', result);
        throw new Error(result.error || 'Failed to post review');
      }

      // Mark as successful
      setSubmitSuccessful(true);

      // Notify parent component that a review was submitted
      onReviewSubmitted();

      // Only reset form if this is a new review (not editing)
      if (!existingRating && !existingComment) {
        setRating(0);
        setComment('');
      }
    } catch (error: any) {
      console.error('Review submission error:', error);

      // Format user-friendly error message
      let errorMessage = error.message || 'Failed to post review';
      if (
        errorMessage.includes('timeout') ||
        errorMessage.includes('Timeout')
      ) {
        errorMessage =
          'Servern svarade inte. Din recension kan ha sparats ändå, vänligen uppdatera sidan för att kontrollera.';
        // Try to refresh anyway in case it did save
        setTimeout(() => {
          onReviewSubmitted();
        }, 2000);
      }

      setError(errorMessage);
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

      <div className="flex justify-between items-center">
        {submitSuccessful && (
          <p className="text-green-600 text-sm">Recensionen har sparats!</p>
        )}
        <div className="ml-auto">
          <SubmitReviewButton
            loading={loading}
            text={existingRating ? 'Uppdatera recension' : 'Skicka recension'}
          />
        </div>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-2 bg-red-100 rounded text-red-700 text-sm">
          <AlertTriangle className="h-4 w-4" />
          <p>{error}</p>
        </div>
      )}
    </form>
  );
};

export default ReviewForm;
