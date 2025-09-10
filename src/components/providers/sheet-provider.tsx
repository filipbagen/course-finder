'use client';

import { useEffect, useState } from 'react';
import { CourseDetailsDialog } from '@/components/course/CourseDetailsDialog';

export const SheetProvider = () => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    return null;
  }

  return (
    <>
      <CourseDetailsDialog />
    </>
  );
};
