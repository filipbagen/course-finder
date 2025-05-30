import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={cn(
        'mx-auto w-full min-h-screen max-w-screen-xl px-8 md:px-20',
        className
      )}
    >
      {children}
    </div>
  );
};
