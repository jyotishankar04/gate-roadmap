-- CreateTable
CREATE TABLE "StudySession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "userRoadmapId" TEXT,
    "roadmapTaskId" TEXT,
    "sessionType" TEXT NOT NULL,
    "subjectName" TEXT,
    "topicName" TEXT,
    "subtopicName" TEXT,
    "title" TEXT,
    "startedAt" TIMESTAMP(3) NOT NULL,
    "endedAt" TIMESTAMP(3),
    "durationSeconds" INTEGER NOT NULL DEFAULT 0,
    "plannedSeconds" INTEGER,
    "pausedSeconds" INTEGER NOT NULL DEFAULT 0,
    "pausedAt" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'RUNNING',
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "StudySession_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "StudySession_userId_startedAt_idx" ON "StudySession"("userId", "startedAt");

-- CreateIndex
CREATE INDEX "StudySession_userRoadmapId_idx" ON "StudySession"("userRoadmapId");

-- CreateIndex
CREATE INDEX "StudySession_roadmapTaskId_idx" ON "StudySession"("roadmapTaskId");

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_userRoadmapId_fkey" FOREIGN KEY ("userRoadmapId") REFERENCES "UserRoadmap"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "StudySession" ADD CONSTRAINT "StudySession_roadmapTaskId_fkey" FOREIGN KEY ("roadmapTaskId") REFERENCES "RoadmapTask"("id") ON DELETE SET NULL ON UPDATE CASCADE;
