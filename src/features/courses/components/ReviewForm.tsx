import { Textarea } from '@/components/ui/textarea'
import { useState } from 'react'
import { SubmitReviewButton } from '@/components/shared/SubmitButtons'
import { StarRating } from './StarRating'
import { useAuth } from '@/components/providers/AuthProvider'

type ReviewFormProps = {
  courseId: string
  onReviewSubmitted: (reviewData?: { rating: number; comment: string }) => void
  existingRating?: number
  existingComment?: string
}

const ReviewForm: React.FC<ReviewFormProps> = ({
  courseId,
  onReviewSubmitted,
  existingRating = 0,
  existingComment = '',
}) => {
  const [rating, setRating] = useState<number>(existingRating)
  const [comment, setComment] = useState(existingComment)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { refreshAuth } = useAuth()

  const handleRatingChange = (newRating: number) => {
    setRating(newRating)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (rating === 0) {
      setError('Vänligen välj ett betyg')
      return
    }

    setLoading(true)
    setError('')

    try {
      console.log('Submitting review for course:', courseId)

      const response = await fetch('/api/courses/review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache, no-store, must-revalidate',
          Pragma: 'no-cache',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          rating,
          comment,
          courseId,
        }),
      })

      const result = await response.json()
      console.log('Review submission response:', result)

      if (!response.ok || !result.success) {
        // Check for auth-related errors and refresh auth state if needed
        if (response.status === 401 || response.status === 403) {
          await refreshAuth()
        }
        console.error('Review submission failed:', result)
        throw new Error(result.error || 'Failed to post review')
      }

      // Notify parent component that a review was submitted with the review data
      onReviewSubmitted({ rating, comment })

      // Only reset form if this is a new review (not editing)
      if (!existingRating && !existingComment) {
        setRating(0)
        setComment('')
      }
    } catch (error: unknown) {
      console.error('Review submission error:', error)
      setError(error instanceof Error ? error.message : 'Failed to post review')
    } finally {
      setLoading(false)
    }
  }
  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-4 rounded-lg bg-muted/30 p-4"
    >
      <div className="mb-2 flex flex-col gap-1">
        <div className="flex flex-row items-center gap-2">
          <label htmlFor="rating">Betyg</label>
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
            <span className="ml-2 text-sm font-medium">
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
      {error && <p className="text-sm text-red-500">{error}</p>}
    </form>
  )
}

export default ReviewForm
