'use client'

import React, { useEffect, useState, useCallback } from 'react'
import { useMediaQuery } from '@/hooks/use-media-query'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
} from '@/components/ui/drawer'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useCourseDetailsSheet } from '@/features/courses/hooks/useCourseDetailsSheet'
import { useCourseDetails } from '@/features/courses/hooks/useCourseDetails'
import { Course } from '@/types/types'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { cn } from '@/lib/utils'
import { useUserEnrollments } from '@/hooks/useUserEnrollments'
import CourseReviews from './CourseReviews'
import { StarRating } from './StarRating'
import {
  BookOpen,
  Target,
  Users,
  NotebookPen,
  Calendar,
  Clock,
  User,
  School,
  SignpostBig,
  Lightbulb,
  Book,
  BarChart,
  FileText,
  ExternalLink,
  Plus,
  LogIn,
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useEnrollment } from '@/features/courses/hooks/useEnrollment'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import Link from 'next/link'

const DetailSection = ({
  icon,
  title,
  children,
  className,
}: {
  icon: React.ReactNode
  title: string
  children: React.ReactNode
  className?: string
}) => (
  <div
    className={cn(
      'rounded-xl border border-neutral-200 bg-neutral-50 p-4 transition-all hover:bg-neutral-100 dark:border-slate-700/50 dark:bg-slate-800/50 dark:hover:bg-slate-800/80',
      className,
    )}
  >
    <div className="mb-3 flex items-center gap-3">
      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="text-base font-semibold">{title}</h3>
    </div>
    <div className="prose prose-sm dark:prose-invert max-w-none pl-11 text-muted-foreground">
      {children}
    </div>
  </div>
)

interface JsonContentData {
  paragraph?: string | null
  list_items?: string[]
}

const JsonContent = ({
  data,
}: {
  data: string | JsonContentData | null | undefined
}) => {
  let parsedData: JsonContentData | null = null

  if (typeof data === 'string') {
    try {
      parsedData = JSON.parse(data) as JsonContentData
    } catch {
      parsedData = { paragraph: data, list_items: [] }
    }
  } else if (data && typeof data === 'object') {
    parsedData = data
  }

  if (!parsedData) return null

  const { paragraph, list_items } = parsedData
  const hasParagraph =
    paragraph && typeof paragraph === 'string' && paragraph.trim().length > 0
  const hasList =
    Array.isArray(list_items) &&
    list_items.some(
      (item) => typeof item === 'string' && item.trim().length > 0,
    )

  if (!hasParagraph && !hasList) return null

  return (
    <>
      {hasParagraph && <p>{paragraph}</p>}
      {hasList && list_items && (
        <ul className="ml-6 list-disc">
          {list_items
            .filter(
              (item) => typeof item === 'string' && item.trim().length > 0,
            )
            .map((item, idx) => (
              <li key={idx}>{item}</li>
            ))}
        </ul>
      )}
    </>
  )
}

const CourseDetails = ({
  course,
  reviewsData,
}: {
  course: Course
  reviewsData?: {
    averageRating: number
    count: number
  }
}) => {
  const { enrolledCourses: _enrolledCourses, loading: _loading } =
    useUserEnrollments()

  return (
    <div className="space-y-6">
      {/* Course Header Info */}
      <div className="rounded-2xl border border-neutral-200 bg-gradient-to-br from-primary/5 to-primary/10 p-5 dark:border-slate-700/50 dark:from-primary/10 dark:to-primary/5">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Kurskod
            </p>
            <p className="text-lg font-medium">{course.code}</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Poäng
            </p>
            <p className="text-lg font-medium">{Number(course.credits)} hp</p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Nivå
            </p>
            <p className="font-medium">
              {course.advanced ? 'Avancerad' : 'Grundnivå'}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
              Kurstyp
            </p>
            <p className="font-medium">
              {course.courseType || 'Information saknas'}
            </p>
          </div>

          {/* Rating information if available */}
          {reviewsData && reviewsData.count > 0 && (
            <div className="col-span-2 mt-2 border-t border-neutral-200 pt-3 dark:border-slate-700/50">
              <p className="mb-1 text-xs uppercase tracking-wider text-muted-foreground">
                Betyg från studenter
              </p>
              <div className="flex flex-row items-center gap-2">
                <StarRating
                  initialValue={reviewsData.averageRating}
                  size={20}
                  allowFraction
                  readonly
                  fillColor="#ffd700"
                  emptyColor="#e4e5e9"
                  className="flex-shrink-0"
                />
                <span className="ml-2 font-medium">
                  {reviewsData.averageRating.toFixed(1)} ({reviewsData.count}{' '}
                  {reviewsData.count === 1 ? 'recension' : 'recensioner'})
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        {/* Course Main Fields */}
        <DetailSection
          icon={<SignpostBig className="h-4 w-4 text-primary" />}
          title="Huvudområden"
        >
          <div className="flex flex-wrap gap-2">
            {course.mainFieldOfStudy && course.mainFieldOfStudy.length > 0 ? (
              course.mainFieldOfStudy.map((field) => (
                <Badge key={field} variant="default" className="rounded-full">
                  {field}
                </Badge>
              ))
            ) : (
              <p>Inget huvudområde specificerat.</p>
            )}
          </div>
        </DetailSection>

        {/* Campus and Examinator side by side on mobile */}
        <div className="grid grid-cols-2 gap-4 md:contents">
          {/* Campus Info */}
          <DetailSection icon={<School className="h-4 w-4" />} title="Campus">
            <p>{course.campus || 'Information saknas'}</p>
          </DetailSection>

          {/* Examiner Info */}
          <DetailSection icon={<User className="h-4 w-4" />} title="Examinator">
            <p>{course.examiner || 'Information saknas'}</p>
          </DetailSection>
        </div>

        {/* Time Info */}
        <DetailSection icon={<Clock className="h-4 w-4" />} title="Tidsåtgång">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-xs text-muted-foreground">Schemalagd tid</p>
              <p className="font-medium">
                {course.scheduledHours
                  ? `${Number(course.scheduledHours)}h`
                  : 'Okänt'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Självstudier</p>
              <p className="font-medium">
                {course.selfStudyHours
                  ? `${Number(course.selfStudyHours)}h`
                  : 'Okänt'}
              </p>
            </div>
          </div>
        </DetailSection>

        {/* Schedule Info */}
        <DetailSection
          icon={<Calendar className="h-4 w-4" />}
          title="Schema"
          className="md:col-span-2"
        >
          <div className="grid grid-cols-3 gap-2">
            <div>
              <p className="text-xs text-muted-foreground">Termin</p>
              <p className="font-medium">
                {course.semester?.length > 0
                  ? `${course.semester.join(', ')}`
                  : 'T?'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Period</p>
              <p className="font-medium">
                {course.period?.length > 0
                  ? `${course.period.join('+')}`
                  : 'P?'}
              </p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Block</p>
              <p className="font-medium">
                {course.block?.length > 0
                  ? `${course.block.join(', ')}`
                  : 'Block ?'}
              </p>
            </div>
          </div>
        </DetailSection>
      </div>

      <Separator className="bg-neutral-200 dark:bg-slate-700" />

      <div className="space-y-4">
        <h2 className="text-xl font-bold">Detaljer</h2>

        {/* Lärandemål */}
        {(() => {
          const content = <JsonContent data={course.learningOutcomes} />
          return (
            content && (
              <DetailSection
                icon={<Target className="h-4 w-4" />}
                title="Lärandemål"
              >
                {content}
              </DetailSection>
            )
          )
        })()}

        {/* Kursinnehåll */}
        {(() => {
          const content = <JsonContent data={course.content} />
          return (
            content && (
              <DetailSection
                icon={<BookOpen className="h-4 w-4" />}
                title="Kursinnehåll"
              >
                {content}
              </DetailSection>
            )
          )
        })()}

        {/* Undervisningsformer */}
        {(() => {
          const content = <JsonContent data={course.teachingMethods} />
          return (
            content && (
              <DetailSection
                icon={<Lightbulb className="h-4 w-4" />}
                title="Undervisningsformer"
              >
                {content}
              </DetailSection>
            )
          )
        })()}

        {/* Förkunskaper */}
        {(() => {
          let parsedData: { paragraph: string | null; list_items: string[] } = {
            paragraph: null,
            list_items: [],
          }
          if (typeof course.prerequisites === 'string') {
            try {
              const parsed = JSON.parse(course.prerequisites)
              parsedData = {
                paragraph:
                  typeof parsed.paragraph === 'string'
                    ? parsed.paragraph
                    : null,
                list_items: Array.isArray(parsed.list_items)
                  ? parsed.list_items
                  : [],
              }
            } catch {
              parsedData = { paragraph: course.prerequisites, list_items: [] }
            }
          } else if (
            typeof course.prerequisites === 'object' &&
            course.prerequisites !== null
          ) {
            parsedData = {
              paragraph:
                typeof course.prerequisites.paragraph === 'string'
                  ? course.prerequisites.paragraph
                  : null,
              list_items: Array.isArray(course.prerequisites.list_items)
                ? course.prerequisites.list_items
                : [],
            }
          }
          const hasParagraph =
            parsedData.paragraph && parsedData.paragraph.trim().length > 0
          const hasList = parsedData.list_items.some(
            (item: unknown) =>
              typeof item === 'string' && item.trim().length > 0,
          )
          if (!hasParagraph && !hasList) return null
          return (
            <DetailSection
              icon={<Book className="h-4 w-4" />}
              title="Förkunskaper"
            >
              <JsonContent data={parsedData} />
            </DetailSection>
          )
        })()}

        {/* Rekommenderade förkunskaper */}
        {(() => {
          const content = <JsonContent data={course.recommendedPrerequisites} />
          return (
            content && (
              <DetailSection
                icon={<BarChart className="h-4 w-4" />}
                title="Rekommenderade förkunskaper"
              >
                {content}
              </DetailSection>
            )
          )
        })()}

        {/* Examination */}
        <DetailSection
          icon={<NotebookPen className="h-4 w-4" />}
          title="Examination"
        >
          {Array.isArray(course.examination) &&
          course.examination.length > 0 ? (
            <ul className="space-y-2">
              {course.examination.map((exam, index) => (
                <li key={index} className="rounded-lg bg-white/5 p-2 text-sm">
                  <div className="font-medium">{exam.name}</div>
                  <div className="mt-1 flex justify-between text-xs">
                    <span>{Number(exam.credits)} hp</span>
                    <span>Betygsskala: {exam.gradingScale}</span>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p>Information saknas.</p>
          )}
        </DetailSection>

        {/* Ges för */}
        <DetailSection icon={<Users className="h-4 w-4" />} title="Ges för">
          <div className="flex flex-wrap gap-2">
            {course.offeredFor && course.offeredFor.length > 0 ? (
              course.offeredFor.map((program) => (
                <Badge key={program} variant="default" className="rounded-full">
                  {program}
                </Badge>
              ))
            ) : (
              <p>Information saknas.</p>
            )}
          </div>
        </DetailSection>

        {/* Kursplan Link */}
        <DetailSection icon={<FileText className="h-4 w-4" />} title="Kursplan">
          <a
            href={`https://studieinfo.liu.se/kurs/${course.code}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 rounded-lg bg-primary/5 p-2 text-primary transition-colors hover:bg-primary/10 hover:underline"
          >
            Se kursplan på LiU.se <ExternalLink className="h-4 w-4" />
          </a>
        </DetailSection>
      </div>
    </div>
  )
}

export const CourseDetailsDialog = () => {
  const [open, setOpen] = useState(false)
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [reviewsData, setReviewsData] = useState<{
    averageRating: number
    count: number
  }>({
    averageRating: 0,
    count: 0,
  })
  const isDesktop = useMediaQuery('(min-width: 768px)')

  const {
    isOpen,
    onClose,
    course,
    courseId,
    loading: storeLoading,
    error: storeError,
    setLoading,
    setError,
    setCourse,
  } = useCourseDetailsSheet()

  const {
    fetchCourseDetails,
    loading: fetchLoading,
    error: fetchError,
  } = useCourseDetails()

  const loading = storeLoading || fetchLoading
  const error = storeError || fetchError

  // Move useEnrollment hook outside of callback
  const { addToEnrollment } = useEnrollment(course?.name || '')

  useEffect(() => {
    if (isOpen && courseId && course) {
      const loadDetailedCourseInfo = async () => {
        setLoading(true)
        setError(null)

        try {
          if (!course.learningOutcomes || !course.examination) {
            const detailedCourse = await fetchCourseDetails(courseId)
            if (detailedCourse) {
              setCourse(detailedCourse)
            }
          }
        } catch {
          setError('Kunde inte ladda kursinformation.')
        } finally {
          setLoading(false)
        }
      }

      loadDetailedCourseInfo()
    }
  }, [
    isOpen,
    courseId,
    course,
    fetchCourseDetails,
    setCourse,
    setLoading,
    setError,
  ])

  useEffect(() => {
    setOpen(isOpen)
  }, [isOpen])

  const handleClose = useCallback(() => {
    setOpen(false)
    onClose()
  }, [onClose])

  // Function to update review data
  const updateReviewData = useCallback(
    (averageRating: number, count: number) => {
      // Only update if the values have actually changed
      if (
        reviewsData.averageRating !== averageRating ||
        reviewsData.count !== count
      ) {
        setReviewsData({ averageRating, count })
      }
    },
    [reviewsData.averageRating, reviewsData.count],
  )

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setIsAuthenticated(!!user)
    }

    checkAuth()
  }, [])

  // Enrollment Button Component
  const EnrollmentButton = useCallback(
    ({ course }: { course: Course }) => {
      // If user is not authenticated, show login button
      if (!isAuthenticated) {
        return (
          <Button asChild size="sm" variant="outline" className="h-8 w-8 p-0">
            <Link
              href="/login"
              onClick={(e: React.MouseEvent) => {
                e.stopPropagation()
                handleClose()
              }}
            >
              <LogIn className="h-4 w-4" />
            </Link>
          </Button>
        )
      }

      // Handle enrollment for authenticated users
      const handleEnrollment = (semester?: number | number[]) => {
        if (!addToEnrollment) return

        // Extract a usable semester value
        let targetSemester: number

        if (typeof semester === 'number') {
          // If it's already a number, use it directly
          targetSemester = semester
        } else if (Array.isArray(semester) && semester.length > 0) {
          // Use the first semester from the array
          targetSemester = semester[0] ?? 1
        } else if (
          course.semester &&
          Array.isArray(course.semester) &&
          course.semester.length > 0
        ) {
          // Fallback to the course's first semester
          targetSemester = course.semester[0] ?? 1
        } else {
          // Default fallback
          targetSemester = 1
        }

        addToEnrollment(course.id, targetSemester)
      }

      // If course has multiple semesters, show dropdown
      if (course.semester && course.semester.length > 1) {
        return (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" className="h-8 w-8 cursor-pointer p-0">
                <Plus className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {course.semester.map((semester) => (
                <DropdownMenuItem
                  key={semester}
                  className="cursor-pointer"
                  onClick={(e: React.MouseEvent) => {
                    e.stopPropagation()
                    handleEnrollment(semester)
                  }}
                >
                  Lägg till i termin {semester}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
        )
      }

      // Single semester or default case
      return (
        <Button
          size="sm"
          onClick={(e: React.MouseEvent) => {
            e.stopPropagation()
            handleEnrollment(course.semester)
          }}
          className="h-8 w-8 p-0"
        >
          <Plus className="h-4 w-4" />
        </Button>
      )
    },
    [isAuthenticated, handleClose, addToEnrollment],
  )

  if (isDesktop) {
    return (
      <Dialog open={open} onOpenChange={handleClose}>
        <DialogContent
          className="flex h-full max-h-[90vh] max-w-4xl flex-col overflow-hidden shadow-2xl"
          onEscapeKeyDown={(e) => {
            // Use escape key to close
            e.preventDefault()
            handleClose()
          }}
        >
          <DialogHeader className="mb-6 pt-6">
            {course && (
              <>
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <DialogTitle className="text-2xl font-bold">
                      {course.name}
                    </DialogTitle>
                    <DialogDescription className="sr-only">
                      Kursinformation och recensioner
                    </DialogDescription>
                    {!loading && (
                      <div className="mt-2 flex items-center gap-2">
                        {reviewsData.count > 0 && (
                          <>
                            <div className="flex flex-row items-center gap-1">
                              <StarRating
                                initialValue={reviewsData.averageRating}
                                size={18}
                                allowFraction
                                readonly
                                fillColor="#ffd700"
                                emptyColor="#e4e5e9"
                                className="flex-shrink-0"
                              />
                              <span className="ml-2 text-sm text-muted-foreground">
                                {reviewsData.averageRating.toFixed(1)} (
                                {reviewsData.count}{' '}
                                {reviewsData.count === 1
                                  ? 'recension'
                                  : 'recensioner'}
                                )
                              </span>
                            </div>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                  <EnrollmentButton course={course} />
                </div>
              </>
            )}
          </DialogHeader>

          <div className="flex-1 overflow-y-auto">
            {loading && (
              <div className="flex h-full items-center justify-center">
                <p className="text-lg">Laddar kursinformation...</p>
              </div>
            )}
            {error && (
              <div className="flex h-full items-center justify-center">
                <p className="text-lg text-red-500">{error}</p>
              </div>
            )}
            {!loading && !error && course && (
              <div className="space-y-6 p-6">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="mb-6 grid grid-cols-2">
                    <TabsTrigger value="info">Kursinformation</TabsTrigger>
                    <TabsTrigger value="reviews">
                      Recensioner{' '}
                      {reviewsData.count > 0 && `(${reviewsData.count})`}
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="info" className="space-y-8">
                    <CourseDetails course={course} reviewsData={reviewsData} />
                  </TabsContent>

                  <TabsContent value="reviews">
                    <CourseReviews
                      courseId={course.id.toString()}
                      onReviewDataUpdate={updateReviewData}
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Drawer
      open={open}
      onOpenChange={handleClose}
      onClose={() => handleClose()}
    >
      <DrawerContent className="h-full max-h-[90vh] shadow-2xl">
        <DrawerHeader className="pt-6 text-left">
          {course && (
            <>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DrawerTitle className="text-xl font-bold">
                    {course.name}
                  </DrawerTitle>
                  <DrawerDescription className="sr-only">
                    Kursinformation och recensioner
                  </DrawerDescription>
                  {!loading && (
                    <div className="mt-2 flex items-center gap-2">
                      {reviewsData.count > 0 && (
                        <>
                          <div className="flex flex-row items-center gap-1">
                            <StarRating
                              initialValue={reviewsData.averageRating}
                              size={16}
                              allowFraction
                              readonly
                              fillColor="#ffd700"
                              emptyColor="#e4e5e9"
                              className="flex-shrink-0"
                            />
                            <span className="ml-2 text-sm text-muted-foreground">
                              {reviewsData.averageRating.toFixed(1)} (
                              {reviewsData.count}{' '}
                              {reviewsData.count === 1
                                ? 'recension'
                                : 'recensioner'}
                              )
                            </span>
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                <EnrollmentButton course={course} />
              </div>
            </>
          )}
        </DrawerHeader>

        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {loading && (
            <div className="flex h-full items-center justify-center">
              <p className="text-lg">Laddar kursinformation...</p>
            </div>
          )}
          {error && (
            <div className="flex h-full items-center justify-center">
              <p className="text-lg text-red-500">{error}</p>
            </div>
          )}
          {!loading && !error && course && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="mb-6 grid grid-cols-2">
                  <TabsTrigger value="info">Kursinformation</TabsTrigger>
                  <TabsTrigger value="reviews">
                    Recensioner{' '}
                    {reviewsData.count > 0 && `(${reviewsData.count})`}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-6">
                  <CourseDetails course={course} reviewsData={reviewsData} />
                </TabsContent>

                <TabsContent value="reviews">
                  <CourseReviews
                    courseId={course.id.toString()}
                    onReviewDataUpdate={updateReviewData}
                  />
                </TabsContent>
              </Tabs>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
