import type { Prisma, PrismaClient, ProgressStatus } from "@prisma/client";
import { isBefore, startOfDay } from "date-fns";
import { today } from "@/lib/dates";

type DbClient = PrismaClient | Prisma.TransactionClient;

function ratio(completed: number, total: number) {
  if (!total) return 0;
  return Math.round((completed / total) * 100);
}

function confidenceFromRatings(ratings: Array<number | null | undefined>) {
  const values = ratings.filter((value): value is number => typeof value === "number" && Number.isFinite(value));
  if (!values.length) return null;
  const average = values.reduce((sum, value) => sum + value, 0) / values.length;
  return Math.round((average / 5) * 100);
}

function progressStatus(completed: number, total: number, plannedDate?: Date | null, ratings?: Array<number | null | undefined>, manualStatus?: ProgressStatus) {
  if (manualStatus === "PUT_TO_REVISE") return "PUT_TO_REVISE" as const;
  if ((ratings ?? []).some((rating) => typeof rating === "number" && rating <= 2)) return "PUT_TO_REVISE" as const;
  
  if (!total || completed === 0) {
    if (plannedDate && isBefore(startOfDay(plannedDate), today()) && completed < total) return "BEHIND" as const;
    return "NOT_STARTED" as const;
  }

  if (completed >= total) {
    return "COMPLETED" as const;
  }
  
  if (plannedDate && isBefore(startOfDay(plannedDate), today())) return "BEHIND" as const;
  return "IN_PROGRESS" as const;
}

export async function recalculateRoadmapProgress(db: DbClient, userRoadmapId: string) {
  const [tasks, days] = await Promise.all([
    db.roadmapTask.findMany({
      where: { userRoadmapId },
      orderBy: [{ plannedDate: "asc" }, { order: "asc" }],
    }),
    db.roadmapDay.findMany({
      where: { userRoadmapId },
      orderBy: { dayNumber: "asc" },
    }),
  ]);

  const subjectMap = new Map<
    string,
    {
      tasks: typeof tasks;
      topicKeys: Set<string>;
      subtopicKeys: Set<string>;
      completedTasks: number;
      ratings: number[];
      lastStudiedAt: Date | null;
      plannedDate: Date | null;
    }
  >();
  const topicMap = new Map<
    string,
    {
      subjectName: string;
      topicName: string;
      tasks: typeof tasks;
      subtopicKeys: Set<string>;
      ratings: number[];
      lastStudiedAt: Date | null;
      plannedDate: Date | null;
    }
  >();
  const subtopicMap = new Map<
    string,
    {
      subjectName: string;
      topicName: string;
      subtopicName: string;
      tasks: typeof tasks;
      ratings: number[];
      lastStudiedAt: Date | null;
      plannedDate: Date | null;
    }
  >();

  for (const task of tasks) {
    const subjectKey = task.subjectName;
    const topicKey = `${task.subjectName}::${task.topicName ?? "General"}`;
    const subtopicKey = `${task.subjectName}::${task.topicName ?? "General"}::${task.subtopicName ?? "General"}`;

    const subjectEntry =
      subjectMap.get(subjectKey) ??
      {
        tasks: [],
        topicKeys: new Set<string>(),
        subtopicKeys: new Set<string>(),
        completedTasks: 0,
        ratings: [],
        lastStudiedAt: null,
        plannedDate: null,
      };
    subjectEntry.tasks.push(task);
    subjectEntry.topicKeys.add(topicKey);
    if (task.subtopicName) subjectEntry.subtopicKeys.add(subtopicKey);
    if (task.status === "COMPLETED" || task.status === "FAST_PACED") subjectEntry.completedTasks += 1;
    if (typeof task.selfRating === "number") subjectEntry.ratings.push(task.selfRating);
    if (task.completedAt && (!subjectEntry.lastStudiedAt || task.completedAt > subjectEntry.lastStudiedAt)) {
      subjectEntry.lastStudiedAt = task.completedAt;
    }
    if (task.plannedDate && (!subjectEntry.plannedDate || task.plannedDate > subjectEntry.plannedDate)) {
      subjectEntry.plannedDate = task.plannedDate;
    }
    subjectMap.set(subjectKey, subjectEntry);

    const topicEntry =
      topicMap.get(topicKey) ??
      {
        subjectName: task.subjectName,
        topicName: task.topicName ?? "General",
        tasks: [],
        subtopicKeys: new Set<string>(),
        ratings: [],
        lastStudiedAt: null,
        plannedDate: null,
      };
    topicEntry.tasks.push(task);
    if (task.subtopicName) topicEntry.subtopicKeys.add(subtopicKey);
    if (typeof task.selfRating === "number") topicEntry.ratings.push(task.selfRating);
    if (task.completedAt && (!topicEntry.lastStudiedAt || task.completedAt > topicEntry.lastStudiedAt)) {
      topicEntry.lastStudiedAt = task.completedAt;
    }
    if (task.plannedDate && (!topicEntry.plannedDate || task.plannedDate > topicEntry.plannedDate)) {
      topicEntry.plannedDate = task.plannedDate;
    }
    topicMap.set(topicKey, topicEntry);

    if (task.subtopicName) {
      const subtopicEntry =
        subtopicMap.get(subtopicKey) ??
        {
          subjectName: task.subjectName,
          topicName: task.topicName ?? "General",
          subtopicName: task.subtopicName,
          tasks: [],
          ratings: [],
          lastStudiedAt: null,
          plannedDate: null,
        };
      subtopicEntry.tasks.push(task);
      if (typeof task.selfRating === "number") subtopicEntry.ratings.push(task.selfRating);
      if (task.completedAt && (!subtopicEntry.lastStudiedAt || task.completedAt > subtopicEntry.lastStudiedAt)) {
        subtopicEntry.lastStudiedAt = task.completedAt;
      }
      if (task.plannedDate && (!subtopicEntry.plannedDate || task.plannedDate > subtopicEntry.plannedDate)) {
        subtopicEntry.plannedDate = task.plannedDate;
      }
      subtopicMap.set(subtopicKey, subtopicEntry);
    }
  }

  // Update RoadmapDay stats
  const dayUpdates = days.map((day) => {
    const dayTasks = tasks.filter(
      (task) => task.plannedDate.toISOString().slice(0, 10) === day.date.toISOString().slice(0, 10),
    );
    const completedCount = dayTasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
    const totalCount = dayTasks.length;
    const completionPercentage = ratio(completedCount, totalCount);
    let status: ProgressStatus = "NOT_STARTED";
    
    if (totalCount > 0) {
      if (completedCount === totalCount) {
        status = "COMPLETED";
      } else if (completedCount > 0) {
        status = "IN_PROGRESS";
      } else if (startOfDay(day.date) < today()) {
        status = "BEHIND";
      }
    }

    return db.roadmapDay.update({
      where: { id: day.id },
      data: {
        completionPercentage,
        status,
      },
    });
  });

  // Calculate and update subtopic progress
  const subtopicUpdates = [...subtopicMap.entries()].map(([, entry]) => {
    const completedTasks = entry.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
    const totalTasks = entry.tasks.length;
    const isManuallyMarked = entry.tasks.some(t => t.status === "PUT_TO_REVISE");
    const status = progressStatus(
      completedTasks,
      totalTasks,
      entry.plannedDate,
      entry.ratings,
      isManuallyMarked ? "PUT_TO_REVISE" : undefined
    );
    const hasLowRating = entry.tasks.some((task) => (task.selfRating ?? 5) <= 2);

    return db.subtopicProgress.upsert({
      where: {
        userRoadmapId_subjectName_topicName_subtopicName: {
          userRoadmapId,
          subjectName: entry.subjectName,
          topicName: entry.topicName,
          subtopicName: entry.subtopicName,
        },
      },
      update: {
        plannedDate: entry.plannedDate,
        status,
        progressPercentage: ratio(completedTasks, totalTasks),
        confidenceScore: confidenceFromRatings(entry.ratings),
        revisionPriority: hasLowRating ? 100 : 0,
        lastStudiedAt: entry.lastStudiedAt,
        completedAt: completedTasks === totalTasks ? entry.lastStudiedAt : null,
      },
      create: {
        userRoadmapId,
        subjectName: entry.subjectName,
        topicName: entry.topicName,
        subtopicName: entry.subtopicName,
        plannedDate: entry.plannedDate,
        status,
        progressPercentage: ratio(completedTasks, totalTasks),
        confidenceScore: confidenceFromRatings(entry.ratings),
        revisionPriority: hasLowRating ? 100 : 0,
        lastStudiedAt: entry.lastStudiedAt,
        completedAt: completedTasks === totalTasks ? entry.lastStudiedAt : null,
      },
    });
  });

  // Calculate and update topic progress
  const topicUpdates = [...topicMap.entries()].map(([, entry]) => {
    const topicSubtopics = [...subtopicMap.entries()].filter(
      ([, sub]) => sub.subjectName === entry.subjectName && sub.topicName === entry.topicName
    );
    const totalSubtopics = topicSubtopics.length || entry.subtopicKeys.size || 1;
    const completedSubtopics = topicSubtopics.filter(
      ([, sub]) => {
        const completedTasks = sub.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
        return completedTasks === sub.tasks.length && sub.tasks.length > 0;
      }
    ).length;

    const completedTasks = entry.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
    const totalTasks = entry.tasks.length;
    const status = progressStatus(completedTasks, totalTasks, entry.plannedDate, entry.ratings);

    return db.topicProgress.upsert({
      where: {
        userRoadmapId_subjectName_topicName: {
          userRoadmapId,
          subjectName: entry.subjectName,
          topicName: entry.topicName,
        },
      },
      update: {
        totalSubtopics,
        completedSubtopics,
        status,
        progressPercentage: ratio(completedSubtopics, totalSubtopics),
        confidenceScore: confidenceFromRatings(entry.ratings),
        lastStudiedAt: entry.lastStudiedAt,
      },
      create: {
        userRoadmapId,
        subjectName: entry.subjectName,
        topicName: entry.topicName,
        totalSubtopics,
        completedSubtopics,
        status,
        progressPercentage: ratio(completedSubtopics, totalSubtopics),
        confidenceScore: confidenceFromRatings(entry.ratings),
        lastStudiedAt: entry.lastStudiedAt,
      },
    });
  });

  // Calculate and update subject progress
  const subjectUpdates = [...subjectMap.entries()].map(([subjectName, entry]) => {
    const subjectSubtopics = [...subtopicMap.entries()].filter(
      ([, sub]) => sub.subjectName === subjectName
    );
    const totalSubtopics = subjectSubtopics.length || entry.subtopicKeys.size || 1;
    const completedSubtopics = subjectSubtopics.filter(
      ([, sub]) => {
        const completedTasks = sub.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
        return completedTasks === sub.tasks.length && sub.tasks.length > 0;
      }
    ).length;

    const subjectTopics = [...topicMap.entries()].filter(
      ([, top]) => top.subjectName === subjectName
    );
    const totalTopics = subjectTopics.length || entry.topicKeys.size || 1;
    const completedTopics = subjectTopics.filter(
      ([, top]) => {
        const completedTasks = top.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
        return completedTasks === top.tasks.length && top.tasks.length > 0;
      }
    ).length;

    const completedTasks = entry.tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
    const totalTasks = entry.tasks.length;
    const status = progressStatus(completedTasks, totalTasks, entry.plannedDate, entry.ratings);

    return db.subjectProgress.upsert({
      where: { userRoadmapId_subjectName: { userRoadmapId, subjectName } },
      update: {
        totalTopics,
        completedTopics,
        totalSubtopics,
        completedSubtopics,
        status,
        progressPercentage: ratio(completedSubtopics, totalSubtopics),
        confidenceScore: confidenceFromRatings(entry.ratings),
        lastStudiedAt: entry.lastStudiedAt,
      },
      create: {
        userRoadmapId,
        subjectName,
        totalTopics,
        completedTopics,
        totalSubtopics,
        completedSubtopics,
        status,
        progressPercentage: ratio(completedSubtopics, totalSubtopics),
        confidenceScore: confidenceFromRatings(entry.ratings),
        lastStudiedAt: entry.lastStudiedAt,
      },
    });
  });

  // Calculate overall, studying, and revision progresses
  const completedAllTasks = tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
  const roadmapProgress = ratio(completedAllTasks, tasks.length);

  const dayPhaseMap = new Map(days.map(d => [d.id, d.phase]));
  
  const studyingTasks = tasks.filter(t => dayPhaseMap.get(t.roadmapDayId) === "STUDYING");
  const revisionTasks = tasks.filter(t => dayPhaseMap.get(t.roadmapDayId) === "REVISION");

  const completedStudyingTasks = studyingTasks.filter((t) => t.status === "COMPLETED" || t.status === "FAST_PACED").length;
  const completedRevisionTasks = revisionTasks.filter((t) => t.status === "COMPLETED" || t.status === "FAST_PACED").length;

  const studyingProgress = ratio(completedStudyingTasks, studyingTasks.length);
  const revisionProgress = ratio(completedRevisionTasks, revisionTasks.length);

  await Promise.all([
    ...dayUpdates,
    ...subtopicUpdates,
    ...topicUpdates,
    ...subjectUpdates,
    db.userRoadmap.update({
      where: { id: userRoadmapId },
      data: {
        overallProgress: roadmapProgress,
        studyingProgress,
        revisionProgress,
      },
    }),
  ]);

  return { overallProgress: roadmapProgress, studyingProgress, revisionProgress };
}

export function buildProgressSnapshot(tasks: Array<{ status: string }>) {
  const total = tasks.length;
  const completed = tasks.filter((task) => task.status === "COMPLETED" || task.status === "FAST_PACED").length;
  return total ? Math.round((completed / total) * 100) : 0;
}
