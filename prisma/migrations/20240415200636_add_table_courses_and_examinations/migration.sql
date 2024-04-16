-- CreateTable
CREATE TABLE "Courses" (
    "courseId" TEXT NOT NULL,
    "courseCode" TEXT NOT NULL,
    "courseName" TEXT NOT NULL,
    "credits" INTEGER NOT NULL,
    "mainFieldOfStudy" TEXT NOT NULL,
    "courseLevel" TEXT NOT NULL,
    "semester" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "block" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "prerequisites" TEXT NOT NULL,
    "exclusions" TEXT NOT NULL,
    "studyPace" TEXT NOT NULL,

    CONSTRAINT "Courses_pkey" PRIMARY KEY ("courseId")
);

-- CreateTable
CREATE TABLE "Examinations" (
    "examId" TEXT NOT NULL,
    "courseId" TEXT NOT NULL,
    "examCode" TEXT NOT NULL,
    "examName" TEXT NOT NULL,
    "examCredits" INTEGER NOT NULL,
    "examGradingScale" TEXT NOT NULL,

    CONSTRAINT "Examinations_pkey" PRIMARY KEY ("examId")
);

-- CreateIndex
CREATE UNIQUE INDEX "Courses_courseId_key" ON "Courses"("courseId");

-- CreateIndex
CREATE UNIQUE INDEX "Courses_courseCode_key" ON "Courses"("courseCode");

-- CreateIndex
CREATE UNIQUE INDEX "Courses_courseName_key" ON "Courses"("courseName");

-- CreateIndex
CREATE UNIQUE INDEX "Examinations_examId_key" ON "Examinations"("examId");

-- CreateIndex
CREATE UNIQUE INDEX "Examinations_courseId_key" ON "Examinations"("courseId");
