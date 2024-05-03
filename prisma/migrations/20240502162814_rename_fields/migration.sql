/*
  Warnings:

  - The primary key for the `Courses` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `courseCode` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseId` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseLevel` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `courseName` on the `Courses` table. All the data in the column will be lost.
  - The `semester` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `period` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `block` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Enrollment` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `enrollmentId` on the `Enrollment` table. All the data in the column will be lost.
  - The primary key for the `Examinations` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `examCode` on the `Examinations` table. All the data in the column will be lost.
  - You are about to drop the column `examCredits` on the `Examinations` table. All the data in the column will be lost.
  - You are about to drop the column `examGradingScale` on the `Examinations` table. All the data in the column will be lost.
  - You are about to drop the column `examId` on the `Examinations` table. All the data in the column will be lost.
  - You are about to drop the column `examName` on the `Examinations` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id]` on the table `Courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[code]` on the table `Courses` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Enrollment` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[id]` on the table `Examinations` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `code` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `level` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Courses` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Enrollment` table without a default value. This is not possible if the table is not empty.
  - Added the required column `code` to the `Examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `credits` to the `Examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gradingScale` to the `Examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `id` to the `Examinations` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Examinations` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_courseId_fkey";

-- DropForeignKey
ALTER TABLE "Examinations" DROP CONSTRAINT "Examinations_courseId_fkey";

-- DropIndex
DROP INDEX "Courses_courseCode_key";

-- DropIndex
DROP INDEX "Courses_courseId_key";

-- DropIndex
DROP INDEX "Enrollment_enrollmentId_key";

-- DropIndex
DROP INDEX "Examinations_examId_key";

-- AlterTable
ALTER TABLE "Courses" DROP CONSTRAINT "Courses_pkey",
DROP COLUMN "courseCode",
DROP COLUMN "courseId",
DROP COLUMN "courseLevel",
DROP COLUMN "courseName",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "level" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
DROP COLUMN "semester",
ADD COLUMN     "semester" INTEGER[],
DROP COLUMN "period",
ADD COLUMN     "period" INTEGER[],
DROP COLUMN "block",
ADD COLUMN     "block" INTEGER[],
ADD CONSTRAINT "Courses_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_pkey",
DROP COLUMN "enrollmentId",
ADD COLUMN     "id" TEXT NOT NULL,
ADD CONSTRAINT "Enrollment_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Examinations" DROP CONSTRAINT "Examinations_pkey",
DROP COLUMN "examCode",
DROP COLUMN "examCredits",
DROP COLUMN "examGradingScale",
DROP COLUMN "examId",
DROP COLUMN "examName",
ADD COLUMN     "code" TEXT NOT NULL,
ADD COLUMN     "credits" INTEGER NOT NULL,
ADD COLUMN     "gradingScale" TEXT NOT NULL,
ADD COLUMN     "id" TEXT NOT NULL,
ADD COLUMN     "name" TEXT NOT NULL,
ADD CONSTRAINT "Examinations_pkey" PRIMARY KEY ("id");

-- CreateIndex
CREATE UNIQUE INDEX "Courses_id_key" ON "Courses"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Courses_code_key" ON "Courses"("code");

-- CreateIndex
CREATE UNIQUE INDEX "Enrollment_id_key" ON "Enrollment"("id");

-- CreateIndex
CREATE UNIQUE INDEX "Examinations_id_key" ON "Examinations"("id");

-- AddForeignKey
ALTER TABLE "Examinations" ADD CONSTRAINT "Examinations_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Courses"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
