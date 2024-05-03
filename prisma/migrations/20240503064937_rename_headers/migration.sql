/*
  Warnings:

  - You are about to drop the column `level` on the `Courses` table. All the data in the column will be lost.
  - You are about to drop the column `studyPace` on the `Courses` table. All the data in the column will be lost.
  - The `mainFieldOfStudy` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The `exclusions` column on the `Courses` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `advanced` to the `Courses` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "level",
DROP COLUMN "studyPace",
ADD COLUMN     "advanced" BOOLEAN NOT NULL,
DROP COLUMN "mainFieldOfStudy",
ADD COLUMN     "mainFieldOfStudy" TEXT[],
DROP COLUMN "exclusions",
ADD COLUMN     "exclusions" TEXT[];
