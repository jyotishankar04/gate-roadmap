-- CreateEnum
CREATE TYPE "ProgressStatus" AS ENUM ('NOT_STARTED', 'IN_PROGRESS', 'COMPLETED', 'BEHIND', 'FAST_PACED', 'PUT_TO_REVISE');

-- CreateEnum
CREATE TYPE "RoadmapPhase" AS ENUM ('STUDYING', 'REVISION');

-- CreateEnum
CREATE TYPE "TaskType" AS ENUM ('LECTURE', 'NOTES', 'PRACTICE', 'PYQ', 'REVISION', 'TEST', 'MOCK', 'MOCK_ANALYSIS', 'FORMULA_REVISION', 'MISTAKE_ANALYSIS');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'VERY_HIGH');

-- CreateEnum
CREATE TYPE "RoadmapStatus" AS ENUM ('ACTIVE', 'PAUSED', 'COMPLETED', 'ARCHIVED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserRoadmap" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3) NOT NULL,
    "totalDays" INTEGER NOT NULL,
    "studyingDays" INTEGER NOT NULL,
    "revisionDays" INTEGER NOT NULL,
    "status" "RoadmapStatus" NOT NULL DEFAULT 'ACTIVE',
    "overallProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "studyingProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "revisionProgress" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserRoadmap_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapDay" (
    "id" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "dayNumber" INTEGER NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "phase" "RoadmapPhase" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "subjectName" TEXT,
    "completionPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapDay_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RoadmapTask" (
    "id" TEXT NOT NULL,
    "roadmapDayId" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "topicName" TEXT,
    "subtopicName" TEXT,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "taskType" "TaskType" NOT NULL,
    "estimatedMinutes" INTEGER NOT NULL DEFAULT 30,
    "actualMinutes" INTEGER,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "order" INTEGER NOT NULL DEFAULT 0,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "selfRating" INTEGER,
    "notes" TEXT,
    "plannedDate" TIMESTAMP(3) NOT NULL,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoadmapTask_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubjectProgress" (
    "id" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "totalTopics" INTEGER NOT NULL DEFAULT 0,
    "completedTopics" INTEGER NOT NULL DEFAULT 0,
    "totalSubtopics" INTEGER NOT NULL DEFAULT 0,
    "completedSubtopics" INTEGER NOT NULL DEFAULT 0,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION,
    "lastStudiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubjectProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicProgress" (
    "id" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "totalSubtopics" INTEGER NOT NULL DEFAULT 0,
    "completedSubtopics" INTEGER NOT NULL DEFAULT 0,
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION,
    "lastStudiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SubtopicProgress" (
    "id" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "subjectName" TEXT NOT NULL,
    "topicName" TEXT NOT NULL,
    "subtopicName" TEXT NOT NULL,
    "plannedDate" TIMESTAMP(3),
    "status" "ProgressStatus" NOT NULL DEFAULT 'NOT_STARTED',
    "progressPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "confidenceScore" DOUBLE PRECISION,
    "revisionPriority" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "lastStudiedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubtopicProgress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestAttempt" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "testType" TEXT NOT NULL,
    "subjectName" TEXT,
    "score" DOUBLE PRECISION NOT NULL,
    "totalMarks" DOUBLE PRECISION NOT NULL,
    "accuracy" DOUBLE PRECISION,
    "timeTakenMinutes" INTEGER,
    "mistakes" JSONB,
    "weakTopics" JSONB,
    "notes" TEXT,
    "attemptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "TestAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "StudyLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRoadmapId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "minutesStudied" INTEGER NOT NULL DEFAULT 0,
    "tasksCompleted" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudyLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");

-- CreateIndex
CREATE INDEX "RoadmapDay_userRoadmapId_date_idx" ON "RoadmapDay"("userRoadmapId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "RoadmapDay_userRoadmapId_dayNumber_key" ON "RoadmapDay"("userRoadmapId", "dayNumber");

-- CreateIndex
CREATE INDEX "RoadmapTask_userRoadmapId_plannedDate_idx" ON "RoadmapTask"("userRoadmapId", "plannedDate");

-- CreateIndex
CREATE INDEX "RoadmapTask_userRoadmapId_subjectName_idx" ON "RoadmapTask"("userRoadmapId", "subjectName");

-- CreateIndex
CREATE INDEX "RoadmapTask_userRoadmapId_topicName_idx" ON "RoadmapTask"("userRoadmapId", "topicName");

-- CreateIndex
CREATE INDEX "RoadmapTask_userRoadmapId_subtopicName_idx" ON "RoadmapTask"("userRoadmapId", "subtopicName");

-- CreateIndex
CREATE UNIQUE INDEX "SubjectProgress_userRoadmapId_subjectName_key" ON "SubjectProgress"("userRoadmapId", "subjectName");

-- CreateIndex
CREATE UNIQUE INDEX "TopicProgress_userRoadmapId_subjectName_topicName_key" ON "TopicProgress"("userRoadmapId", "subjectName", "topicName");

-- CreateIndex
CREATE UNIQUE INDEX "SubtopicProgress_userRoadmapId_subjectName_topicName_subtop_key" ON "SubtopicProgress"("userRoadmapId", "subjectName", "topicName", "subtopicName");

-- CreateIndex
CREATE UNIQUE INDEX "StudyLog_userId_userRoadmapId_date_key" ON "StudyLog"("userId", "userRoadmapId", "date");

-- AddForeignKey
ALTER TABLE "UserRoadmap" ADD CONSTRAINT "UserRoadmap_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapDay" ADD CONSTRAINT "RoadmapDay_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTask" ADD CONSTRAINT "RoadmapTask_roadmapDayId_fkey" FOREIGN KEY ("roadmapDayId") REFERENCES "RoadmapDay"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoadmapTask" ADD CONSTRAINT "RoadmapTask_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubjectProgress" ADD CONSTRAINT "SubjectProgress_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicProgress" ADD CONSTRAINT "TopicProgress_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SubtopicProgress" ADD CONSTRAINT "SubtopicProgress_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestAttempt" ADD CONSTRAINT "TestAttempt_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudyLog" ADD CONSTRAINT "StudyLog_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE CASCADE ON UPDATE CASCADE;
