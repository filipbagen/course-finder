/*
  Warnings:

  - You are about to drop the column `location` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `url` on the `Courses` table. All the data in the column will be lost.
  - Added the required column `campus` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `content` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `learningOutcomes` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `recommendedPrerequisites` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `scheduledHours` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `selfStudyHours` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `teachingMethods` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "location",
DROP COLUMN "url",
ADD COLUMN     "campus" TEXT NOT NULL,
ADD COLUMN     "content" TEXT NOT NULL,
ADD COLUMN     "courseOfferedFor" TEXT[],
ADD COLUMN     "learningOutcomes" TEXT NOT NULL,
ADD COLUMN     "recommendedPrerequisites" TEXT NOT NULL,
ADD COLUMN     "scheduledHours" INTEGER NOT NULL,
ADD COLUMN     "selfStudyHours" INTEGER NOT NULL,
ADD COLUMN     "teachingMethods" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Review" (
    "id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "userId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,

    CONSTRAINT "Review_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Review_id_key" ON "Review"("id");

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Review" ADD CONSTRAINT "Review_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
