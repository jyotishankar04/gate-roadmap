"use server";

import { subDays } from "date-fns";
import { prisma } from "@/lib/db";
import { today } from "@/lib/dates";
import { recalculateRoadmapProgress } from "@/lib/progress";
import {
  displayGateSubjectName,
  normalizeGateSubjectName,
  recommendedSubjectOrder,
} from "@/lib/roadmap/sheet-calculator";

async function getActiveRoadmapRecord(userId: string) {
  return prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

export async function getBehindTopics(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await recalculateRoadmapProgress(prisma, roadmap.id);

  const rows = await prisma.subtopicProgress.findMany({
    where: {
      userRoadmapId: roadmap.id,
      status: "BEHIND",
    },
  });
  const orderMap = new Map<string, number>(recommendedSubjectOrder.map((subject, index) => [subject, index]));
  return rows.sort((left, right) => {
    const leftOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(left.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(right.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;
    const leftDate = left.plannedDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    const rightDate = right.plannedDate?.getTime() ?? Number.MAX_SAFE_INTEGER;
    return leftDate - rightDate;
  });
}

export async function getWeakTopics(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await recalculateRoadmapProgress(prisma, roadmap.id);

  return prisma.subtopicProgress.findMany({
    where: {
      userRoadmapId: roadmap.id,
      OR: [{ status: "PUT_TO_REVISE" }, { confidenceScore: { lte: 40 } }],
    },
    orderBy: [{ revisionPriority: "desc" }, { updatedAt: "desc" }],
    take: 12,
  });
}

export async function getStudyStreak(userId: string) {
  const logs = await prisma.studyLog.findMany({
    where: { userId, OR: [{ tasksCompleted: { gt: 0 } }, { minutesStudied: { gt: 0 } }] },
    orderBy: { date: "desc" },
    take: 90,
  });
  const activeDates = new Set(logs.map((log) => log.date.toISOString().slice(0, 10)));
  let streak = 0;
  let cursor = today();
  while (activeDates.has(cursor.toISOString().slice(0, 10))) {
    streak += 1;
    cursor = subDays(cursor, 1);
  }
  return streak;
}

export async function getDashboardAnalytics(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return null;
  await recalculateRoadmapProgress(prisma, roadmap.id);

  const refreshedRoadmap = await prisma.userRoadmap.findUnique({
    where: { id: roadmap.id },
  });
  if (!refreshedRoadmap) return null;

  return {
    overallProgress: refreshedRoadmap.overallProgress,
    studyingProgress: refreshedRoadmap.studyingProgress,
    revisionProgress: refreshedRoadmap.revisionProgress,
  };
}

export async function getProgressAnalytics(userId: string) {
  const activeRoadmap = await getActiveRoadmapRecord(userId);
  if (!activeRoadmap) return null;
  await recalculateRoadmapProgress(prisma, activeRoadmap.id);

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      days: { orderBy: { dayNumber: "asc" }, include: { tasks: true } },
      studyLogs: { orderBy: { date: "asc" } },
    },
  });
  if (!roadmap) return null;

  const tasks = roadmap.days.flatMap((day) => day.tasks);
  const completedTasks = tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;

  const subjectSnapshots = await prisma.subjectProgress.findMany({
    where: { userRoadmapId: roadmap.id },
  });
  const orderMap = new Map<string, number>(recommendedSubjectOrder.map((subject, index) => [subject, index]));
  subjectSnapshots.sort((left, right) => {
    const leftOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(left.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(right.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });

  const subjectProgress =
    subjectSnapshots.length > 0
      ? subjectSnapshots.map((entry) => ({
          subject: entry.subjectName,
          progress: Math.round(entry.progressPercentage),
          completed: entry.completedTopics,
          total: entry.totalTopics,
        }))
      : Array.from(new Set(tasks.map((task) => task.subjectName))).map((subject) => {
          const subjectTasks = tasks.filter((task) => task.subjectName === subject);
          const completed = subjectTasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
          return {
            subject,
            progress: subjectTasks.length ? Math.round((completed / subjectTasks.length) * 100) : 0,
            completed,
            total: subjectTasks.length,
          };
        });

  return {
    overallCompletion: tasks.length ? Math.round((completedTasks / tasks.length) * 100) : 0,
    completedTasks,
    totalTasks: tasks.length,
    dailyCompletion: roadmap.days.map((day) => ({
      day: `D${day.dayNumber}`,
      completion: Math.round(day.completionPercentage),
      tasks: day.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length,
    })),
    subjectProgress,
    strongestSubjects: [...subjectProgress].sort((a, b) => b.progress - a.progress).slice(0, 5),
    weakestSubjects: [...subjectProgress].sort((a, b) => a.progress - b.progress).slice(0, 5),
    studyTime: roadmap.studyLogs.map((log) => ({
      date: log.date.toISOString().slice(0, 10),
      minutes: log.minutesStudied,
      tasks: log.tasksCompleted,
    })),
  };
}
