import { Skeleton } from '@/components/ui/skeleton'

interface SkeletonCardProps {
  variant?: 'default' | 'schedule' | 'statistics' | 'course'
}

export function SkeletonCard({ variant = 'default' }: SkeletonCardProps) {
  if (variant === 'schedule') {
    return (
      <div className="flex flex-col justify-between gap-4 rounded-lg border border-muted bg-white p-8 dark:border-none dark:bg-card">
        <Skeleton className="h-4 w-24" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    )
  }

  if (variant === 'statistics') {
    return (
      <div className="flex h-60 flex-col justify-between gap-4 rounded-lg border border-muted bg-white p-8 dark:border-none dark:bg-card">
        <Skeleton className="h-4 w-24" />

        <div className="flex gap-4">
          <Skeleton className="h-4 w-14 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
          <Skeleton className="h-4 w-12 rounded-full" />
        </div>
      </div>
    )
  }

  if (variant === 'course') {
    return (
      <div className="flex h-full flex-col gap-4 rounded-lg border border-gray-200 bg-white p-6 dark:border-gray-700 dark:bg-card">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <Skeleton className="mb-2 h-5 w-3/4" />
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

        <div className="flex items-center justify-between border-t border-gray-200 pt-2 dark:border-gray-700">
          <div className="flex gap-4">
            <Skeleton className="h-3 w-8" />
            <Skeleton className="h-3 w-8" />
          </div>
          <Skeleton className="h-3 w-12" />
        </div>

        <Skeleton className="h-8 w-full" />
      </div>
    )
  }

  return (
    <div className="flex h-[218px] min-w-80 flex-grow basis-1 flex-col justify-between gap-4 rounded-lg border border-border p-8 dark:border-none dark:bg-card">
      <div className="flex justify-between">
        <Skeleton className="h-4 w-[250px]" />
        <Skeleton className="h-6 w-6" />
      </div>

      <Skeleton className="h-4 w-[72px]" />
      <Skeleton className="h-4 w-[128px]" />
      <Skeleton className="h-4 w-full" />
    </div>
  )
}
