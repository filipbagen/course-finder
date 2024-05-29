'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleView from '@/app/dashboard/schedule/components/ScheduleView';
import useCourseData from '../../schedule/hooks/useCourseData';
import useOtherUserData from '../../schedule/hooks/useOtherUserData';
import Statistics from '../../schedule/Statistics';
import { Separator } from '@/components/ui/separator';

type Props = {
  params: {
    id: string;
  };
};

export default function OtherUserSchedule({ params }: Props) {
  const { id } = params;
  const {
    courses,
    semesters,
    semestersP2,
    loading: coursesLoading,
  } = useCourseData(id);
  const { user, loading: userLoading, error: userError } = useOtherUserData(id);

  // if (coursesLoading || userLoading) return <div>Loading...</div>;
  // if (userError) return <div>Error loading user data</div>;

  return (
    <div className="flex flex-col gap-8">
      {user && <Statistics courses={courses} user={user} />}
      <Separator />

      <Tabs defaultValue="schedule" className="flex flex-col gap-4">
        <TabsList className="flex gap-2 w-min">
          <TabsTrigger value="schedule">Schema</TabsTrigger>
          <TabsTrigger value="reviews">Recension</TabsTrigger>
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
            <h5>Recension</h5>
            <p>Recensioner kommer snart!</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
