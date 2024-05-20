'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ScheduleView from '@/app/dashboard/schedule/components/ScheduleView';
import useCourseData from '../../schedule/hooks/useCourseData';

type Props = {
  params: {
    id: string;
  };
};

export default function OtherUserSchedule({ params }: Props) {
  const { id } = params;

  const { courses, semesters, semestersP2, loading } = useCourseData(id);

  return (
    <div className="flex flex-col gap-4">
      <Tabs defaultValue="schedule" className="flex flex-col gap-4">
        <TabsList className="flex gap-2 w-min">
          <TabsTrigger value="schedule">Schedule</TabsTrigger>
          <TabsTrigger value="reviews">Reviews (12)</TabsTrigger>
        </TabsList>

        <TabsContent value="schedule">
          <div className="flex flex-col gap-6">
            <ScheduleView
              courses={courses}
              semesters={semesters}
              semestersP2={semestersP2}
              loading={loading}
              draggable={false} // Disable drag-and-drop
            />
          </div>
        </TabsContent>

        <TabsContent value="reviews">
          <div>
            <h5>Reviews</h5>
            <p>Reviews coming soon...</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

{
  /* <ul>
  {coursesWithEnrollmentSemester.map((course) => (
    <li key={course.id}>
      {course.name} (Semester: {course.semester})
    </li>
  ))}
</ul> */
}
