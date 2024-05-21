import { Skeleton } from '@/components/ui/skeleton';

interface SkeletonCardProps {
  variant?: 'default' | 'schedule';
}

export function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  if (variant === 'schedule') {
    return (
      <div className="bg-white rounded-lg border border-muted p-8 flex flex-col gap-4 justify-between">
        <Skeleton className="h-4 w-24" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-muted p-8 flex flex-col gap-4 justify-between min-w-80 basis-1 flex-grow h-[218px]">
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
