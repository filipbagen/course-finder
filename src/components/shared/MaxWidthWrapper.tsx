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
      className={cn('mx-auto w-full min-h-screen px-8 md:px-20', className)}
      style={{ maxWidth: '1448px' }}
    >
      {children}
    </div>
  );
};
