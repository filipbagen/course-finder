import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';
import { Course, CourseWithEnrollment } from '@/types/types';
import CourseReviews from './CourseReviews';
import { useAuth } from '@/components/providers/AuthProvider';
import StarRatings from 'react-star-ratings';

interface CourseReviewDialogProps {
  course: Course | CourseWithEnrollment;
  trigger?: React.ReactNode;
}

const CourseReviewDialog: React.FC<CourseReviewDialogProps> = ({
  course,
  trigger,
}) => {
  const [open, setOpen] = useState(false);
  const [reviewsData, setReviewsData] = useState<{
    averageRating: number;
    count: number;
  }>({
    averageRating: 0,
    count: 0,
  });

  const updateReviewData = (averageRating: number, count: number) => {
    setReviewsData({ averageRating, count });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <StarRatings
              rating={reviewsData.count > 0 ? reviewsData.averageRating : 0}
              starRatedColor="#ffd700"
              numberOfStars={1}
              starDimension="16px"
              starSpacing="0px"
              name="trigger-rating"
            />
            <span>
              {reviewsData.count > 0
                ? `${reviewsData.averageRating.toFixed(1)} (${
                    reviewsData.count
                  })`
                : 'Recensioner'}
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent
        className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto"
        aria-describedby="course-review-description"
      >
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
          {/* Use a div instead of DialogDescription to avoid nesting issues */}
          <div className="text-sm text-muted-foreground mt-1.5 flex items-center gap-2">
            <span className="font-mono text-xs">{course.code}</span>
            {reviewsData.count > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <StarRatings
                  rating={reviewsData.averageRating}
                  starRatedColor="#ffd700"
                  numberOfStars={5}
                  starDimension="14px"
                  starSpacing="1px"
                  name="dialog-rating"
                  halfStarEnabled={true}
                />
                <span className="text-xs ml-1">
                  {reviewsData.averageRating.toFixed(1)} ({reviewsData.count})
                </span>
              </div>
            )}
          </div>

          {/* Hidden description for screen readers */}
          <div id="course-review-description" className="sr-only">
            Recensioner för {course.name}, kurskod {course.code}.
            {reviewsData.count > 0
              ? `Genomsnittligt betyg ${reviewsData.averageRating.toFixed(
                  1
                )} av 5 baserat på ${reviewsData.count} recensioner.`
              : 'Inga recensioner ännu.'}
          </div>
        </DialogHeader>

        <CourseReviews
          courseId={course.id}
          onReviewDataUpdate={updateReviewData}
        />
      </DialogContent>
    </Dialog>
  );
};

export default CourseReviewDialog;
