// shadcn
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { toast } from 'sonner';

// icons
import {
  MapPin,
  BookText,
  SignpostBig,
  NotebookPen,
  GripVertical,
  Trash2,
} from 'lucide-react';
import { Course } from '@/app/utilities/types';

interface CourseWithEnrollment extends Course {
  enrollmentId: string;
}

export default function CourseCardSchedule({
  course,
}: {
  course: CourseWithEnrollment;
}) {
  const deleteEnrollment = async (enrollmentId: string) => {
    try {
      console.log('Attempting to delete enrollment with ID:', enrollmentId);
      const response = await fetch('/api/enrollment', {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enrollmentId }), // Pass enrollmentId
      });
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      toast.success(`Removed enrollment ID ${enrollmentId} from schedule`);
    } catch (error) {
      console.error('Failed to delete enrollment:', error);
      toast.error(
        `Failed to remove enrollment ID ${enrollmentId} from schedule`
      );
    }
  };

  return (
    <Card key={course.id} className="flex-grow h-min">
      <CardHeader className="flex flex-row justify-between items-center">
        <div className="flex flex-row gap-4 items-center">
          <GripVertical size={18} />
          <h6>{course.name}</h6>
        </div>
        <Trash2
          onClick={() => {
            deleteEnrollment(course.enrollmentId); // Use enrollmentId here
          }}
          color="red"
          size={18}
          style={{ cursor: 'pointer' }}
        />
      </CardHeader>
    </Card>
  );
}
