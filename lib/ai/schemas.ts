import { z } from "zod";

export const roadmapSubjectAllocationSchema = z.object({
  subject: z.string().min(1),
  days: z.number().int().positive(),
  reason: z.string().optional(),
});

export const roadmapInsightSchema = z.object({
  summary: z.string().min(1),
  subjectAllocations: z.array(roadmapSubjectAllocationSchema).min(1),
  revisionFocus: z.array(z.string()).default([]),
  dailyStrategy: z.array(z.string()).default([]),
  risks: z.array(z.string()).default([]),
  suggestions: z.array(z.string()).default([]),
});

export const aiRoadmapTaskSchema = z.object({
  subjectName: z.string(),
  topicName: z.string().optional(),
  subtopicName: z.string().optional(),
  title: z.string(),
  description: z.string().optional(),
  taskType: z.enum([
    "LECTURE",
    "NOTES",
    "PRACTICE",
    "PYQ",
    "REVISION",
    "TEST",
    "MOCK",
    "MOCK_ANALYSIS",
    "FORMULA_REVISION",
    "MISTAKE_ANALYSIS",
  ]),
  estimatedMinutes: z.number().min(5).max(300),
  priority: z.enum(["LOW", "MEDIUM", "HIGH", "VERY_HIGH"]),
});

export const aiRoadmapDaySchema = z.object({
  dayNumber: z.number(),
  date: z.string(),
  phase: z.enum(["STUDYING", "REVISION"]),
  title: z.string(),
  subjectName: z.string().optional(),
  tasks: z.array(aiRoadmapTaskSchema).min(1),
});

export const aiRoadmapSchema = z.object({
  summary: z.object({
    totalDays: z.number(),
    studyingDays: z.number(),
    revisionDays: z.number(),
  }),
  days: z.array(aiRoadmapDaySchema),
});

export type RoadmapInsight = z.infer<typeof roadmapInsightSchema>;
export type AiRoadmapDay = z.infer<typeof aiRoadmapDaySchema>;
export type AiRoadmapPlan = z.infer<typeof aiRoadmapSchema>;
