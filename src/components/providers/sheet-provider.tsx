'use client'

import { useEffect, useState } from 'react'
import { CourseDetailsDialog } from '@/features/courses/components/CourseDetailsDialog'

export const SheetProvider = () => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    return null
  }

  return (
    <>
      <CourseDetailsDialog />
    </>
  )
}
