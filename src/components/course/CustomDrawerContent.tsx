import { useState, useEffect, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Examination, Course, Review } from '@/types/types';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import CourseDetails from './CourseDetails';
import React from 'react';
import { SkeletonCard } from '@/components/shared/SkeletonComponent';

const ReviewListMemoized = React.memo(ReviewList);

interface CustomDrawerContentProps {
  course: Course;
}

const CustomDrawerContent: React.FC<CustomDrawerContentProps> = ({
  course,
}) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);

  // useMemo to calculate average rating
  const averageRating = useMemo(() => {
    if (reviews.length === 0) return 0;
    return parseFloat(
      (
        reviews.reduce((acc, review) => acc + review.rating, 0) / reviews.length
      ).toFixed(2)
    );
  }, [reviews]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/review?courseId=${course.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchReviews();
  }, [course.id]);

  const addReview = (newReview: Review) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  if (loading) {
    return (
      <ScrollArea className="h-screen p-12">
        <SkeletonCard />
      </ScrollArea>
    );
  }

  return (
    <ScrollArea className="h-screen p-12">
      <div className="flex flex-col gap-8">
        <CourseDetails
          course={course}
          averageRating={averageRating}
          reviewsCount={reviews.length}
        />
        <Tabs defaultValue="about" className="flex flex-col gap-8">
          <TabsList className="flex gap-2 w-min">
            <TabsTrigger value="about">Om</TabsTrigger>
            <TabsTrigger value="examination">Examination</TabsTrigger>
            <TabsTrigger value="reviews">
              Recension ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="flex flex-col gap-6">
              {course.prerequisites && course.prerequisites.paragraph && (
                <>
                  <div>
                    <h5>Förkunskaper</h5>
                    <p>{course.prerequisites.paragraph}</p>
                    {course.prerequisites.list_items.length > 0 && (
                      <ul className="list-disc list-inside mt-2">
                        {course.prerequisites.list_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {course.recommendedPrerequisites &&
                course.recommendedPrerequisites.paragraph && (
                  <>
                    <div>
                      <h5>Rekommenderade förkunskaper</h5>
                      <p>{course.recommendedPrerequisites.paragraph}</p>
                      {course.recommendedPrerequisites.list_items.length >
                        0 && (
                        <ul className="list-disc list-inside mt-2">
                          {course.recommendedPrerequisites.list_items.map(
                            (item, index) => (
                              <li key={index}>{item}</li>
                            )
                          )}
                        </ul>
                      )}
                    </div>
                    <Separator />
                  </>
                )}

              {course.learningOutcomes && course.learningOutcomes.paragraph && (
                <>
                  <div>
                    <h5>Lärandemål</h5>
                    <p>{course.learningOutcomes.paragraph}</p>
                    {course.learningOutcomes.list_items.length > 0 && (
                      <ul className="list-disc list-inside mt-2">
                        {course.learningOutcomes.list_items.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {course.content && course.content.paragraph && (
                <>
                  <div>
                    <h5>Kursinnehåll</h5>
                    <p>{course.content.paragraph}</p>
                    {course.content.list_items.length > 0 && (
                      <ul className="list-disc list-inside mt-2">
                        {course.content.list_items.map((item, index) => (
                          <li key={index}>{item}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {course.teachingMethods && course.teachingMethods.paragraph && (
                <>
                  <div>
                    <h5>Undervisnings- och arbetsformer</h5>
                    <p>{course.teachingMethods.paragraph}</p>
                    {course.teachingMethods.list_items.length > 0 && (
                      <ul className="list-disc list-inside mt-2">
                        {course.teachingMethods.list_items.map(
                          (item, index) => (
                            <li key={index}>{item}</li>
                          )
                        )}
                      </ul>
                    )}
                  </div>
                  <Separator />
                </>
              )}

              {course.offeredFor.length > 0 && (
                <>
                  <div>
                    <h5>Kursen erbjuds för:</h5>
                    <ul>
                      {course.offeredFor.map((offeredFor: string) => (
                        <li key={offeredFor}>{offeredFor}</li>
                      ))}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </TabsContent>

          <TabsContent value="examination">
            <h5>Examination</h5>
            <ul>
              {course.examination?.map((ex, index) => (
                <li key={index}>
                  {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits}hp
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="flex flex-col gap-4">
            <h5>Skriv en recension</h5>
            <ReviewForm courseId={course.id} onReviewSubmitted={() => {}} />
            <Separator />
            {reviews.length === 0 ? (
              <p>Inga recensioner än.</p>
            ) : (
              <ReviewListMemoized
                reviews={reviews}
                onReviewDeleted={() => {}}
              />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default CustomDrawerContent;
