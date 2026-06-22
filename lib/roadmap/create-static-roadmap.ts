import { prisma } from "@/lib/db";
import type { Prisma, TaskType } from "@prisma/client";
import { addDays, parseISO, differenceInDays } from "date-fns";
import { flattenGateParts, gateCseSyllabus } from "./gate-cse-syllabus";
import { SUBJECT_SCHEDULE, REVISION_BLOCKS, STATIC_GATE_START_DATE, STATIC_GATE_END_DATE } from "./static-gate-roadmap";
import { recalculateRoadmapProgress } from "@/lib/progress";

const CORE_STUDY_MINUTES_PER_DAY = 240;

type FlattenedGatePart = ReturnType<typeof flattenGateParts>[number];
type RoadmapTaskDraft = Omit<Prisma.RoadmapTaskCreateManyInput, "roadmapDayId" | "userRoadmapId">;
type GroupedStudyUnit = {
  subjectName: string;
  topicName: string;
  subtopicName: string;
  partNames: string[];
  estimatedMinutes: number;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  priority: "LOW" | "MEDIUM" | "HIGH" | "VERY_HIGH";
};

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

function assignPartsToDays<T extends { estimatedMinutes: number }>(parts: T[], totalDays: number) {
  let dayIndex = 0;
  let dayMinutes = 0;

  return parts.map((part) => {
    if (dayMinutes > 0 && dayMinutes + part.estimatedMinutes > CORE_STUDY_MINUTES_PER_DAY && dayIndex < totalDays - 1) {
      dayIndex += 1;
      dayMinutes = 0;
    }

    const assignedDayIndex = dayIndex;
    dayMinutes += part.estimatedMinutes;
    return { ...part, assignedDayIndex };
  });
}

export async function createStaticGateRoadmapForUser(userId: string) {
  // Check if user already has an active roadmap
  const existing = await prisma.userRoadmap.findFirst({
    where: { userId, status: "ACTIVE" },
  });
  if (existing) return existing;

  const startDate = parseISO(STATIC_GATE_START_DATE);
  const endDate = parseISO(STATIC_GATE_END_DATE);
  
  // Total 223 days inclusive
  const totalDays = differenceInDays(endDate, startDate) + 1;
  const studyingDays = 140;
  const revisionDays = 83;

  return await prisma.$transaction(async (tx) => {
    // 1. Create UserRoadmap
    const roadmap = await tx.userRoadmap.create({
      data: {
        userId,
        title: "GATE CSE 2027 Static Roadmap",
        startDate,
        endDate,
        totalDays,
        studyingDays,
        revisionDays,
        status: "ACTIVE",
        overallProgress: 0,
        studyingProgress: 0,
        revisionProgress: 0,
      },
    });

    // Flatten subjects lists
    const mainSubjects = gateCseSyllabus.filter(s => SUBJECT_SCHEDULE[s.name]);
    const aptitudeSubject = gateCseSyllabus.find(s => s.name === "General Aptitude")!;
    const englishSubject = gateCseSyllabus.find(s => s.name === "English")!;
    
    const aptitudeSubtopics = aptitudeSubject.topics.flatMap(t => 
      t.subtopics.map(st => ({ topicName: t.name, subtopicName: st.name }))
    );
    const englishSubtopics = englishSubject.topics.flatMap(t => 
      t.subtopics.map(st => ({ topicName: t.name, subtopicName: st.name }))
    );

    // Subject lists to cycle in revision
    const subjectNamesList = mainSubjects.map(s => s.name);

    // Prepare days and tasks
    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const currentDate = addDays(startDate, dayNum - 1);
      
      let phase: "STUDYING" | "REVISION" = "STUDYING";
      let dayTitle = "";
      let daySubjectName: string | null = null;
      let dayDescription = "";
      
      const tasksData: RoadmapTaskDraft[] = [];

      // Check which phase and subject
      if (dayNum <= studyingDays) {
        phase = "STUDYING";
        // Find subject in schedule
        const currentSubject = mainSubjects.find(s => {
          const sched = SUBJECT_SCHEDULE[s.name];
          if (!sched) return false;
          const sStart = parseISO(sched.startDate);
          const sEnd = parseISO(sched.endDate);
          return currentDate >= sStart && currentDate <= sEnd;
        });

        if (currentSubject) {
          daySubjectName = currentSubject.name;
          const sched = SUBJECT_SCHEDULE[currentSubject.name]!;
          const subjectStartDate = parseISO(sched.startDate);
          const subjectDayIndex = differenceInDays(currentDate, subjectStartDate);
          
          dayTitle = `${currentSubject.name} - Day ${subjectDayIndex + 1}`;
          dayDescription = `Focus on studying ${currentSubject.name}.`;

          const assignedUnits = assignPartsToDays(groupStudyUnits(flattenGateParts(currentSubject)), sched.days).filter(
            (unit) => unit.assignedDayIndex === subjectDayIndex,
          );

          assignedUnits.forEach((unit, idx) => {
            tasksData.push({
              subjectName: currentSubject.name,
              topicName: unit.topicName,
              subtopicName: unit.subtopicName,
              title: unit.subtopicName,
              description: unit.partNames.length > 1 ? unit.partNames.join(" | ") : `${unit.topicName} > ${unit.subtopicName}`,
              taskType: inferTaskType(unit.partNames.join(" ")),
              estimatedMinutes: unit.estimatedMinutes,
              priority: unit.priority,
              order: idx,
              status: "NOT_STARTED",
              plannedDate: currentDate,
            });
          });
        } else {
          dayTitle = `General Study - Day ${dayNum}`;
          dayDescription = `General preparation focus.`;
        }
      } else {
        phase = "REVISION";
        // Find which revision block
        const block = REVISION_BLOCKS.find(b => {
          const bStart = parseISO(b.startDate);
          const bEnd = parseISO(b.endDate);
          return currentDate >= bStart && currentDate <= bEnd;
        });

        const blockName = block ? block.name : "Revision";
        const blockStartDate = block ? parseISO(block.startDate) : parseISO("2026-11-11");
        const blockDayIndex = differenceInDays(currentDate, blockStartDate);
        
        dayTitle = `${blockName} - Day ${blockDayIndex + 1}`;
        dayDescription = `Focus on ${blockName}.`;
        
        // Cycle subject to revise
        const cycleSubjectName = subjectNamesList[blockDayIndex % subjectNamesList.length];
        daySubjectName = cycleSubjectName;

        if (blockName === "Revision Cycle 1") {
          tasksData.push({
            subjectName: cycleSubjectName,
            title: `Revision Cycle 1: ${cycleSubjectName} revision session`,
            taskType: "REVISION",
            estimatedMinutes: 60,
            priority: "HIGH",
            order: 0,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Revise formulas and short notes: ${cycleSubjectName}`,
            taskType: "FORMULA_REVISION",
            estimatedMinutes: 30,
            priority: "MEDIUM",
            order: 1,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Revision Cycle 1: ${cycleSubjectName} practice questions`,
            taskType: "PRACTICE",
            estimatedMinutes: 45,
            priority: "MEDIUM",
            order: 2,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        } else if (blockName === "Revision Cycle 2") {
          tasksData.push({
            subjectName: cycleSubjectName,
            title: `Revision Cycle 2: ${cycleSubjectName} speed revision`,
            taskType: "REVISION",
            estimatedMinutes: 45,
            priority: "HIGH",
            order: 0,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Fast formula review: ${cycleSubjectName}`,
            taskType: "FORMULA_REVISION",
            estimatedMinutes: 30,
            priority: "MEDIUM",
            order: 1,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Revision Cycle 2: ${cycleSubjectName} mixed practice`,
            taskType: "PRACTICE",
            estimatedMinutes: 45,
            priority: "MEDIUM",
            order: 2,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        } else if (blockName === "PYQ Practice Block") {
          tasksData.push({
            subjectName: cycleSubjectName,
            title: `Full paper PYQ Practice session: ${cycleSubjectName}`,
            taskType: "PYQ",
            estimatedMinutes: 120,
            priority: "HIGH",
            order: 0,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Analyze PYQ mistakes and bookmark doubts: ${cycleSubjectName}`,
            taskType: "MISTAKE_ANALYSIS",
            estimatedMinutes: 40,
            priority: "MEDIUM",
            order: 1,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        } else if (blockName === "Mock Test + Analysis Block") {
          tasksData.push({
            subjectName: cycleSubjectName,
            title: `Attempt full-length GATE mock test: ${cycleSubjectName}`,
            taskType: "MOCK",
            estimatedMinutes: 180,
            priority: "HIGH",
            order: 0,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `In-depth Mock Analysis & identify weak areas: ${cycleSubjectName}`,
            taskType: "MOCK_ANALYSIS",
            estimatedMinutes: 60,
            priority: "HIGH",
            order: 1,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        } else { // Final Revision
          tasksData.push({
            subjectName: cycleSubjectName,
            title: `Final formula book revision: ${cycleSubjectName}`,
            taskType: "FORMULA_REVISION",
            estimatedMinutes: 60,
            priority: "VERY_HIGH",
            order: 0,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          }, {
            subjectName: cycleSubjectName,
            title: `Revise marked/difficult PYQs & mistake notebook: ${cycleSubjectName}`,
            taskType: "REVISION",
            estimatedMinutes: 90,
            priority: "VERY_HIGH",
            order: 1,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        }
      }

      // Alternate day General Aptitude vs English task
      const distIndex = Math.floor((dayNum - 1) / 2);
      if (dayNum % 2 !== 0) {
        const sub = aptitudeSubtopics[distIndex % aptitudeSubtopics.length];
        if (sub) {
          tasksData.push({
            subjectName: "General Aptitude",
            topicName: sub.topicName,
            subtopicName: sub.subtopicName,
            title: `Aptitude Practice: ${sub.subtopicName}`,
            taskType: "PRACTICE",
            estimatedMinutes: 20,
            priority: "MEDIUM",
            order: 99,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        }
      } else {
        const sub = englishSubtopics[distIndex % englishSubtopics.length];
        if (sub) {
          tasksData.push({
            subjectName: "English",
            topicName: sub.topicName,
            subtopicName: sub.subtopicName,
            title: `Verbal Practice: ${sub.subtopicName}`,
            taskType: "PRACTICE",
            estimatedMinutes: 20,
            priority: "MEDIUM",
            order: 99,
            status: "NOT_STARTED",
            plannedDate: currentDate,
          });
        }
      }

      // Create the RoadmapDay
      const createdDay = await tx.roadmapDay.create({
        data: {
          userRoadmapId: roadmap.id,
          dayNumber: dayNum,
          date: currentDate,
          phase,
          title: dayTitle,
          description: dayDescription,
          subjectName: daySubjectName,
          status: "NOT_STARTED",
          completionPercentage: 0,
        },
      });

      // Insert all tasks for the day
      if (tasksData.length > 0) {
        await tx.roadmapTask.createMany({
          data: tasksData.map(t => ({
            ...t,
            roadmapDayId: createdDay.id,
            userRoadmapId: roadmap.id,
          })),
        });
      }
    }

    // Initialize SubjectProgress, TopicProgress, and SubtopicProgress for all items in gateCseSyllabus
    for (const subj of gateCseSyllabus) {
      const topicsList = subj.topics;
      const subtopicsList = subj.topics.flatMap(t => t.subtopics);

      await tx.subjectProgress.create({
        data: {
          userRoadmapId: roadmap.id,
          subjectName: subj.name,
          totalTopics: topicsList.length,
          completedTopics: 0,
          totalSubtopics: subtopicsList.length,
          completedSubtopics: 0,
          status: "NOT_STARTED",
          progressPercentage: 0,
        },
      });

      for (const t of topicsList) {
        await tx.topicProgress.create({
          data: {
            userRoadmapId: roadmap.id,
            subjectName: subj.name,
            topicName: t.name,
            totalSubtopics: t.subtopics.length,
            completedSubtopics: 0,
            status: "NOT_STARTED",
            progressPercentage: 0,
          },
        });

        for (const st of t.subtopics) {
          // Find planned date if any matching main schedule, or fallback
          let plannedDate: Date | null = null;
          if (SUBJECT_SCHEDULE[subj.name]) {
            const sched = SUBJECT_SCHEDULE[subj.name]!;
            const subtopicsOfSubj = subj.topics.flatMap(tp => tp.subtopics.map(st => st.name));
            const subIdx = subtopicsOfSubj.indexOf(st.name);
            if (subIdx !== -1) {
              const dayOffset = Math.floor((subIdx * sched.days) / subtopicsOfSubj.length);
              plannedDate = addDays(parseISO(sched.startDate), dayOffset);
            }
          }

          await tx.subtopicProgress.create({
            data: {
              userRoadmapId: roadmap.id,
              subjectName: subj.name,
              topicName: t.name,
              subtopicName: st.name,
              plannedDate,
              status: "NOT_STARTED",
              progressPercentage: 0,
              revisionPriority: 0,
            },
          });
        }
      }
    }

    // Call recalculateRoadmapProgress to populate and update all numbers
    await recalculateRoadmapProgress(tx, roadmap.id);

    return roadmap;
  });
}
