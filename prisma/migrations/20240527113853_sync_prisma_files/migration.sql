/*
  Warnings:

  - You are about to drop the column `courseOfferedFor` on the `Courses` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "Courses" DROP COLUMN "courseOfferedFor",
ADD COLUMN     "offeredFor" TEXT[];
