import { addDays, differenceInDays, parseISO } from "date-fns";
import type { Prisma, TaskType } from "@prisma/client";
import { prisma } from "@/lib/db";
import { recalculateRoadmapProgress } from "@/lib/progress";
import { gateCseSyllabus, flattenGateParts } from "./gate-cse-syllabus";
import {
  DEFAULT_GATE_2027_EXAM_DATE,
  displayGateSubjectName,
  normalizeGateSubjectName,
  type ParallelSubjects,
  type SheetPlanPreview,
  type SubjectAllocation,
} from "./sheet-calculator";

type RoadmapTaskDraft = Omit<Prisma.RoadmapTaskCreateManyInput, "roadmapDayId" | "userRoadmapId">;
type FlattenedGatePart = ReturnType<typeof flattenGateParts>[number];
type GroupedStudyUnit = {
  subjectName: string;
  topicName: string;
  subtopicName: string;
  partNames: string[];
  estimatedMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
};

type BlockName = "Revision Cycle 1" | "Revision Cycle 2" | "PYQ Practice Block" | "Mock Test + Analysis Block" | "Final Revision";

function inferTaskType(partName: string): TaskType {
  const normalized = partName.toLowerCase();
  if (normalized.includes("mock")) return "MOCK";
  if (normalized.includes("pyq")) return "PYQ";
  if (normalized.includes("test")) return "TEST";
  if (normalized.includes("analysis") || normalized.includes("mistake")) return "MISTAKE_ANALYSIS";
  if (normalized.includes("formula")) return "FORMULA_REVISION";
  if (normalized.includes("review") || normalized.includes("revision")) return "REVISION";
  if (
    normalized.includes("example") ||
    normalized.includes("worked") ||
    normalized.includes("practice") ||
    normalized.includes("drill") ||
    normalized.includes("problem")
  ) {
    return "PRACTICE";
  }
  return "LECTURE";
}

function isWeekend(date: Date) {
  const day = date.getDay();
  return day === 0 || day === 6;
}

function buildRevisionBlocks(revisionDays: number) {
  const cycle1 = Math.round(revisionDays * 0.3);
  const cycle2 = Math.round(revisionDays * 0.25);
  const pyqDays = Math.round(revisionDays * 0.2);
  const mockDays = Math.round(revisionDays * 0.15);
  const finalDays = Math.max(revisionDays - cycle1 - cycle2 - pyqDays - mockDays, 1);
  return [
    ...Array.from({ length: cycle1 }, () => "Revision Cycle 1" as BlockName),
    ...Array.from({ length: cycle2 }, () => "Revision Cycle 2" as BlockName),
    ...Array.from({ length: pyqDays }, () => "PYQ Practice Block" as BlockName),
    ...Array.from({ length: mockDays }, () => "Mock Test + Analysis Block" as BlockName),
    ...Array.from({ length: finalDays }, () => "Final Revision" as BlockName),
  ];
}

function getSyllabusSubject(subjectName: string) {
  const canonical = normalizeGateSubjectName(subjectName);
  return gateCseSyllabus.find((subject) => subject.name === canonical);
}

function combineDifficulty(left: GroupedStudyUnit["difficulty"], right: GroupedStudyUnit["difficulty"]) {
  if (left === "HARD" || right === "HARD") return "HARD";
  if (left === "MEDIUM" || right === "MEDIUM") return "MEDIUM";
  return "EASY";
}

function combinePriority(left: GroupedStudyUnit["priority"], right: GroupedStudyUnit["priority"]) {
  const order: GroupedStudyUnit["priority"][] = ["LOW", "MEDIUM", "HIGH", "VERY_HIGH"];
  return order.indexOf(right) > order.indexOf(left) ? right : left;
}

function groupStudyUnits(parts: FlattenedGatePart[]) {
  const grouped = new Map<string, GroupedStudyUnit>();

  for (const part of parts) {
    const key = `${part.subjectName}::${part.topicName}::${part.subtopicName}`;
    const existing = grouped.get(key);

    if (!existing) {
      grouped.set(key, {
        subjectName: part.subjectName,
        topicName: part.topicName,
        subtopicName: part.subtopicName,
        partNames: [part.partName],
        estimatedMinutes: part.estimatedMinutes,
        difficulty: part.difficulty,
        priority: part.priority,
      });
      continue;
    }

    existing.partNames.push(part.partName);
    existing.estimatedMinutes += part.estimatedMinutes;
    existing.difficulty = combineDifficulty(existing.difficulty, part.difficulty);
    existing.priority = combinePriority(existing.priority, part.priority);
  }

  return [...grouped.values()];
}

function assignStudyUnitsToDays(units: GroupedStudyUnit[], totalDays: number) {
  if (totalDays <= 0) return [];

  const buckets: GroupedStudyUnit[][] = Array.from({ length: totalDays }, () => []);
  const totalMinutes = units.reduce((sum, unit) => sum + unit.estimatedMinutes, 0);
  const targetMinutes = Math.max(60, Math.ceil(totalMinutes / totalDays));
  let dayIndex = 0;
  let dayMinutes = 0;

  for (const unit of units) {
    if (dayMinutes > 0 && dayMinutes + unit.estimatedMinutes > targetMinutes && dayIndex < totalDays - 1) {
      dayIndex += 1;
      dayMinutes = 0;
    }

    buckets[dayIndex].push(unit);
    dayMinutes += unit.estimatedMinutes;
  }

  return buckets;
}

function buildStudyTasks(subjectName: string, dayUnits: GroupedStudyUnit[]) {
  const tasks: RoadmapTaskDraft[] = [];

  for (const unit of dayUnits) {
    tasks.push({
      subjectName,
      topicName: unit.topicName,
      subtopicName: unit.subtopicName,
      title: unit.subtopicName,
      description: unit.partNames.join(" | "),
      taskType: inferTaskType(unit.partNames.join(" ")),
      estimatedMinutes: unit.estimatedMinutes,
      priority: unit.priority,
      order: tasks.length,
      status: "NOT_STARTED",
      plannedDate: new Date(),
    });
  }

  if (!tasks.length && dayUnits.length) {
    const unit = dayUnits[0];
    tasks.push({
      subjectName,
      topicName: unit.topicName,
      subtopicName: unit.subtopicName,
      title: unit.subtopicName,
      description: unit.partNames.join(" | "),
      taskType: "REVISION",
      estimatedMinutes: unit.estimatedMinutes,
      priority: unit.priority,
      order: 0,
      status: "NOT_STARTED",
      plannedDate: new Date(),
    });
  }

  if (tasks.length === 0) {
    tasks.push({
      subjectName,
      title: `${subjectName} quick revision`,
      taskType: "REVISION",
      estimatedMinutes: 30,
      priority: "MEDIUM",
      order: 0,
      status: "NOT_STARTED",
      plannedDate: new Date(),
    });
  }

  return tasks;
}

function buildRevisionTasks(block: BlockName, subjectName: string): RoadmapTaskDraft[] {
  if (block === "Revision Cycle 1") {
    return [
      {
        subjectName,
        title: `Revise short notes: ${subjectName}`,
        taskType: "REVISION",
        estimatedMinutes: 60,
        priority: "HIGH",
        order: 0,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
      {
        subjectName,
        title: `Solve PYQs: ${subjectName}`,
        taskType: "PYQ",
        estimatedMinutes: 45,
        priority: "HIGH",
        order: 1,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
      {
        subjectName,
        title: `Weak-area repair: ${subjectName}`,
        taskType: "MISTAKE_ANALYSIS",
        estimatedMinutes: 30,
        priority: "MEDIUM",
        order: 2,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
    ];
  }

  if (block === "Revision Cycle 2") {
    return [
      {
        subjectName,
        title: `Speed revision: ${subjectName}`,
        taskType: "REVISION",
        estimatedMinutes: 45,
        priority: "HIGH",
        order: 0,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
      {
        subjectName,
        title: `Mixed practice: ${subjectName}`,
        taskType: "PRACTICE",
        estimatedMinutes: 45,
        priority: "HIGH",
        order: 1,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
    ];
  }

  if (block === "PYQ Practice Block") {
    return [
      {
        subjectName,
        title: `Full PYQ set: ${subjectName}`,
        taskType: "PYQ",
        estimatedMinutes: 120,
        priority: "HIGH",
        order: 0,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
      {
        subjectName,
        title: `Analyze PYQ mistakes: ${subjectName}`,
        taskType: "MISTAKE_ANALYSIS",
        estimatedMinutes: 40,
        priority: "MEDIUM",
        order: 1,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
    ];
  }

  if (block === "Mock Test + Analysis Block") {
    return [
      {
        subjectName,
        title: `Attempt mock test: ${subjectName}`,
        taskType: "MOCK",
        estimatedMinutes: 180,
        priority: "HIGH",
        order: 0,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
      {
        subjectName,
        title: `Analyze mock mistakes: ${subjectName}`,
        taskType: "MOCK_ANALYSIS",
        estimatedMinutes: 60,
        priority: "HIGH",
        order: 1,
        status: "NOT_STARTED",
        plannedDate: new Date(),
      },
    ];
  }

  return [
    {
      subjectName,
      title: `Formula book revision: ${subjectName}`,
      taskType: "FORMULA_REVISION",
      estimatedMinutes: 60,
      priority: "VERY_HIGH",
      order: 0,
      status: "NOT_STARTED",
      plannedDate: new Date(),
    },
    {
      subjectName,
      title: `Final mixed revision: ${subjectName}`,
      taskType: "REVISION",
      estimatedMinutes: 60,
      priority: "VERY_HIGH",
      order: 1,
      status: "NOT_STARTED",
      plannedDate: new Date(),
    },
  ];
}

type CreateRoadmapOptions = {
  dailyStudyHours: number;
  weekendStudyHours: number;
  parallelSubjects: ParallelSubjects;
};

export async function createDynamicGateRoadmapForUser(
  userId: string,
  preview: SheetPlanPreview,
  examDate?: Date,
  options?: CreateRoadmapOptions,
) {
  const existing = await prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
    orderBy: { createdAt: "desc" },
  });

  if (existing) {
    await prisma.userRoadmap.update({
      where: { id: existing.id },
      data: { status: "ARCHIVED" },
    });
  }

  const startDate = new Date();
  const finalExamDate = examDate ?? parseISO(DEFAULT_GATE_2027_EXAM_DATE);
  const totalDays = differenceInDays(finalExamDate, startDate) + 1;
  const roadmap = await prisma.userRoadmap.create({
    data: {
      userId,
      title: "GATE CSE Dynamic Roadmap",
      startDate,
      endDate: finalExamDate,
      totalDays,
      studyingDays: preview.editedStudyingDays,
      revisionDays: preview.adjustedRevisionDays,
      status: "ACTIVE",
      overallProgress: 0,
      studyingProgress: 0,
      revisionProgress: 0,
    },
  });

  const studyAllocations = preview.subjectAllocations.filter((allocation) => allocation.editedDays > 0);
  const studySchedule: { subjectName: string; dayIndexWithinSubject: number; allocation: SubjectAllocation }[] = [];
  const subjectDayPlans = new Map<string, GroupedStudyUnit[][]>();
  for (const allocation of studyAllocations) {
    const syllabusSubject = getSyllabusSubject(allocation.subjectName);
    const studyUnits = syllabusSubject ? groupStudyUnits(flattenGateParts(syllabusSubject)) : [];
    subjectDayPlans.set(allocation.subjectName, assignStudyUnitsToDays(studyUnits, allocation.editedDays));

    for (let i = 0; i < allocation.editedDays; i += 1) {
      studySchedule.push({ subjectName: allocation.subjectName, dayIndexWithinSubject: i + 1, allocation });
    }
  }

  const revisionBlocks = buildRevisionBlocks(preview.adjustedRevisionDays);
  const revisionSubjects = studyAllocations.length ? studyAllocations.map((item) => item.subjectName) : ["General Aptitude"];
  const totalDaysToCreate = preview.editedStudyingDays + preview.adjustedRevisionDays;

  let studyCursor = 0;
  let revisionCursor = 0;

  for (let dayNumber = 1; dayNumber <= totalDaysToCreate; dayNumber += 1) {
    const currentDate = addDays(startDate, dayNumber - 1);
    const isStudyPhase = dayNumber <= preview.editedStudyingDays;
    const studyDay = isStudyPhase ? studySchedule[studyCursor] : null;
    const subjectName = isStudyPhase
      ? studyDay?.subjectName ?? studyAllocations[0]?.subjectName ?? "General Aptitude"
      : revisionSubjects[(revisionCursor + dayNumber) % revisionSubjects.length] ?? "General Aptitude";

    const dayTitle = isStudyPhase
      ? `${subjectName} - Day ${studyDay?.dayIndexWithinSubject ?? dayNumber}`
      : `${revisionBlocks[revisionCursor] ?? "Final Revision"} - Day ${revisionCursor + 1}`;

    const day = await prisma.roadmapDay.create({
      data: {
        userRoadmapId: roadmap.id,
        dayNumber,
        date: currentDate,
        phase: isStudyPhase ? "STUDYING" : "REVISION",
        title: dayTitle,
        description: isStudyPhase ? `Focus on ${subjectName}.` : `Focus on ${revisionBlocks[revisionCursor] ?? "Final Revision"}.`,
        subjectName: displayGateSubjectName(subjectName),
        status: "NOT_STARTED",
        completionPercentage: 0,
      },
    });

    const dayBudget = (isWeekend(currentDate) ? options?.weekendStudyHours ?? 6 : options?.dailyStudyHours ?? 4) * 60;
    const tasks: RoadmapTaskDraft[] = [];

    if (isStudyPhase) {
      const allocation = studyDay?.allocation ?? studyAllocations[0];
      const chunks = allocation ? subjectDayPlans.get(allocation.subjectName) : null;
      const dayUnits = chunks?.[Math.max((studyDay?.dayIndexWithinSubject ?? 1) - 1, 0)] ?? [];
      tasks.push(
        ...buildStudyTasks(subjectName, dayUnits).map((task) => ({
          ...task,
          plannedDate: currentDate,
        })),
      );

      const secondary = dayNumber % 2 === 0 ? "English" : "General Aptitude";
      const secondarySubject = getSyllabusSubject(secondary);
      const secondaryPart = secondarySubject ? flattenGateParts(secondarySubject)[studyCursor % Math.max(flattenGateParts(secondarySubject).length, 1)] : null;
      if (secondaryPart) {
        tasks.push({
          subjectName: displayGateSubjectName(secondary),
          topicName: secondaryPart.topicName,
          subtopicName: secondaryPart.subtopicName,
          title: secondaryPart.partName,
          description: `${secondaryPart.topicName} > ${secondaryPart.subtopicName}`,
          taskType: inferTaskType(secondaryPart.partName),
          estimatedMinutes: 20,
          priority: "MEDIUM",
          order: tasks.length,
          status: "NOT_STARTED",
          plannedDate: currentDate,
        });
      }

      if ((options?.parallelSubjects ?? 1) > 1 && dayBudget - tasks.reduce((sum, task) => sum + (task.estimatedMinutes ?? 0), 0) > 40) {
        tasks.push({
          subjectName,
          title: `Mixed recall block: ${subjectName}`,
          taskType: "REVISION",
          estimatedMinutes: 30,
          priority: "MEDIUM",
          order: tasks.length,
          status: "NOT_STARTED",
          plannedDate: currentDate,
        });
      }

      studyCursor += 1;
    } else {
      const block = revisionBlocks[revisionCursor] ?? "Final Revision";
      tasks.push(
        ...buildRevisionTasks(block, subjectName).map((task) => ({
          ...task,
          plannedDate: currentDate,
        })),
      );
      revisionCursor += 1;
    }

    if (tasks.length) {
      await prisma.roadmapTask.createMany({
        data: tasks.map((task) => ({
          ...task,
          estimatedMinutes: task.estimatedMinutes ?? 0,
          roadmapDayId: day.id,
          userRoadmapId: roadmap.id,
        })),
      });
    }
  }

  for (const subj of gateCseSyllabus) {
    const displayName = displayGateSubjectName(subj.name);
    const topicsList = subj.topics;
    const subtopicsList = subj.topics.flatMap((topic) => topic.subtopics);

    await prisma.subjectProgress.create({
      data: {
        userRoadmapId: roadmap.id,
        subjectName: displayName,
        totalTopics: topicsList.length,
        completedTopics: 0,
        totalSubtopics: subtopicsList.length,
        completedSubtopics: 0,
        status: "NOT_STARTED",
        progressPercentage: 0,
      },
    });

    for (const topic of topicsList) {
      await prisma.topicProgress.create({
        data: {
          userRoadmapId: roadmap.id,
          subjectName: displayName,
          topicName: topic.name,
          totalSubtopics: topic.subtopics.length,
          completedSubtopics: 0,
          status: "NOT_STARTED",
          progressPercentage: 0,
        },
      });

      for (const subtopic of topic.subtopics) {
        await prisma.subtopicProgress.create({
          data: {
            userRoadmapId: roadmap.id,
            subjectName: displayName,
            topicName: topic.name,
            subtopicName: subtopic.name,
            plannedDate: null,
            status: "NOT_STARTED",
            progressPercentage: 0,
            revisionPriority: 0,
          },
        });
      }
    }
  }

  await recalculateRoadmapProgress(prisma, roadmap.id);
  return roadmap;
}
