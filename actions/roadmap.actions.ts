"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { ProgressStatus } from "@prisma/client";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { addPlanDays, today, toStartOfDay } from "@/lib/dates";
import { recalculateRoadmapProgress } from "@/lib/progress";
import { createDynamicGateRoadmapForUser } from "@/lib/roadmap/create-dynamic-roadmap";
import { gateCseSyllabus } from "@/lib/roadmap/gate-cse-syllabus";
import {
  DEFAULT_GATE_2027_EXAM_DATE,
  calculateSheetPlan,
  displayGateSubjectName,
  recommendedSubjectOrder,
  normalizeGateSubjectName,
  SheetPreviewSchema,
  type ParallelSubjects,
  type PrepAggression,
  type SheetPlanPreview,
} from "@/lib/roadmap/sheet-calculator";

const statusRank: Record<ProgressStatus, number> = {
  NOT_STARTED: 0,
  PUT_TO_REVISE: 1,
  BEHIND: 2,
  IN_PROGRESS: 3,
  FAST_PACED: 4,
  COMPLETED: 5,
};

type SyllabusOrderMaps = {
  subjectOrder: Map<string, number>;
  topicOrder: Map<string, number>;
  subtopicOrder: Map<string, number>;
};

const syllabusOrderMaps = (() => {
  const subjectOrder = new Map<string, number>();
  const topicOrder = new Map<string, number>();
  const subtopicOrder = new Map<string, number>();

  gateCseSyllabus.forEach((subject, subjectIndex) => {
    const subjectKey = displayGateSubjectName(normalizeGateSubjectName(subject.name));
    subjectOrder.set(subjectKey, subjectIndex);

    subject.topics.forEach((topic, topicIndex) => {
      const topicKey = `${subjectKey}::${topic.name}`;
      topicOrder.set(topicKey, topicIndex);

      topic.subtopics.forEach((subtopic, subtopicIndex) => {
        const subtopicKey = `${topicKey}::${subtopic.name}`;
        subtopicOrder.set(subtopicKey, subtopicIndex);
      });
    });
  });

  return { subjectOrder, topicOrder, subtopicOrder } satisfies SyllabusOrderMaps;
})();

function getSyllabusSubjectOrder(subjectName: string) {
  return syllabusOrderMaps.subjectOrder.get(displayGateSubjectName(normalizeGateSubjectName(subjectName))) ?? Number.MAX_SAFE_INTEGER;
}

function getSyllabusTopicOrder(subjectName: string, topicName: string) {
  const subjectKey = displayGateSubjectName(normalizeGateSubjectName(subjectName));
  return syllabusOrderMaps.topicOrder.get(`${subjectKey}::${topicName}`) ?? Number.MAX_SAFE_INTEGER;
}

function getSyllabusSubtopicOrder(subjectName: string, topicName: string, subtopicName: string) {
  const subjectKey = displayGateSubjectName(normalizeGateSubjectName(subjectName));
  return syllabusOrderMaps.subtopicOrder.get(`${subjectKey}::${topicName}::${subtopicName}`) ?? Number.MAX_SAFE_INTEGER;
}

function mergeStatus(statuses: ProgressStatus[]) {
  return statuses.reduce((best, status) => (statusRank[status] > statusRank[best] ? status : best), "NOT_STARTED");
}

async function normalizeDuplicateTasks(roadmapId: string) {
  const tasks = await prisma.roadmapTask.findMany({
    where: { userRoadmapId: roadmapId },
    orderBy: [{ plannedDate: "asc" }, { order: "asc" }, { createdAt: "asc" }],
  });

  const grouped = new Map<string, typeof tasks>();
  for (const task of tasks) {
    const key = [
      task.plannedDate.toISOString().slice(0, 10),
      task.subjectName,
      task.topicName ?? "",
      task.subtopicName ?? "",
    ].join("::");
    const list = grouped.get(key);
    if (list) {
      list.push(task);
    } else {
      grouped.set(key, [task]);
    }
  }

  const duplicateGroups = [...grouped.values()].filter((group) => group.length > 1);
  if (!duplicateGroups.length) return;

  await prisma.$transaction(async (tx) => {
    for (const group of duplicateGroups) {
      const [keep, ...extras] = group;
      const notes = [...new Set(group.map((task) => task.notes?.trim()).filter(Boolean))].join("\n");
      const actualMinutes = group.reduce((total, task) => total + (task.actualMinutes ?? 0), 0) || null;
      const selfRatings = group.map((task) => task.selfRating).filter((rating): rating is number => typeof rating === "number");
      const selfRating = selfRatings.length ? Math.max(...selfRatings) : null;
      const titles = [...new Set(group.map((task) => task.title.trim()).filter(Boolean))];

      await tx.roadmapTask.update({
        where: { id: keep.id },
        data: {
          title: keep.subtopicName ?? keep.title,
          description: titles.length > 1 ? titles.join(" | ") : keep.description,
          actualMinutes,
          selfRating,
          notes: notes || null,
          status: mergeStatus(group.map((task) => task.status)),
        },
      });

      await tx.roadmapTask.deleteMany({
        where: { id: { in: extras.map((task) => task.id) } },
      });
    }
  });
}

export async function startStaticGateRoadmap(formData: FormData) {
  void formData;
  redirect("/my-roadmap/create-sheet");
}

export async function detectGateExamDate() {
  return {
    examDate: DEFAULT_GATE_2027_EXAM_DATE,
    source:
      "Expected date fallback. No reliable official 2027 exam date was verified in-app, so the preview uses the default expected date.",
  };
}

function parseSubjectList(value: FormDataEntryValue | null) {
  if (typeof value !== "string" || !value.trim()) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.map((item) => String(item)) : [];
  } catch {
    return value
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }
}

function parsePreview(formData: FormData): SheetPlanPreview {
  const previewRaw = formData.get("previewJson");
  if (typeof previewRaw !== "string" || !previewRaw.trim()) {
    throw new Error("Missing sheet preview");
  }
  return SheetPreviewSchema.parse(JSON.parse(previewRaw));
}

async function getActiveRoadmapRecord(userId: string) {
  return prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
}

async function refreshRoadmapProgress(roadmapId: string) {
  await normalizeDuplicateTasks(roadmapId);
  await recalculateRoadmapProgress(prisma, roadmapId);
}

export async function calculateSheetPreview(formData: FormData) {
  const dailyStudyHours = Number(formData.get("dailyStudyHours") ?? 4);
  const weekendStudyHours = Number(formData.get("weekendStudyHours") ?? dailyStudyHours + 2);
  const examDate = new Date(String(formData.get("examDate") ?? DEFAULT_GATE_2027_EXAM_DATE));
  const strongSubjects = parseSubjectList(formData.get("strongSubjects"));
  const weakSubjects = parseSubjectList(formData.get("weakSubjects"));
  const aggression = String(formData.get("aggression") ?? "BALANCED") as PrepAggression;
  const parallelSubjects = Number(formData.get("parallelSubjects") ?? 1) as ParallelSubjects;

  return calculateSheetPlan({
    userId: String(formData.get("userId") ?? ""),
    today: new Date(),
    examDate,
    dailyStudyHours: Number.isFinite(dailyStudyHours) ? dailyStudyHours : 4,
    weekendStudyHours: Number.isFinite(weekendStudyHours) ? weekendStudyHours : dailyStudyHours + 2,
    strongSubjects,
    weakSubjects,
    aggression: ["LOOSE", "BALANCED", "AGGRESSIVE"].includes(aggression) ? aggression : "BALANCED",
    parallelSubjects: [1, 2, 3].includes(parallelSubjects) ? (parallelSubjects as ParallelSubjects) : 1,
  });
}

export async function updateEditedSubjectAllocation(formData: FormData) {
  return calculateSheetPreview(formData);
}

export async function createUserSheetFromPreview(formData: FormData) {
  const user = await requireUser();
  const preview = parsePreview(formData);
  const examDate = new Date(String(formData.get("examDate") ?? DEFAULT_GATE_2027_EXAM_DATE));
  const dailyStudyHours = Number(formData.get("dailyStudyHours") ?? 4);
  const weekendStudyHours = Number(formData.get("weekendStudyHours") ?? dailyStudyHours + 2);
  const parallelSubjects = Number(formData.get("parallelSubjects") ?? 1) as ParallelSubjects;

  await createDynamicGateRoadmapForUser(user.id, preview, examDate, {
    dailyStudyHours: Number.isFinite(dailyStudyHours) ? dailyStudyHours : 4,
    weekendStudyHours: Number.isFinite(weekendStudyHours) ? weekendStudyHours : dailyStudyHours + 2,
    parallelSubjects: [1, 2, 3].includes(parallelSubjects) ? parallelSubjects : 1,
  });
  revalidatePath("/dashboard");
  revalidatePath("/my-roadmap");
  revalidatePath("/my-roadmap/sheet");
  revalidatePath("/my-roadmap/today");
  revalidatePath("/my-roadmap/revision");
  redirect("/my-roadmap/sheet");
}

export async function getActiveRoadmap(userId: string) {
  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: { tasks: { orderBy: { order: "asc" } } },
      },
    },
  });

  if (!roadmap) return null;

  await normalizeDuplicateTasks(roadmap.id);

  return prisma.userRoadmap.findUnique({
    where: { id: roadmap.id },
    include: {
      days: {
        orderBy: { dayNumber: "asc" },
        include: { tasks: { orderBy: { order: "asc" } } },
      },
    },
  });
}

export async function getTodayTasks(userId: string, targetDate?: Date) {
  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!roadmap) return null;

  await normalizeDuplicateTasks(roadmap.id);

  const requestedDate = targetDate ? toStartOfDay(targetDate) : today();
  const nextDate = addPlanDays(requestedDate, 1);

  const currentDay = await prisma.roadmapDay.findFirst({
    where: {
      userRoadmapId: roadmap.id,
      date: {
        gte: requestedDate,
        lt: nextDate,
      },
    },
    include: { tasks: { orderBy: { order: "asc" } } },
  });

  if (currentDay) return currentDay;

  if (targetDate) {
    const exactOrNext = await prisma.roadmapDay.findFirst({
      where: {
        userRoadmapId: roadmap.id,
        date: { gte: requestedDate },
      },
      orderBy: { date: "asc" },
      include: { tasks: { orderBy: { order: "asc" } } },
    });
    return exactOrNext;
  }

  return prisma.roadmapDay.findFirst({
    where: {
      userRoadmapId: roadmap.id,
      date: { gte: requestedDate },
    },
    orderBy: { date: "asc" },
    include: { tasks: { orderBy: { order: "asc" } } },
  });
}

export async function getRoadmapCalendar(userId: string) {
  const roadmap = await getActiveRoadmap(userId);
  return roadmap?.days ?? [];
}

export async function getCalendarDays(userId: string) {
  return getRoadmapCalendar(userId);
}

export async function getSubjectProgress(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await refreshRoadmapProgress(roadmap.id);

  const orderMap = new Map<string, number>(recommendedSubjectOrder.map((subject, index) => [subject, index]));
  const rows = await prisma.subjectProgress.findMany({
    where: { userRoadmapId: roadmap.id },
    select: {
      subjectName: true,
      totalTopics: true,
      completedTopics: true,
      totalSubtopics: true,
      completedSubtopics: true,
      progressPercentage: true,
      status: true,
      confidenceScore: true,
      lastStudiedAt: true,
    },
  });
  return rows.sort((left, right) => {
    const leftOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(left.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    const rightOrder = orderMap.get(displayGateSubjectName(normalizeGateSubjectName(right.subjectName))) ?? Number.MAX_SAFE_INTEGER;
    return leftOrder - rightOrder;
  });
}

export async function getTopicProgress(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await refreshRoadmapProgress(roadmap.id);

  const rows = await prisma.topicProgress.findMany({
    where: { userRoadmapId: roadmap.id },
  });
  return rows.sort((left, right) => {
    const leftOrder = getSyllabusSubjectOrder(left.subjectName);
    const rightOrder = getSyllabusSubjectOrder(right.subjectName);
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftTopicOrder = getSyllabusTopicOrder(left.subjectName, left.topicName);
    const rightTopicOrder = getSyllabusTopicOrder(right.subjectName, right.topicName);
    return leftTopicOrder - rightTopicOrder;
  });
}

export async function getSubtopicProgress(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await refreshRoadmapProgress(roadmap.id);

  const rows = await prisma.subtopicProgress.findMany({
    where: { userRoadmapId: roadmap.id },
  });
  return rows.sort((left, right) => {
    const leftOrder = getSyllabusSubjectOrder(left.subjectName);
    const rightOrder = getSyllabusSubjectOrder(right.subjectName);
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftTopicOrder = getSyllabusTopicOrder(left.subjectName, left.topicName);
    const rightTopicOrder = getSyllabusTopicOrder(right.subjectName, right.topicName);
    if (leftTopicOrder !== rightTopicOrder) return leftTopicOrder - rightTopicOrder;

    const leftSubtopicOrder = getSyllabusSubtopicOrder(left.subjectName, left.topicName, left.subtopicName);
    const rightSubtopicOrder = getSyllabusSubtopicOrder(right.subjectName, right.topicName, right.subtopicName);
    return leftSubtopicOrder - rightSubtopicOrder;
  });
}

export async function getRoadmapSheet(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];

  await refreshRoadmapProgress(roadmap.id);

  const subtopics = await prisma.subtopicProgress.findMany({
    where: { userRoadmapId: roadmap.id },
    select: {
      subjectName: true,
      topicName: true,
      subtopicName: true,
      plannedDate: true,
      status: true,
      progressPercentage: true,
      confidenceScore: true,
      revisionPriority: true,
      notes: true,
      lastStudiedAt: true,
    },
  });

  subtopics.sort((left, right) => {
    const leftOrder = getSyllabusSubjectOrder(left.subjectName);
    const rightOrder = getSyllabusSubjectOrder(right.subjectName);
    if (leftOrder !== rightOrder) return leftOrder - rightOrder;

    const leftTopicOrder = getSyllabusTopicOrder(left.subjectName, left.topicName);
    const rightTopicOrder = getSyllabusTopicOrder(right.subjectName, right.topicName);
    if (leftTopicOrder !== rightTopicOrder) return leftTopicOrder - rightTopicOrder;

    const leftSubtopicOrder = getSyllabusSubtopicOrder(left.subjectName, left.topicName, left.subtopicName);
    const rightSubtopicOrder = getSyllabusSubtopicOrder(right.subjectName, right.topicName, right.subtopicName);
    if (leftSubtopicOrder !== rightSubtopicOrder) return leftSubtopicOrder - rightSubtopicOrder;

    return (left.plannedDate?.getTime() ?? Number.MAX_SAFE_INTEGER) - (right.plannedDate?.getTime() ?? Number.MAX_SAFE_INTEGER);
  });

  const tasks = await prisma.roadmapTask.findMany({
    where: {
      userRoadmapId: roadmap.id,
      subtopicName: { not: null },
    },
    select: {
      subjectName: true,
      topicName: true,
      subtopicName: true,
      estimatedMinutes: true,
      actualMinutes: true,
    },
  });

  const taskMap = new Map<string, { estimatedMinutes: number; actualMinutes: number | null }>();
  for (const task of tasks) {
    const key = `${task.subjectName}::${task.topicName ?? ""}::${task.subtopicName ?? ""}`;
    if (!taskMap.has(key)) {
      taskMap.set(key, { estimatedMinutes: 0, actualMinutes: null });
    }
    const entry = taskMap.get(key)!;
    entry.estimatedMinutes += task.estimatedMinutes;
    if (task.actualMinutes) entry.actualMinutes = (entry.actualMinutes ?? 0) + task.actualMinutes;
  }

  return subtopics.map((st) => {
    const key = `${st.subjectName}::${st.topicName}::${st.subtopicName}`;
    const time = taskMap.get(key);
    return {
      ...st,
      estimatedMinutes: time?.estimatedMinutes ?? 0,
      actualMinutes: time?.actualMinutes ?? null,
    };
  });
}

export async function getRevisionItems(userId: string) {
  const roadmap = await getActiveRoadmapRecord(userId);
  if (!roadmap) return [];
  await refreshRoadmapProgress(roadmap.id);

  return prisma.subtopicProgress.findMany({
    where: {
      userRoadmapId: roadmap.id,
      OR: [{ status: "PUT_TO_REVISE" }, { status: "BEHIND" }, { confidenceScore: { lte: 40 } }],
    },
    orderBy: [{ revisionPriority: "desc" }, { updatedAt: "desc" }],
  });
}
