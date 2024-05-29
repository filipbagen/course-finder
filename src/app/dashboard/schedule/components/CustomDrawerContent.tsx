import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Examination, Course, Review } from '@/app/utilities/types';
import ReviewForm from './ReviewForm';
import ReviewList from './ReviewList';
import CourseDetails from './CourseDetails';

const CustomDrawerContent = ({ course }: { course: Course }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    const fetchReviews = async () => {
      try {
        const response = await fetch(`/api/review?courseId=${course.id}`);
        if (response.ok) {
          const data = await response.json();
          setReviews(data);
        } else {
          throw new Error('Failed to fetch reviews');
        }
      } catch (error) {
        console.error('Failed to fetch reviews:', error);
      }
    };

    fetchReviews();
  }, [course.id]);

  const addReview = (newReview: Review) => {
    setReviews((prevReviews) => [newReview, ...prevReviews]);
  };

  const averageRating =
    reviews.length > 0
      ? parseFloat(
          (
            reviews.reduce((acc, review) => acc + review.rating, 0) /
            reviews.length
          ).toFixed(2)
        )
      : 0;

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
              {/* <div>
                <h5>Kursen får ej läsas med:</h5>
                <p>{course.exclusions}</p>
              </div>
              <Separator /> */}

              {course.prerequisites != 'None' && (
                <>
                  <div>
                    <h5>Förkunskaper</h5>
                    <p>{course.prerequisites}</p>
                  </div>

                  <Separator />
                </>
              )}

              {course.recommendedPrerequisites != 'None' && (
                <>
                  <div>
                    <h5>Rekommenderade förkunskaper</h5>
                    <p>{course.recommendedPrerequisites}</p>
                  </div>
                  <Separator />
                </>
              )}

              {course.learningOutcomes && (
                <>
                  <div>
                    <h5>Lärandemål</h5>
                    <p>{course.learningOutcomes}</p>
                  </div>
                  <Separator />
                </>
              )}

              {course.content && (
                <>
                  <div>
                    <h5>Kursinnehåll</h5>
                    <p>{course.content}</p>
                  </div>
                  <Separator />
                </>
              )}

              {course.teachingMethods && (
                <>
                  <div>
                    <h5>Undervisnings- och arbetsformer</h5>
                    <p>{course.teachingMethods}</p>
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
              {course.examinations?.map((ex: Examination) => (
                <li key={ex.id}>
                  {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits}hp
                </li>
              ))}
            </ul>
          </TabsContent>

          <TabsContent value="reviews" className="flex flex-col gap-4">
            <h5>Skriv en recension</h5>
            <ReviewForm courseId={course.id} addReview={addReview} />
            <Separator />
            {reviews.length === 0 ? (
              <p>Inga recensioner än.</p>
            ) : (
              <ReviewList reviews={reviews} />
            )}
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default CustomDrawerContent;
