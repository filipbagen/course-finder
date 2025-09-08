'use client';

import { useEffect, useState } from 'react';
import { CourseDetailsSheet } from '@/components/course/CourseDetailsSheet';

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
      <CourseDetailsSheet />
    </>
  );
};
