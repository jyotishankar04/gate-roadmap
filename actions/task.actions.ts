"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { toStartOfDay } from "@/lib/dates";
import type { ProgressStatus } from "@prisma/client";
import { recalculateRoadmapProgress } from "@/lib/progress";

export async function updateTaskStatus(formData: FormData) {
  const user = await requireUser();
  const taskId = formData.get("taskId") as string;
  const status = formData.get("status") as ProgressStatus;
  const selfRatingVal = formData.get("selfRating");
  const selfRating = selfRatingVal ? parseInt(selfRatingVal.toString(), 10) : undefined;
  const notes = formData.get("notes") as string | undefined;
  const actualMinutesVal = formData.get("actualMinutes");
  const actualMinutes = actualMinutesVal ? parseInt(actualMinutesVal.toString(), 10) : undefined;

  const task = await prisma.roadmapTask.findFirst({
    where: {
      id: taskId,
      userRoadmap: { userId: user.id },
    },
    include: { roadmapDay: true },
  });
  if (!task) return;

  const wasCompleted = task.status === "COMPLETED";
  const willBeCompleted = status === "COMPLETED" || status === "FAST_PACED";
  const deltaTasks = (willBeCompleted ? 1 : 0) - (wasCompleted ? 1 : 0);
  const deltaMinutes = deltaTasks * task.estimatedMinutes;
  const studyDate = toStartOfDay(task.plannedDate ?? task.roadmapDay.date);

  let finalStatus = status;
  if (selfRating !== undefined && selfRating <= 2 && finalStatus === "COMPLETED") {
    finalStatus = "PUT_TO_REVISE";
  }

  await prisma.$transaction(async (tx) => {
    await tx.roadmapTask.update({
      where: { id: task.id },
      data: {
        status: finalStatus,
        selfRating: selfRating !== undefined ? selfRating : undefined,
        notes: notes !== undefined ? notes : undefined,
        actualMinutes: actualMinutes !== undefined ? actualMinutes : undefined,
        completedAt: willBeCompleted ? new Date() : null,
      },
    });

    await tx.studyLog.upsert({
      where: {
        userId_userRoadmapId_date: {
          userId: user.id,
          userRoadmapId: task.userRoadmapId,
          date: studyDate,
        },
      },
      update: {
        tasksCompleted: { increment: deltaTasks },
        minutesStudied: { increment: deltaMinutes },
      },
      create: {
        userId: user.id,
        userRoadmapId: task.userRoadmapId,
        date: studyDate,
        tasksCompleted: Math.max(deltaTasks, 0),
        minutesStudied: Math.max(deltaMinutes, 0),
      },
    });

    await recalculateRoadmapProgress(tx, task.userRoadmapId);
  });

  revalidateAllPaths();
}

export async function updateTaskNotes(formData: FormData) {
  const user = await requireUser();
  const taskId = formData.get("taskId") as string;
  const notes = formData.get("notes") as string;

  await prisma.roadmapTask.update({
    where: { id: taskId, userRoadmap: { userId: user.id } },
    data: { notes },
  });

  revalidateAllPaths();
}

export async function updateTaskSelfRating(formData: FormData) {
  const user = await requireUser();
  const taskId = formData.get("taskId") as string;
  const selfRating = parseInt(formData.get("selfRating") as string, 10);

  const task = await prisma.roadmapTask.findFirst({
    where: { id: taskId, userRoadmap: { userId: user.id } },
  });
  if (!task) return;

  const status: ProgressStatus = selfRating <= 2 ? "PUT_TO_REVISE" : task.status;

  await prisma.$transaction(async (tx) => {
    await tx.roadmapTask.update({
      where: { id: taskId },
      data: { selfRating, status },
    });
    await recalculateRoadmapProgress(tx, task.userRoadmapId);
  });

  revalidateAllPaths();
}

export async function updateTaskActualMinutes(formData: FormData) {
  const user = await requireUser();
  const taskId = formData.get("taskId") as string;
  const actualMinutes = parseInt(formData.get("actualMinutes") as string, 10);

  const task = await prisma.roadmapTask.findFirst({
    where: { id: taskId, userRoadmap: { userId: user.id } },
  });
  if (!task) return;

  await prisma.$transaction(async (tx) => {
    await tx.roadmapTask.update({
      where: { id: taskId },
      data: { actualMinutes },
    });
    await recalculateRoadmapProgress(tx, task.userRoadmapId);
  });

  revalidateAllPaths();
}

export async function updateSubtopicStatus(formData: FormData) {
  const user = await requireUser();
  const subjectName = formData.get("subjectName") as string;
  const topicName = formData.get("topicName") as string;
  const subtopicName = formData.get("subtopicName") as string;
  const status = formData.get("status") as ProgressStatus;

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (!roadmap) return;

  await prisma.$transaction(async (tx) => {
    await tx.roadmapTask.updateMany({
      where: {
        userRoadmapId: roadmap.id,
        subjectName,
        topicName,
        subtopicName,
      },
      data: {
        status,
        completedAt: (status === "COMPLETED" || status === "FAST_PACED") ? new Date() : null,
      },
    });

    await recalculateRoadmapProgress(tx, roadmap.id);
  });

  revalidateAllPaths();
}

export async function updateSubtopicProgress(formData: FormData) {
  const user = await requireUser();
  const subjectName = formData.get("subjectName") as string;
  const topicName = formData.get("topicName") as string;
  const subtopicName = formData.get("subtopicName") as string;
  const status = formData.get("status") as ProgressStatus;
  const confidenceScore = formData.get("confidenceScore") ? parseFloat(formData.get("confidenceScore") as string) : null;
  const notes = formData.get("notes") as string | null;
  const actualMinutes = formData.get("actualMinutes") ? parseInt(formData.get("actualMinutes") as string, 10) : null;

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (!roadmap) return;

  await prisma.$transaction(async (tx) => {
    await tx.subtopicProgress.update({
      where: {
        userRoadmapId_subjectName_topicName_subtopicName: {
          userRoadmapId: roadmap.id,
          subjectName,
          topicName,
          subtopicName,
        },
      },
      data: {
        status,
        confidenceScore,
        notes,
      },
    });

    const tasks = await tx.roadmapTask.findMany({
      where: {
        userRoadmapId: roadmap.id,
        subjectName,
        topicName,
        subtopicName,
      },
    });

    if (tasks.length > 0) {
      const minutesPerTask = actualMinutes !== null ? Math.round(actualMinutes / tasks.length) : null;
      for (const t of tasks) {
        await tx.roadmapTask.update({
          where: { id: t.id },
          data: {
            status,
            actualMinutes: minutesPerTask,
            selfRating: confidenceScore ? Math.round((confidenceScore / 100) * 5) : undefined,
            notes,
            completedAt: (status === "COMPLETED" || status === "FAST_PACED") ? new Date() : null,
          },
        });
      }
    }

    await recalculateRoadmapProgress(tx, roadmap.id);
  });

  revalidateAllPaths();
}

export async function bulkUpdateSubtopics(formData: FormData) {
  const user = await requireUser();
  const subtopicKeys = formData.getAll("subtopicKeys").map(String);
  const status = formData.get("status") as ProgressStatus;

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });
  if (!roadmap || subtopicKeys.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const key of subtopicKeys) {
      const [subjectName, topicName, subtopicName] = key.split("::");
      if (!subjectName || !topicName || !subtopicName) continue;

      await tx.roadmapTask.updateMany({
        where: {
          userRoadmapId: roadmap.id,
          subjectName,
          topicName,
          subtopicName,
        },
        data: {
          status,
          completedAt: (status === "COMPLETED" || status === "FAST_PACED") ? new Date() : null,
        },
      });
    }

    await recalculateRoadmapProgress(tx, roadmap.id);
  });

  revalidateAllPaths();
}

export async function recalculateProgress(formData: FormData) {
  const user = await requireUser();
  const userRoadmapId = formData.get("userRoadmapId") as string;

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { id: userRoadmapId, userId: user.id },
  });
  if (!roadmap) return;

  await prisma.$transaction(async (tx) => {
    await recalculateRoadmapProgress(tx, userRoadmapId);
  });

  revalidateAllPaths();
}

export async function bulkUpdateTasks(formData: FormData) {
  const user = await requireUser();
  const taskIds = formData.getAll("taskIds").map(String);
  const status = formData.get("status") as ProgressStatus;

  const tasks = await prisma.roadmapTask.findMany({
    where: { id: { in: taskIds }, userRoadmap: { userId: user.id } },
    include: { roadmapDay: true },
  });

  if (tasks.length === 0) return;

  await prisma.$transaction(async (tx) => {
    for (const task of tasks) {
      const wasCompleted = task.status === "COMPLETED";
      const willBeCompleted = status === "COMPLETED" || status === "FAST_PACED";
      const deltaTasks = (willBeCompleted ? 1 : 0) - (wasCompleted ? 1 : 0);
      const deltaMinutes = deltaTasks * task.estimatedMinutes;
      const studyDate = toStartOfDay(task.plannedDate ?? task.roadmapDay.date);

      await tx.roadmapTask.update({
        where: { id: task.id },
        data: {
          status,
          completedAt: willBeCompleted ? new Date() : null,
        },
      });

      if (deltaTasks !== 0 || deltaMinutes !== 0) {
        await tx.studyLog.upsert({
          where: {
            userId_userRoadmapId_date: {
              userId: user.id,
              userRoadmapId: task.userRoadmapId,
              date: studyDate,
            },
          },
          update: {
            tasksCompleted: { increment: deltaTasks },
            minutesStudied: { increment: deltaMinutes },
          },
          create: {
            userId: user.id,
            userRoadmapId: task.userRoadmapId,
            date: studyDate,
            tasksCompleted: Math.max(deltaTasks, 0),
            minutesStudied: Math.max(deltaMinutes, 0),
          },
        });
      }
    }

    await recalculateRoadmapProgress(tx, tasks[0].userRoadmapId);
  });

  revalidateAllPaths();
}

function revalidateAllPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/my-roadmap");
  revalidatePath("/my-roadmap/today");
  revalidatePath("/my-roadmap/sheet");
  revalidatePath("/my-roadmap/calendar");
  revalidatePath("/my-roadmap/subjects");
  revalidatePath("/my-roadmap/topics");
  revalidatePath("/my-roadmap/subtopics");
  revalidatePath("/my-roadmap/revision");
  revalidatePath("/my-roadmap/tests");
  revalidatePath("/my-roadmap/analytics");
}
