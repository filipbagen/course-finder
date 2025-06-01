import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  variant?: 'default' | 'schedule' | 'statistics' | 'course';
}

export function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  if (variant === 'schedule') {
    return (
      <div className="bg-white rounded-lg border border-muted p-8 flex flex-col gap-4 justify-between dark:bg-card dark:border-none">
        <Skeleton className="h-4 w-24" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'statistics') {
    return (
      <div className="bg-white h-60 rounded-lg border border-muted p-8 flex flex-col gap-4 justify-between dark:bg-card dark:border-none">
        <Skeleton className="h-4 w-24" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  if (variant === 'course') {
    return (
      <div className="h-full bg-white rounded-lg border border-gray-200 p-6 flex flex-col gap-4 dark:bg-card dark:border-gray-700">
        <div className="flex justify-between items-start">
          <div className="flex-1">
            <Skeleton className="h-5 w-3/4 mb-2" />
            <Skeleton className="h-4 w-20" />
          </div>
          <div className="flex flex-col gap-1">
            <Skeleton className="h-6 w-12 rounded-full" />
            <Skeleton className="h-4 w-16 rounded-full" />
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-32" />
          </div>
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-4" />
            <Skeleton className="h-4 w-24" />
          </div>
        </div>

        <div className="flex justify-between items-center pt-2 border-t border-gray-200 dark:border-gray-700">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>

        <Skeleton className="h-8 w-full" />
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-border p-8 flex flex-col gap-4 justify-between min-w-80 basis-1 flex-grow h-[218px] dark:bg-card dark:border-none">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-6 w-6" />
      </div>

      <Skeleton className="h-4 w-[72px]" />
      <Skeleton className="h-4 w-[128px]" />
      <Skeleton className="h-4 w-full" />
    </div>
  );
}
