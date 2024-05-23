import { useState, useEffect } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Card,
  CardHeader,
  CardContent,
  CardDescription,
  CardFooter,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Star, MessageSquare, MapPin } from 'lucide-react';
import { Examination, Course, Review } from '@/app/utilities/types';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import ReactStars from 'react-stars';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

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
        <label>Rating:</label>
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
          placeholder="Write your review here."
          onChange={(e) => setComment(e.target.value)}
        />
      </div>
      <Button type="submit">Submit Review</Button>
      {error && <p className="text-red-500">{error}</p>}
    </form>
  );
};

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
        <Card key={course.id} className="flex-grow h-min">
          <CardHeader>
            <div className="flex justify-between">
              <div>
                <h2>{course.name}</h2>
                <CardDescription className="mt-0">
                  {course.code}
                </CardDescription>
              </div>

              <Button
                size="icon"
                aria-label={`Add ${course.name} to your schedule`}
              >
                +
              </Button>
            </div>
          </CardHeader>
          <CardContent className="flex flex-col gap-2">
            <div className="flex gap-2 items-center">
              <MapPin size={16} />
              <p className="[&:not(:first-child)]:mt-0">{course.location}</p>
            </div>

            <div className="flex gap-4">
              <div>
                <p>Termin {course.semester.join(', ')}</p>
              </div>
              <div>
                <p>Period {course.period.join(', ')}</p>
              </div>
              <div>
                <p>Block {course.block.join(', ')}</p>
              </div>
            </div>
            <div className="flex gap-2">
              {course.mainFieldOfStudy.length > 0 ? (
                course.mainFieldOfStudy.map((field) => (
                  <Badge key={field}>{field}</Badge>
                ))
              ) : (
                <Badge>Inget huvudområde</Badge>
              )}
            </div>

            <CardFooter className="flex flex-row gap-4">
              <div className="flex gap-1 items-center">
                <Star size={12} />
                {averageRating}
              </div>

              <div className="flex gap-1 items-center">
                <MessageSquare size={12} />
                {reviews.length}
              </div>
            </CardFooter>
          </CardContent>
        </Card>

        <Tabs defaultValue="about" className="flex flex-col gap-4">
          <TabsList className="flex gap-2 w-min">
            <TabsTrigger value="about">About</TabsTrigger>
            <TabsTrigger value="examination">Examination</TabsTrigger>
            <TabsTrigger value="reviews">
              Reviews ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="about">
            <div className="flex flex-col gap-6">
              <div>
                <h5>Särskild information</h5>
                <p>
                  Denna kurs krockar inte med någon kurs du lagt till i ditt
                  schema.
                </p>
              </div>

              <Separator />

              <div>
                <h5>Rekommenderade förkunskaper</h5>
                <p>{course.prerequisites}</p>
              </div>

              <Separator />

              <div>
                <h5>Lärandemål</h5>
                <p>Studentens lärandemål:</p>
                <ul>
                  <li>
                    Att analysera effektiviteten hos olika möjliga lösningar på
                    ett problem för att avgöra vilken som är tillräckligt
                    effektivt för en given situation.
                  </li>
                  <li>
                    Att jämföra olika problem med avseende på svårighetsgrad.
                  </li>
                  <li>
                    Att använda teknik för algoritmdesign som giriga algoritmer,
                    dynamisk programmering, söndra och härska samt sökning för
                    att skapa algoritmer för att lösa givna problem.
                  </li>
                  <li>
                    Strategier för att testa och debugga algoritmer och
                    datastrukturer.
                  </li>
                  <li>
                    Att snabbt och korrekt implementera algoritmer och
                    datastrukturer.
                  </li>
                  <li>
                    Att kommunicera och samarbeta med andra studenter vid
                    problemlösning i grupp.
                  </li>
                </ul>
              </div>

              <Separator />

              <div>
                <h5>Kursinnehåll</h5>
                <p>
                  För att framgångsrikt lösa datavetenskapliga problem krävs en
                  solid teoretisk grund samt förmågan att applicera teorierna
                  vid praktisk problemlösning. Målet med den här kursen är att
                  utveckla förmågan att lösa komplicerade algoritmiska problem
                  genom att utnyttja kunskaper om algoritmer, data strukturer
                  och komplexitetsteori. För att lösa den här typen av problem
                  är det viktigt att kunna analysera problemet, välja eller
                  designa en algoritm, avgöra hur mycket resursers (tid och
                  minne) algoritmen kräver samt att implementera och testa
                  algoritmen snabbt och korrekt. I den här kursen tränas detta
                  genom att lösa uppgifter och att arbeta under tidspress under
                  problemlösningstillfällen. Kursen innehåller också
                  tävlingsmoment där studenterna enskilt eller i grupp ska lösa
                  algoritmiska problem under tidspress och med begränsade
                  resurser.Syftet är att studenterna ska kunna använda
                  programmering och algoritmer som ett effektivt verktyg för
                  problemlösning samt få en möjlighet att tillämpa teoretiska
                  kunskaper från andra kurser för att lösa praktiska problem.
                </p>
              </div>

              <Separator />

              <div>
                <h5>Undervisnings- och arbetsformer</h5>
                <p>
                  Kursen består av seminarier och laborationer. Seminarierna
                  används för att gå igenom hemuppgifter, algoritmer och
                  algoritmisk problemlösning. Några av laborationerna är
                  särskilda problemlösningssessioner där studenterna ska lösa så
                  många problem som möjligt från en uppsättning problem.
                </p>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="reviews" className="flex flex-col gap-4">
            <h5>Leave a review</h5>
            <ReviewForm courseId={course.id} addReview={addReview} />

            <Separator />

            {reviews.length === 0 ? (
              <p>No reviews yet.</p>
            ) : (
              <div className="flex flex-col gap-4">
                <h5>Reviews</h5>
                {reviews.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="flex flex-col items-start gap-2">
                      <div className="flex flex-row items-center gap-4">
                        <Avatar className="h-10 w-10 rounded-full">
                          {review.user?.image ? (
                            <AvatarImage
                              src={review.user.image}
                              alt={review.user.name}
                            />
                          ) : (
                            <AvatarFallback>
                              {review.user.name.charAt(0).toUpperCase()}
                            </AvatarFallback>
                          )}
                        </Avatar>
                        <div className="flex flex-col gap-1">
                          <span className="font-bold">{review.user.name}</span>
                          <span className="text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex gap-2 items-center">
                        <Star size={12} />
                        {review.rating}
                      </div>

                      {review.comment ? review.comment : 'No comment'}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="examination">
            <div>
              <h5>Examination</h5>
              <ul>
                {course.examinations?.map((ex: Examination) => (
                  <li key={ex.id}>
                    {ex.name}, {ex.code}, {ex.gradingScale}, {ex.credits}hp
                  </li>
                ))}
              </ul>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </ScrollArea>
  );
};

export default CustomDrawerContent;
