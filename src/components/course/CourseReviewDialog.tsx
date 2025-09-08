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
import { Star, MessageSquare } from 'lucide-react';
import { Course, CourseWithEnrollment } from '@/types/types';
import CourseReviews from './CourseReviews';
import { useAuth } from '@/components/providers/AuthProvider';

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
            <Star className="h-4 w-4" />
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

      <DialogContent className="sm:max-w-[625px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{course.name}</DialogTitle>
          <DialogDescription className="flex items-center gap-2">
            <span className="font-mono text-xs">{course.code}</span>
            {reviewsData.count > 0 && (
              <div className="flex items-center gap-1 ml-2">
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs">
                  {reviewsData.averageRating.toFixed(1)} ({reviewsData.count})
                </span>
              </div>
            )}
          </DialogDescription>
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
