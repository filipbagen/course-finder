import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import ReactStars from 'react-stars';

const ReviewForm = ({
  courseId,
  addReview,
}: {
  courseId: string;
  addReview: (review: any) => void;
}) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/review', {
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

      if (!response.ok) {
        throw new Error('Failed to post review');
      }

      const newReview = await response.json();

      // Update the parent state
      addReview(newReview);

      setRating(0);
      setComment('');
      setError('');
    } catch (error) {
      setError('Failed to post review.');
    }
  };

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="flex items-center gap-2">
        <label>Betyg</label>
        <ReactStars
          count={5}
          onChange={(rating) => setRating(rating)}
          size={24}
          color2={'#ffd700'}
        />
      </div>
      <div className="flex gap-2">
        <Textarea
          value={comment}
          placeholder="Skriv vad du tycker om kursen..."
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <Button type="submit">
        Skicka recensionen
        </Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

export default ReviewForm;
