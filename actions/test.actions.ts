"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { testAttemptSchema } from "@/lib/validations";

function parseList(value: FormDataEntryValue | null) {
  if (!value || typeof value !== "string") return [];
  return value
    .split(/\n|,/)
    .map((item) => item.trim())
    .filter(Boolean);
}

export async function createTestAttempt(formData: FormData) {
  const user = await requireUser();
  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });
  if (!roadmap) return;

  const parsed = testAttemptSchema.safeParse({
    title: formData.get("title"),
    testType: formData.get("testType"),
    subjectName: formData.get("subjectName") || undefined,
    score: formData.get("score"),
    totalMarks: formData.get("totalMarks"),
    timeTakenMinutes: formData.get("timeTakenMinutes"),
    mistakes: formData.get("mistakes") || undefined,
    weakTopics: formData.get("weakTopics") || undefined,
  });
  if (!parsed.success) return;

  const mistakes = parseList(formData.get("mistakes"));
  const weakTopics = parseList(formData.get("weakTopics"));
  const accuracy = parsed.data.totalMarks > 0 ? Math.round((parsed.data.score / parsed.data.totalMarks) * 100) : null;

  await prisma.testAttempt.create({
    data: {
      userId: user.id,
      userRoadmapId: roadmap.id,
      title: parsed.data.title,
      testType: parsed.data.testType,
      subjectName: parsed.data.subjectName,
      score: parsed.data.score,
      totalMarks: parsed.data.totalMarks,
      timeTakenMinutes: parsed.data.timeTakenMinutes,
      mistakes,
      weakTopics,
      accuracy,
    },
  });

  revalidateAllPaths();
}

export async function updateTestAttempt(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id") as string;
  
  const parsed = testAttemptSchema.safeParse({
    title: formData.get("title"),
    testType: formData.get("testType"),
    subjectName: formData.get("subjectName") || undefined,
    score: formData.get("score"),
    totalMarks: formData.get("totalMarks"),
    timeTakenMinutes: formData.get("timeTakenMinutes"),
    mistakes: formData.get("mistakes") || undefined,
    weakTopics: formData.get("weakTopics") || undefined,
  });
  if (!parsed.success) return;

  const mistakes = parseList(formData.get("mistakes"));
  const weakTopics = parseList(formData.get("weakTopics"));
  const accuracy = parsed.data.totalMarks > 0 ? Math.round((parsed.data.score / parsed.data.totalMarks) * 100) : null;

  await prisma.testAttempt.update({
    where: { id, userId: user.id },
    data: {
      title: parsed.data.title,
      testType: parsed.data.testType,
      subjectName: parsed.data.subjectName,
      score: parsed.data.score,
      totalMarks: parsed.data.totalMarks,
      timeTakenMinutes: parsed.data.timeTakenMinutes,
      mistakes,
      weakTopics,
      accuracy,
    },
  });

  revalidateAllPaths();
}

export async function deleteTestAttempt(formData: FormData) {
  const user = await requireUser();
  const id = formData.get("id") as string;

  await prisma.testAttempt.delete({
    where: { id, userId: user.id },
  });

  revalidateAllPaths();
}

export async function getTestAttempts(userId: string) {
  return prisma.testAttempt.findMany({
    where: { userId },
    orderBy: { attemptedAt: "desc" },
  });
}

function revalidateAllPaths() {
  revalidatePath("/dashboard");
  revalidatePath("/my-roadmap/tests");
  revalidatePath("/my-roadmap/revision");
  revalidatePath("/my-roadmap/analytics");
}
