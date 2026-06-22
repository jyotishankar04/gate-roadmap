export type GateStrategy = {
  title: string;
  summary: string;
  whenToUse: string;
  howToUse: string[];
  useInPlatform: string[];
  cadence: string;
  sourceUrl: string;
};

export const gateStrategies: GateStrategy[] = [
  {
    title: "Weekday + weekend hour split",
    summary: "Keep weekdays short and realistic, then use weekends for deeper work.",
    whenToUse: "Best for working professionals with 8-10 hour jobs.",
    howToUse: [
      "Study 2-3 hours on weekdays.",
      "Reserve 5-8 hours across Saturday and Sunday.",
      "Protect consistency instead of chasing long, irregular sessions.",
    ],
    useInPlatform: [
      "Open Today and finish the next incomplete task first.",
      "Use Calendar to protect weekend study blocks.",
      "Review your weekly load in Sheet before the week starts.",
    ],
    cadence: "Daily + weekly",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Morning-first study block",
    summary: "Study in the morning if your mind is freshest then and evenings drain you.",
    whenToUse: "Best when evenings are unreliable or mentally exhausting.",
    howToUse: [
      "Study before office hours, ideally 5:30 AM to 7:30 AM.",
      "Use the evening only for short revision if needed.",
      "Avoid late-night study if it hurts sleep quality.",
    ],
    useInPlatform: [
      "Put the hardest task in Today at the top.",
      "Use the notes field to capture the one concept you want to retain.",
      "Move low-focus work to later in the day.",
    ],
    cadence: "Weekday routine",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Night-study fallback",
    summary: "Use this when mornings are not sustainable, but keep the block tight.",
    whenToUse: "Best for night owls or people who cannot wake early.",
    howToUse: [
      "Study from about 8:30 PM to 10:30 PM.",
      "Keep the block to concept + PYQ + revision.",
      "Stop before burnout becomes the default.",
    ],
    useInPlatform: [
      "Mark the day as completed after the focus block.",
      "Put the next day’s topic in revision if you end late.",
      "Use revision cards to avoid losing momentum.",
    ],
    cadence: "Weekday fallback",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Weekend deep-work strategy",
    summary: "Use Saturday for pending work and Sunday for mocks, analysis, and weak topics.",
    whenToUse: "Best for maximising rank jumps on limited time.",
    howToUse: [
      "Saturday: pending topics, PYQs, weekly revision.",
      "Sunday: mock test, test analysis, weak-topic repair.",
      "Never treat Sunday tests as complete until analysis is done.",
    ],
    useInPlatform: [
      "Use Calendar to reserve the entire weekend.",
      "Open Tests after the mock, then move weak topics to Revision.",
      "Track mistakes in task notes so they become the next revision queue.",
    ],
    cadence: "Every weekend",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Subject phase planning",
    summary: "Sequence subjects into foundation, core, scoring, and final revision phases.",
    whenToUse: "Best when you need a full-year roadmap instead of random study.",
    howToUse: [
      "Phase 1: foundation subjects like math, C, DS, and algorithms.",
      "Phase 2: OS, DBMS, CN, and TOC.",
      "Phase 3: compiler, digital logic, and COA.",
      "Phase 4: full revision, mocks, and weak-area repair.",
    ],
    useInPlatform: [
      "Use My Roadmap to see the current phase.",
      "Use Sheet to spot subjects that are falling behind.",
      "Move weaker subjects into Revision before switching phases.",
    ],
    cadence: "Monthly planning",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Compact easy subjects",
    summary: "Keep easier subjects short and redirect the saved time into revision and practice.",
    whenToUse: "Best when C Programming, Data Structures, DBMS, or Operating Systems are already familiar enough for a fast pass.",
    howToUse: [
      "Compress easy topics into one focused pass instead of stretching them across many days.",
      "Use the freed time for PYQs, mixed practice, and revision.",
      "Do not overspend time rereading familiar material.",
    ],
    useInPlatform: [
      "Shorten the Today block for easy subjects and add a practice block after it.",
      "Push the saved minutes into Revision and Tests.",
      "Use notes only for mistakes, traps, and formulas worth revisiting.",
    ],
    cadence: "Across the study phase",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "80/20 + PYQ-first rule",
    summary: "Focus on high-weightage ideas and previous-year questions before over-reading theory.",
    whenToUse: "Best when time is limited and you need score-efficient study.",
    howToUse: [
      "Identify the topics that drive most marks.",
      "Solve PYQs after concept study, not after endless note-taking.",
      "Use theory only to close the gap exposed by PYQs.",
    ],
    useInPlatform: [
      "Mark weak concepts in task notes after PYQ sessions.",
      "Send confusing topics to Revision immediately.",
      "Use Tests to validate whether the 80/20 focus is working.",
    ],
    cadence: "Every study block",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Daily micro-cycle",
    summary: "A simple daily structure keeps momentum without needing long study sessions.",
    whenToUse: "Best when your schedule is fragmented.",
    howToUse: [
      "Spend about 1 hour on concept study.",
      "Spend about 45 minutes on PYQs.",
      "Spend about 30 minutes on revision.",
    ],
    useInPlatform: [
      "Use Today to execute the cycle one task at a time.",
      "Mark completion immediately after each block.",
      "Use revision tags to queue the next day’s weak points.",
    ],
    cadence: "Daily",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Mock-test ladder",
    summary: "Start tests early, then increase frequency and spend serious time on analysis.",
    whenToUse: "Best when you are within the last 4 months before the exam.",
    howToUse: [
      "Start with one test every 2 weeks.",
      "Increase to weekly tests, then two per week near the end.",
      "Spend 2-3 hours analyzing every test.",
    ],
    useInPlatform: [
      "Open Tests after every mock attempt.",
      "Send weak chapters into Revision.",
      "Track repeated mistakes in the notes field.",
    ],
    cadence: "Final 4 months",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Burnout guardrails",
    summary: "Protect sleep, energy, and attention so consistency survives long prep cycles.",
    whenToUse: "Always, especially during peak workload weeks.",
    howToUse: [
      "Sleep 6-7 hours daily.",
      "Exercise for 20 minutes.",
      "Take one half-day break every week.",
      "Avoid social media drift during study hours.",
    ],
    useInPlatform: [
      "Keep a realistic daily load in Today.",
      "Do not stack too many high-effort tasks in one day.",
      "Use Calendar to protect recovery time.",
    ],
    cadence: "Always",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
  {
    title: "Six-month fast track",
    summary: "A compressed plan that keeps only the highest-return subjects and habits.",
    whenToUse: "Best when you start late and need a practical cutoff list.",
    howToUse: [
      "Study 3 hours daily and 8 hours on the weekend.",
      "Prioritise math, DS, algorithms, OS, DBMS, and CN.",
      "Drop low-weightage topics from the first pass.",
    ],
    useInPlatform: [
      "Track only the highest-value tasks in Today.",
      "Use Revision to keep weak areas from compounding.",
      "Use Tests to prove readiness before expanding the topic list.",
    ],
    cadence: "Short runway",
    sourceUrl: "https://gateatzeal.com/blogs/gate-cs-daily-timetable-for-working-professionals/",
  },
];
