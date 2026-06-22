import { gateCseSyllabus } from "./gate-cse-syllabus";

export const STATIC_GATE_START_DATE = "2026-06-24";
export const STATIC_GATE_END_DATE = "2027-02-01";

// Subject schedule mapping based on the exact timeline provided
export const SUBJECT_SCHEDULE: Record<string, { startDate: string; endDate: string; days: number }> = {
  "C Programming": { startDate: "2026-06-24", endDate: "2026-07-01", days: 8 },
  "Data Structures": { startDate: "2026-07-02", endDate: "2026-07-15", days: 14 },
  "Algorithms": { startDate: "2026-07-16", endDate: "2026-07-27", days: 12 },
  "Discrete Mathematics": { startDate: "2026-07-28", endDate: "2026-08-08", days: 12 },
  "DBMS": { startDate: "2026-08-09", endDate: "2026-08-20", days: 12 },
  "Digital Logic": { startDate: "2026-08-21", endDate: "2026-08-27", days: 7 },
  "Computer Organization and Architecture": { startDate: "2026-08-28", endDate: "2026-09-08", days: 12 },
  "Operating Systems": { startDate: "2026-09-09", endDate: "2026-09-22", days: 14 },
  "Computer Networks": { startDate: "2026-09-23", endDate: "2026-10-06", days: 14 },
  "Theory of Computation": { startDate: "2026-10-07", endDate: "2026-10-20", days: 14 },
  "Compiler Design": { startDate: "2026-10-21", endDate: "2026-10-27", days: 7 },
  "Engineering Mathematics": { startDate: "2026-10-28", endDate: "2026-11-10", days: 14 },
};

export const REVISION_BLOCKS = [
  { name: "Revision Cycle 1", startDate: "2026-11-11", endDate: "2026-12-10", days: 30 },
  { name: "Revision Cycle 2", startDate: "2026-12-11", endDate: "2026-12-31", days: 21 },
  { name: "PYQ Practice Block", startDate: "2027-01-01", endDate: "2027-01-12", days: 12 },
  { name: "Mock Test + Analysis Block", startDate: "2027-01-13", endDate: "2027-01-24", days: 12 },
  { name: "Final Revision", startDate: "2027-01-25", endDate: "2027-02-01", days: 8 },
];

export const staticGateSubjects = gateCseSyllabus.map((subj) => {
  const sched = SUBJECT_SCHEDULE[subj.name] || { startDate: STATIC_GATE_START_DATE, endDate: STATIC_GATE_END_DATE, days: 223 };
  return {
    name: subj.name,
    startDate: sched.startDate,
    endDate: sched.endDate,
    topics: subj.topics.map((t) => ({
      name: t.name,
      subtopics: t.subtopics.map((st) => st.name),
    })),
  };
});
