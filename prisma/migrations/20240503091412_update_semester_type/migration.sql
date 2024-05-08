/*
  Warnings:

  - The `semester` column on the `Enrollment` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "Enrollment" ALTER COLUMN "semester" DROP NOT NULL;
ALTER TABLE "Enrollment" ALTER COLUMN "semester" TYPE Int USING "semester"::integer;
ALTER TABLE "Enrollment" ALTER COLUMN "semester" SET NOT NULL;
