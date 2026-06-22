"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";

export async function resetActiveRoadmap() {
  const user = await requireUser();
  const activeRoadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
    select: { id: true },
  });

  if (!activeRoadmap) {
    revalidatePath("/dashboard");
    revalidatePath("/my-roadmap");
    revalidatePath("/my-roadmap/create-sheet");
    redirect("/my-roadmap");
  }

  await prisma.studySession.deleteMany({
    where: { userRoadmapId: activeRoadmap.id },
  });

  await prisma.userRoadmap.delete({
    where: { id: activeRoadmap.id },
  });

  revalidatePath("/dashboard");
  revalidatePath("/my-roadmap");
  revalidatePath("/my-roadmap/create-sheet");
  revalidatePath("/my-roadmap/sheet");
  revalidatePath("/my-roadmap/today");
  revalidatePath("/my-roadmap/calendar");
  revalidatePath("/my-roadmap/subjects");
  revalidatePath("/my-roadmap/topics");
  revalidatePath("/my-roadmap/subtopics");
  revalidatePath("/my-roadmap/revision");
  revalidatePath("/my-roadmap/tests");
  revalidatePath("/my-roadmap/analytics");
  revalidatePath("/roadmaps");
  redirect("/my-roadmap");
}
