import { ReactNode } from 'react';

export const MaxWidthWrapper = ({
  className,
  children,
}: {
  className?: string;
  children: ReactNode;
}) => {
  return (
    <div
      className={`mx-auto w-full max-w-screen-xl px-8 md:px-20 ${className}`}
    >
      {children}
    </div>
  );
};
