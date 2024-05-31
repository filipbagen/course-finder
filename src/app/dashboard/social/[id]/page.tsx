'use client';

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleView from '@/app/dashboard/schedule/components/ScheduleView';
import useCourseData from '@/app/dashboard/schedule/hooks/useCourseData';
import useOtherUserData from '@/app/dashboard/social/hooks/useOtherUserData';
import Statistics from '@/app/dashboard/schedule/Statistics';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbSeparator,
  BreadcrumbPage,
} from '@/components/ui/breadcrumb';
import { Card, CardContent } from '@/components/ui/card';
import { Star } from 'lucide-react';

type Props = {
  params: {
    id: string;
  };
};

interface Course {
  name: string;
  code: string;
}

interface Review {
  id: string;
  rating: number;
  comment: string;
  createdAt: string;
  updatedAt: string;
  userId: string;
  course: Course;
}

const OtherUserSchedule: React.FC<Props> = ({ params }) => {
  const { id } = params;
  const {
    courses,
    semesters,
    semestersP2,
    loading: coursesLoading,
  } = useCourseData(id);
  const { user, loading: userLoading, error: userError } = useOtherUserData(id);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loadingReviews, setLoadingReviews] = useState(true);
  const [reviewsError, setReviewsError] = useState<string | null>(null);

  const defaultUser = user || {
    name: '',
    image: '',
    program: '',
    colorScheme: '',
    email: '',
    isPublic: true,
    id: '',
  };

  useEffect(() => {
    const fetchUserReviews = async () => {
      try {
        const response = await fetch(`/api/review/userReview?userId=${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch reviews');
        }
        const data = await response.json();
        setReviews(data);
      } catch (error) {
        setReviewsError((error as Error).message);
      } finally {
        setLoadingReviews(false);
      }
    };

    fetchUserReviews();
  }, [id]);

  return (
    <div className="flex flex-col gap-8">
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/">Hem</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href="/dashboard/social">Användare</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{user?.name || 'Profil'}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div className="flex flex-col gap-8">
        <Statistics
          loading={coursesLoading}
          courses={courses}
          user={defaultUser}
        />

        <Separator />

        <Tabs defaultValue="schedule" className="flex flex-col gap-4">
          <TabsList className="flex gap-2 w-min">
            <TabsTrigger value="schedule">Schema</TabsTrigger>
            <TabsTrigger value="reviews">
              Recension ({reviews.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="schedule">
            <ScheduleView
              semesters={semesters}
              semestersP2={semestersP2}
              loading={coursesLoading}
              draggable={false}
            />
          </TabsContent>

          <TabsContent value="reviews">
            <div>
              {loadingReviews ? (
                <p>Loading reviews...</p>
              ) : reviewsError ? (
                <p>Error loading reviews: {reviewsError}</p>
              ) : reviews.length === 0 ? (
                <p>{user?.name} har inte lämnat någon recension än.</p>
              ) : (
                reviews.map((review: Review) => (
                  <div className="flex flex-col gap-4" key={review.id}>
                    <Card>
                      <CardContent className="flex flex-col items-start gap-2">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-center gap-2">
                            <h5 className="font-bold">{review.course.name}</h5>{' '}
                            •<span>{review.course.code}</span>
                          </div>
                          <span className="text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2 items-center">
                          <Star size={12} />
                          {review.rating}
                        </div>
                        {review.comment || 'No comment'}
                      </CardContent>
                    </Card>
                    <Separator />
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default OtherUserSchedule;
