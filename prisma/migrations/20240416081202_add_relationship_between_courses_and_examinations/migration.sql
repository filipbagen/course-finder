-- AddForeignKey
ALTER TABLE "Examinations" ADD CONSTRAINT "Examinations_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("courseId") ON DELETE RESTRICT ON UPDATE CASCADE;
