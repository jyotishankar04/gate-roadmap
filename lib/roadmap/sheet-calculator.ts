import { differenceInCalendarDays, startOfDay } from "date-fns";
import { z } from "zod";

export type PrepAggression = "LOOSE" | "BALANCED" | "AGGRESSIVE";
export type ParallelSubjects = 1 | 2 | 3;

export type SheetPlanInput = {
  userId: string;
  today: Date;
  examDate: Date;
  dailyStudyHours: number;
  weekendStudyHours: number;
  strongSubjects: string[];
  weakSubjects: string[];
  aggression: PrepAggression;
  parallelSubjects: ParallelSubjects;
};

export type SubjectAllocation = {
  subjectName: string;
  order: number;
  generatedDays: number;
  editedDays: number;
  reason: string;
  isStrong: boolean;
  isWeak: boolean;
};

export type SheetPlanPreview = {
  totalDaysRemaining: number;
  originalStudyingDays: number;
  originalRevisionDays: number;
  editedStudyingDays: number;
  adjustedRevisionDays: number;
  movedToRevisionDays: number;
  takenFromRevisionDays: number;
  isValid: boolean;
  subjectAllocations: SubjectAllocation[];
};

export const SubjectAllocationSchema = z.object({
  subjectName: z.string().min(1),
  order: z.number().int().min(1),
  generatedDays: z.number().int().min(1),
  editedDays: z.number().int().min(1),
  isStrong: z.boolean(),
  isWeak: z.boolean(),
  reason: z.string().min(1),
});

export const SheetPreviewSchema = z
  .object({
    totalDaysRemaining: z.number().int().min(1),
    originalStudyingDays: z.number().int().min(1),
    originalRevisionDays: z.number().int().min(0),
    editedStudyingDays: z.number().int().min(1),
    adjustedRevisionDays: z.number().int().min(0),
    movedToRevisionDays: z.number().int().min(0),
    takenFromRevisionDays: z.number().int().min(0),
    isValid: z.boolean(),
    subjectAllocations: z.array(SubjectAllocationSchema).min(1),
  })
  .superRefine((data, ctx) => {
    const subjectDaysTotal = data.subjectAllocations.reduce((sum, subject) => sum + subject.editedDays, 0);

    if (subjectDaysTotal !== data.editedStudyingDays) {
      ctx.addIssue({
        code: "custom",
        message: "Edited studying days must match subject allocation total.",
        path: ["editedStudyingDays"],
      });
    }

    if (data.editedStudyingDays + data.adjustedRevisionDays !== data.totalDaysRemaining) {
      ctx.addIssue({
        code: "custom",
        message: "Studying days plus revision days must equal total remaining days.",
        path: ["adjustedRevisionDays"],
      });
    }
  });

type SubjectSeed = {
  displayName: string;
  canonicalName: string;
  order: number;
  baseDays: number;
  priority: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
  weight: number;
  distributedDaily?: boolean;
};

export const DEFAULT_GATE_2027_EXAM_DATE = "2027-02-01";

export const recommendedSubjectOrder = [
  "General Aptitude",
  "Engineering Mathematics",
  "Discrete Mathematics",
  "C Programming",
  "Digital Logic",
  "Data Structures",
  "Algorithms",
  "Theory of Computation",
  "Computer Organization and Architecture",
  "Operating Systems",
  "Database Management Systems",
  "Compiler Design",
  "Computer Networks",
  "English / Verbal Ability",
] as const;

export const gateSubjectChoices = recommendedSubjectOrder.map((name, index) => ({
  name,
  order: index + 1,
}));

export function normalizeGateSubjectName(name: string) {
  const trimmed = name.trim();
  if (trimmed === "Database Management Systems" || trimmed === "DBMS") return "DBMS";
  if (trimmed === "English / Verbal Ability" || trimmed === "English") return "English";
  return trimmed;
}

export function displayGateSubjectName(name: string) {
  if (name === "DBMS") return "Database Management Systems";
  if (name === "English") return "English / Verbal Ability";
  return name;
}

const subjectSeeds: SubjectSeed[] = [
  { displayName: "General Aptitude", canonicalName: "General Aptitude", order: 1, baseDays: 0, priority: "VERY_HIGH", weight: 15, distributedDaily: true },
  { displayName: "Engineering Mathematics", canonicalName: "Engineering Mathematics", order: 2, baseDays: 14, priority: "VERY_HIGH", weight: 13 },
  { displayName: "Discrete Mathematics", canonicalName: "Discrete Mathematics", order: 3, baseDays: 12, priority: "HIGH", weight: 7 },
  { displayName: "C Programming", canonicalName: "C Programming", order: 4, baseDays: 8, priority: "MEDIUM", weight: 6 },
  { displayName: "Digital Logic", canonicalName: "Digital Logic", order: 5, baseDays: 7, priority: "MEDIUM", weight: 5 },
  { displayName: "Data Structures", canonicalName: "Data Structures", order: 6, baseDays: 14, priority: "VERY_HIGH", weight: 10 },
  { displayName: "Algorithms", canonicalName: "Algorithms", order: 7, baseDays: 12, priority: "VERY_HIGH", weight: 8 },
  { displayName: "Theory of Computation", canonicalName: "Theory of Computation", order: 8, baseDays: 14, priority: "HIGH", weight: 7 },
  {
    displayName: "Computer Organization and Architecture",
    canonicalName: "Computer Organization and Architecture",
    order: 9,
    baseDays: 12,
    priority: "HIGH",
    weight: 7,
  },
  { displayName: "Operating Systems", canonicalName: "Operating Systems", order: 10, baseDays: 14, priority: "VERY_HIGH", weight: 9 },
  { displayName: "Database Management Systems", canonicalName: "DBMS", order: 11, baseDays: 12, priority: "VERY_HIGH", weight: 8 },
  { displayName: "Compiler Design", canonicalName: "Compiler Design", order: 12, baseDays: 7, priority: "MEDIUM", weight: 4 },
  { displayName: "Computer Networks", canonicalName: "Computer Networks", order: 13, baseDays: 14, priority: "VERY_HIGH", weight: 9 },
  { displayName: "English / Verbal Ability", canonicalName: "English", order: 14, baseDays: 0, priority: "HIGH", weight: 0, distributedDaily: true },
];

function toMidnight(date: Date) {
  return startOfDay(date);
}

function getMinimumDays(seed: SubjectSeed) {
  if (seed.displayName === "Compiler Design") return 4;
  if (seed.displayName === "Digital Logic") return 5;
  if (seed.priority === "VERY_HIGH") return 10;
  if (seed.priority === "HIGH") return 8;
  return 0;
}

function getPhaseSplit(totalDaysRemaining: number, aggression: PrepAggression) {
  if (totalDaysRemaining <= 1) {
    return { studyingDays: 1, revisionDays: 0 };
  }

  if (totalDaysRemaining === 2) {
    return { studyingDays: 1, revisionDays: 1 };
  }

  let studyingDays = 0;

  if (totalDaysRemaining >= 220) studyingDays = Math.round(totalDaysRemaining * 0.65);
  else if (totalDaysRemaining >= 160) studyingDays = Math.round(totalDaysRemaining * 0.7);
  else if (totalDaysRemaining >= 100) studyingDays = Math.round(totalDaysRemaining * 0.75);
  else studyingDays = Math.round(totalDaysRemaining * 0.8);

  if (aggression === "LOOSE") studyingDays = Math.round(studyingDays * 0.95);
  if (aggression === "AGGRESSIVE") studyingDays = Math.round(studyingDays * 1.05);

  studyingDays = Math.min(Math.max(studyingDays, 1), totalDaysRemaining - 1);
  const minimumRevision = totalDaysRemaining < 100 ? Math.max(1, Math.round(totalDaysRemaining * 0.15)) : Math.round(totalDaysRemaining * 0.2);
  const revisionDays = Math.max(totalDaysRemaining - studyingDays, minimumRevision);
  studyingDays = totalDaysRemaining - revisionDays;

  return { studyingDays, revisionDays };
}

function getMinimumRevisionDays(totalDaysRemaining: number) {
  return Math.max(14, Math.round(totalDaysRemaining * 0.2));
}

function allocateIntegerDays(
  seeds: SubjectSeed[],
  studyingDays: number,
  strongSubjects: Set<string>,
  weakSubjects: Set<string>,
  aggression: PrepAggression,
) {
  const rows = seeds.map((seed) => {
    const isStrong = strongSubjects.has(seed.canonicalName);
    const isWeak = weakSubjects.has(seed.canonicalName);
    let factor = 1;

    if (isWeak) factor *= 1.2;
    if (isStrong) factor *= 0.85;
    if (aggression === "LOOSE" && isWeak) factor *= 1.05;
    if (aggression === "AGGRESSIVE" && seed.priority !== "VERY_HIGH") factor *= 0.95;

    const raw = seed.baseDays * factor;
    return {
      seed,
      isStrong,
      isWeak,
      raw,
      adjustedDays: 0,
      remainder: 0,
      locked: seed.distributedDaily ?? false,
    };
  });

  const coreRows = rows.filter((row) => !row.locked);
  const totalRaw = coreRows.reduce((sum, row) => sum + row.raw, 0) || 1;
  const targetDays = studyingDays - rows.filter((row) => row.locked).reduce((sum, row) => sum + row.adjustedDays, 0);

  for (const row of coreRows) {
    const exact = (row.raw / totalRaw) * targetDays;
    row.adjustedDays = Math.floor(exact);
    row.remainder = exact - row.adjustedDays;
    const min = getMinimumDays(row.seed);
    if (row.adjustedDays < min) {
      row.adjustedDays = min;
      row.remainder = 0;
    }
  }

  const used = coreRows.reduce((sum, row) => sum + row.adjustedDays, 0) + rows.filter((row) => row.locked).reduce((sum, row) => sum + row.adjustedDays, 0);
  let remaining = studyingDays - used;

  const addOrder = [...coreRows].sort((a, b) => {
    if (a.isWeak !== b.isWeak) return a.isWeak ? -1 : 1;
    if (a.seed.priority !== b.seed.priority) {
      const rank: Record<SubjectSeed["priority"], number> = { LOW: 0, MEDIUM: 1, HIGH: 2, VERY_HIGH: 3 };
      return rank[b.seed.priority] - rank[a.seed.priority];
    }
    return b.remainder - a.remainder;
  });

  while (remaining > 0 && addOrder.length) {
    for (const row of addOrder) {
      if (remaining <= 0) break;
      row.adjustedDays += 1;
      remaining -= 1;
    }
  }

  let excess = used + Math.max(0, -remaining) - studyingDays;
  if (excess > 0) {
    const removable = [...coreRows].sort((a, b) => {
      const aFloor = getMinimumDays(a.seed);
      const bFloor = getMinimumDays(b.seed);
      return (b.adjustedDays - bFloor) - (a.adjustedDays - aFloor);
    });
    for (const row of removable) {
      while (excess > 0 && row.adjustedDays > getMinimumDays(row.seed)) {
        row.adjustedDays -= 1;
        excess -= 1;
      }
      if (excess <= 0) break;
    }
  }

  return rows
    .map((row) => ({
      subjectName: row.seed.displayName,
      order: row.seed.order,
      generatedDays: row.seed.baseDays,
      editedDays: row.locked ? 0 : row.adjustedDays,
      reason: row.seed.distributedDaily
        ? "Distributed daily as light alternate-day support."
        : row.isWeak
          ? "Weak subject, so concept time is expanded."
          : row.isStrong
            ? "Strong subject, so concept time is compressed and shifted to practice."
            : "Allocated from the recommended learning order.",
      isStrong: row.isStrong,
      isWeak: row.isWeak,
    }))
    .sort((a, b) => a.order - b.order);
}

export function calculateSheetPlan(input: SheetPlanInput): SheetPlanPreview {
  const totalDaysRemaining = Math.max(differenceInCalendarDays(toMidnight(input.examDate), toMidnight(input.today)) + 1, 1);
  const { studyingDays, revisionDays } = getPhaseSplit(totalDaysRemaining, input.aggression);
  const strongSubjects = new Set(input.strongSubjects.map(normalizeGateSubjectName));
  const weakSubjects = new Set(input.weakSubjects.map(normalizeGateSubjectName));
  const coreSeeds = subjectSeeds.filter((seed) => !seed.distributedDaily);
  const subjectAllocations = allocateIntegerDays(coreSeeds, studyingDays, strongSubjects, weakSubjects, input.aggression);

  return SheetPreviewSchema.parse({
    totalDaysRemaining,
    originalStudyingDays: studyingDays,
    originalRevisionDays: revisionDays,
    editedStudyingDays: studyingDays,
    adjustedRevisionDays: revisionDays,
    movedToRevisionDays: 0,
    takenFromRevisionDays: 0,
    isValid: true,
    subjectAllocations,
  });
}

export function recalculatePreviewAfterSubjectEdit(
  preview: SheetPlanPreview,
  subjectName: string,
  newEditedDays: number,
): SheetPlanPreview {
  const updatedSubjects = preview.subjectAllocations.map((subject) =>
    subject.subjectName === subjectName
      ? {
          ...subject,
          editedDays: Math.max(1, Math.floor(newEditedDays)),
        }
      : subject,
  );

  const editedStudyingDays = updatedSubjects.reduce((sum, subject) => sum + subject.editedDays, 0);
  const difference = preview.originalStudyingDays - editedStudyingDays;
  const minimumRevisionDays = getMinimumRevisionDays(preview.totalDaysRemaining);

  let adjustedRevisionDays = preview.originalRevisionDays + difference;
  const movedToRevisionDays = Math.max(0, difference);
  const takenFromRevisionDays = Math.max(0, -difference);
  let isValid = true;

  if (adjustedRevisionDays < minimumRevisionDays) {
    adjustedRevisionDays = minimumRevisionDays;
    isValid = false;
  }

  if (editedStudyingDays + adjustedRevisionDays !== preview.totalDaysRemaining) {
    isValid = false;
  }

  return {
    ...preview,
    subjectAllocations: updatedSubjects,
    editedStudyingDays,
    adjustedRevisionDays,
    movedToRevisionDays,
    takenFromRevisionDays,
    isValid,
  };
}
