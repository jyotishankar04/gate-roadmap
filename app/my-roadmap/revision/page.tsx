import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { displayDate } from "@/lib/dates";

type TaskRef = {
  id: string;
  subjectName: string;
  topicName: string | null;
  subtopicName: string | null;
  plannedDate: Date;
  roadmapDay: {
    dayNumber: number;
    date: Date;
  };
};

function makeTodayLink(task: TaskRef | null | undefined) {
  if (!task) return null;
  const date = displayDate(task.roadmapDay.date, "yyyy-MM-dd");
  return `/my-roadmap/today?date=${date}&task=${task.id}#task-${task.id}`;
}

function matchTask(
  tasksByExactKey: Map<string, TaskRef[]>,
  tasksByTopicKey: Map<string, TaskRef[]>,
  subjectName: string,
  topicName: string | null | undefined,
  subtopicName?: string | null,
) {
  const topic = topicName ?? "";
  const subtopic = subtopicName ?? "";
  const exactKey = `${subjectName}::${topic}::${subtopic}`;
  const topicKey = `${subjectName}::${topic}`;
  return tasksByExactKey.get(exactKey)?.[0] ?? tasksByTopicKey.get(topicKey)?.[0] ?? null;
}

export default async function RevisionPage() {
  const user = await requireUser();

  const roadmap = await prisma.userRoadmap.findFirst({
    where: { userId: user.id, status: "ACTIVE" },
  });

  if (!roadmap) {
    return (
      <AppShell username={user.username}>
        <EmptyPanel title="No active roadmap" description="Start tracking the GATE CSE 2027 plan to see revision queues." />
      </AppShell>
    );
  }

  // 1. All PUT_TO_REVISE subtopics
  const putToReviseItems = await prisma.subtopicProgress.findMany({
    where: { userRoadmapId: roadmap.id, status: "PUT_TO_REVISE" },
    orderBy: { updatedAt: "desc" },
  });

  // 2. All BEHIND subtopics
  const behindItems = await prisma.subtopicProgress.findMany({
    where: { userRoadmapId: roadmap.id, status: "BEHIND" },
    orderBy: { plannedDate: "asc" },
  });

  // 3. Low confidence topics (TopicProgress confidence <= 40%)
  const lowConfidenceTopics = await prisma.topicProgress.findMany({
    where: {
      userRoadmapId: roadmap.id,
      confidenceScore: { not: null, lte: 40 },
    },
    orderBy: { confidenceScore: "asc" },
  });

  // 4. Weak topics from tests
  const testAttempts = await prisma.testAttempt.findMany({
    where: { userId: user.id, userRoadmapId: roadmap.id },
    select: { title: true, subjectName: true, weakTopics: true, attemptedAt: true },
    orderBy: { attemptedAt: "desc" },
  });

  const weakTopicsFromTests = testAttempts.flatMap((attempt) => {
    const topics = attempt.weakTopics;
    if (Array.isArray(topics)) {
      return topics.map((t) => ({
        topicName: String(t),
        testTitle: attempt.title,
        subjectName: attempt.subjectName ?? "General",
        attemptedAt: attempt.attemptedAt,
      }));
    }
    return [];
  });

  // 5. Revision queue (All subtopics to revise sorted by revision priority)
  const revisionQueue = await prisma.subtopicProgress.findMany({
    where: {
      userRoadmapId: roadmap.id,
      OR: [
        { status: "PUT_TO_REVISE" },
        { confidenceScore: { not: null, lte: 50 } },
        { revisionPriority: { gt: 0 } }
      ],
    },
    orderBy: [{ revisionPriority: "desc" }, { updatedAt: "desc" }],
  });

  const roadmapTasks = await prisma.roadmapTask.findMany({
    where: { userRoadmapId: roadmap.id },
    select: {
      id: true,
      subjectName: true,
      topicName: true,
      subtopicName: true,
      plannedDate: true,
      roadmapDay: {
        select: {
          dayNumber: true,
          date: true,
        },
      },
    },
    orderBy: [{ plannedDate: "asc" }, { order: "asc" }],
  });

  const tasksByExactKey = new Map<string, TaskRef[]>();
  const tasksByTopicKey = new Map<string, TaskRef[]>();
  for (const task of roadmapTasks) {
    const ref: TaskRef = task;
    const topicKey = `${task.subjectName}::${task.topicName ?? ""}`;
    const exactKey = `${task.subjectName}::${task.topicName ?? ""}::${task.subtopicName ?? ""}`;

    if (!tasksByTopicKey.has(topicKey)) tasksByTopicKey.set(topicKey, []);
    tasksByTopicKey.get(topicKey)!.push(ref);

    if (task.subtopicName) {
      if (!tasksByExactKey.has(exactKey)) tasksByExactKey.set(exactKey, []);
      tasksByExactKey.get(exactKey)!.push(ref);
    }
  }

  const hasAnyRevisionItems = 
    putToReviseItems.length > 0 || 
    behindItems.length > 0 || 
    lowConfidenceTopics.length > 0 || 
    weakTopicsFromTests.length > 0 || 
    revisionQueue.length > 0;

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Revision Board</h1>
        <p className="text-muted-foreground">Keep track of your backlog, review flags, and weak subjects to optimize preparation.</p>
      </div>

      {!hasAnyRevisionItems ? (
        <EmptyPanel title="Revision queue is empty" description="Tasks will appear here when you mark them for revision, drop below 50% confidence, or fall behind schedule." />
      ) : (
        <div className="grid gap-6 xl:grid-cols-2">
          {/* Column 1: Backlog & flags */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Behind Items ({behindItems.length})</CardTitle>
                <CardDescription>Subtopics whose planned date has passed but tasks are incomplete.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {behindItems.length ? behindItems.map((item) => (
                  (() => {
                    const task = matchTask(tasksByExactKey, tasksByTopicKey, item.subjectName, item.topicName, item.subtopicName);
                    const href = makeTodayLink(task);
                    const content = (
                      <Card key={item.id} data-size="sm" className="transition hover:border-primary/40 hover:shadow-sm">
                        <CardContent className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{item.subtopicName}</p>
                            <p className="text-xs text-muted-foreground">{item.subjectName} • {item.topicName}</p>
                          </div>
                          <div className="text-right">
                            <TaskStatusBadge status="BEHIND" />
                            <p className="mt-1 text-[10px] text-muted-foreground">Planned: {item.plannedDate ? displayDate(item.plannedDate, "dd MMM") : "—"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    if (!href) return content;
                    return (
                      <Link key={item.id} href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {content}
                      </Link>
                    );
                  })()
                )) : <p className="text-sm text-muted-foreground">No behind items. All caught up!</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Put to Revise ({putToReviseItems.length})</CardTitle>
                <CardDescription>Items flagged explicitly by you or containing self-ratings of 2 or less.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {putToReviseItems.length ? putToReviseItems.map((item) => (
                  (() => {
                    const task = matchTask(tasksByExactKey, tasksByTopicKey, item.subjectName, item.topicName, item.subtopicName);
                    const href = makeTodayLink(task);
                    const content = (
                      <Card key={item.id} data-size="sm" className="transition hover:border-primary/40 hover:shadow-sm">
                        <CardContent className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{item.subtopicName}</p>
                            <p className="text-xs text-muted-foreground">{item.subjectName} • {item.topicName}</p>
                          </div>
                          <div className="text-right">
                            <TaskStatusBadge status="PUT_TO_REVISE" />
                            <p className="mt-1 text-[10px] text-muted-foreground">Confidence: {item.confidenceScore ? `${Math.round(item.confidenceScore)}%` : "—"}</p>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    if (!href) return content;
                    return (
                      <Link key={item.id} href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {content}
                      </Link>
                    );
                  })()
                )) : <p className="text-sm text-muted-foreground">No put-to-revise items.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Low Confidence Topics ({lowConfidenceTopics.length})</CardTitle>
                <CardDescription>Topics where overall confidence average is 40% or below.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {lowConfidenceTopics.length ? lowConfidenceTopics.map((topic) => (
                  (() => {
                    const task = matchTask(tasksByExactKey, tasksByTopicKey, topic.subjectName, topic.topicName);
                    const href = makeTodayLink(task);
                    const content = (
                      <Card key={topic.id} data-size="sm" className="transition hover:border-primary/40 hover:shadow-sm">
                        <CardContent className="flex items-center justify-between gap-3">
                          <div>
                            <p className="font-semibold text-sm">{topic.topicName}</p>
                            <p className="text-xs text-muted-foreground">{topic.subjectName}</p>
                          </div>
                          <Badge variant="destructive">{Math.round(topic.confidenceScore ?? 0)}% Mastery</Badge>
                        </CardContent>
                      </Card>
                    );
                    if (!href) return content;
                    return (
                      <Link key={topic.id} href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {content}
                      </Link>
                    );
                  })()
                )) : <p className="text-sm text-muted-foreground">No low confidence topics. Keep it up!</p>}
              </CardContent>
            </Card>
          </div>

          {/* Column 2: Test feedbacks & revision queues */}
          <div className="flex flex-col gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Weak Topics from Tests ({weakTopicsFromTests.length})</CardTitle>
                <CardDescription>Weak concepts identified during test attempts and mock analysis logs.</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {weakTopicsFromTests.length ? weakTopicsFromTests.map((weak, idx) => (
                  (() => {
                    const task = matchTask(tasksByExactKey, tasksByTopicKey, weak.subjectName, weak.topicName);
                    const href = makeTodayLink(task);
                    const content = (
                      <Card key={idx} data-size="sm" className="transition hover:border-primary/40 hover:shadow-sm">
                        <CardContent className="flex flex-col gap-2">
                          <p className="font-semibold text-sm">{weak.topicName}</p>
                          <p className="text-xs text-muted-foreground">{weak.subjectName}</p>
                          <Separator />
                          <div className="flex items-center justify-between gap-3">
                            <Badge variant="outline">Test: {weak.testTitle}</Badge>
                            <span className="text-[10px] text-muted-foreground">{displayDate(weak.attemptedAt, "dd MMM yyyy")}</span>
                          </div>
                        </CardContent>
                      </Card>
                    );
                    if (!href) return content;
                    return (
                      <Link key={idx} href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {content}
                      </Link>
                    );
                  })()
                )) : <p className="text-sm text-muted-foreground">No weak topics logged from tests yet.</p>}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Revision Priority Queue ({revisionQueue.length})</CardTitle>
                <CardDescription>Consolidated queue sorted by urgency (priority score).</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-3">
                {revisionQueue.length ? revisionQueue.slice(0, 10).map((item) => (
                  (() => {
                    const task = matchTask(tasksByExactKey, tasksByTopicKey, item.subjectName, item.topicName, item.subtopicName);
                    const href = makeTodayLink(task);
                    const content = (
                      <Card key={item.id} data-size="sm" className="transition hover:border-primary/40 hover:shadow-sm">
                        <CardContent className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-3">
                            <div>
                              <p className="font-semibold text-sm">{item.subtopicName}</p>
                              <p className="text-xs text-muted-foreground">{item.subjectName} • {item.topicName}</p>
                            </div>
                            <Badge variant="outline">P: {item.revisionPriority}</Badge>
                          </div>
                          {item.notes && (
                            <p className="text-xs italic text-muted-foreground">&quot;{item.notes}&quot;</p>
                          )}
                        </CardContent>
                      </Card>
                    );
                    if (!href) return content;
                    return (
                      <Link key={item.id} href={href} className="block rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                        {content}
                      </Link>
                    );
                  })()
                )) : <p className="text-sm text-muted-foreground">Revision queue is clean.</p>}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}
