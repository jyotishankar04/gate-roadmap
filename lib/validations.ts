import { z } from "zod";

export const authSchema = z.object({
  username: z.string().trim().min(3, "Username must be at least 3 characters").max(32),
  password: z.string().min(6, "Password must be at least 6 characters").max(128),
});

export const generateRoadmapSchema = z.object({
  roadmapTemplateId: z.string().min(1),
  startDate: z.string().min(1),
  examDate: z.string().min(1),
  dailyHours: z.coerce.number().min(1).max(14),
  weekendHours: z.coerce.number().min(0).max(14).optional(),
  pace: z.enum(["SLOW", "BALANCED", "AGGRESSIVE"]).default("BALANCED"),
  weakSubjects: z.array(z.string()).default([]),
  strongSubjects: z.array(z.string()).default([]),
  targetRank: z.string().optional(),
  useAI: z.coerce.boolean().default(false),
});

export const taskUpdateSchema = z.object({
  taskId: z.string().min(1),
  status: z.enum(["NOT_STARTED", "IN_PROGRESS", "COMPLETED", "BEHIND", "FAST_PACED", "PUT_TO_REVISE"]),
  selfRating: z.coerce.number().min(1).max(5).optional(),
  notes: z.string().max(1200).optional(),
});

export const testAttemptSchema = z.object({
  title: z.string().trim().min(2).max(120),
  testType: z.string().min(1),
  subjectName: z.string().optional(),
  score: z.coerce.number().min(0),
  totalMarks: z.coerce.number().min(1),
  timeTakenMinutes: z.coerce.number().min(1),
  mistakes: z.string().optional(),
  weakTopics: z.string().optional(),
});

export const settingsSchema = z.object({
  dailyHours: z.coerce.number().min(1).max(14),
});
