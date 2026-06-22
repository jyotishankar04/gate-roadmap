import Link from "next/link";
import type { ComponentType } from "react";
import { ArrowRight, BookOpen, CheckCircle2, Clock, Flame, Target } from "lucide-react";
import { getProgressAnalytics, getStudyStreak, getWeakTopics, getBehindTopics } from "@/actions/analytics.actions";
import { getActiveRoadmap, getTodayTasks } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { TodayTaskList } from "@/components/roadmap/today-task-list";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";

type BehindTopic = Awaited<ReturnType<typeof getBehindTopics>>[number];
type WeakTopic = Awaited<ReturnType<typeof getWeakTopics>>[number];

export default async function DashboardPage() {
  const user = await requireUser();
  const [roadmap, todayDay, analytics, weakTopics, streak, behindTopics] = await Promise.all([
    getActiveRoadmap(user.id),
    getTodayTasks(user.id),
    getProgressAnalytics(user.id),
    getWeakTopics(user.id),
    getStudyStreak(user.id),
    getBehindTopics(user.id),
  ]);

  const completed = analytics?.completedTasks ?? 0;
  const pending = (analytics?.totalTasks ?? 0) - completed;
  const currentSubject = todayDay?.subjectName ?? roadmap?.days.find((day) => day.completionPercentage < 100)?.subjectName ?? "Not started";
  
  const studyingProgress = roadmap?.studyingProgress ?? 0;
  const revisionProgress = roadmap?.revisionProgress ?? 0;

  return (
    <AppShell username={user.username}>
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        <Metric title="Active roadmap" value={roadmap ? "GATE CSE 2027" : "None"} icon={Target} />
        <Metric title="Overall progress" value={`${roadmap?.overallProgress ?? 0}%`} icon={CheckCircle2} />
        <Metric title="Studying progress" value={`${studyingProgress}%`} icon={BookOpen} />
        <Metric title="Revision progress" value={`${revisionProgress}%`} icon={Clock} />
        <Metric title="Study streak" value={`${streak} days`} icon={Flame} />
      </section>

      {roadmap ? (
        <>
          <div className="grid gap-6 xl:grid-cols-[1.4fr_0.8fr]">
            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader className="flex-row items-center justify-between">
                  <div>
                    <CardTitle>{roadmap.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{completed} completed • {pending} pending</p>
                  </div>
                  <Button render={<Link href="/my-roadmap/sheet" />}>Continue to Sheet <ArrowRight data-icon="inline-end" /></Button>
                </CardHeader>
                <CardContent>
                  <Progress value={roadmap.overallProgress} />
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Current focus subject</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-lg font-semibold">{currentSubject}</p>
                  <p className="text-sm text-muted-foreground">Follow the static study plan. Today&apos;s focus is based on the 223-day timetable.</p>
                </CardContent>
              </Card>

              <TodayTaskList day={todayDay} />
            </div>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader><CardTitle>Behind topics</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {behindTopics.length ? behindTopics.slice(0, 5).map((task: BehindTopic) => (
                    <TopicPreview key={task.id} title={task.subtopicName} description={`${task.subjectName} • ${task.topicName}`} />
                  )) : <p className="text-sm text-muted-foreground">No behind topics.</p>}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Weak topics</CardTitle></CardHeader>
                <CardContent className="flex flex-col gap-3">
                  {weakTopics.length ? weakTopics.slice(0, 5).map((task: WeakTopic) => (
                    <TopicPreview key={task.id} title={task.subtopicName ?? task.topicName} description={task.subjectName} />
                  )) : <p className="text-sm text-muted-foreground">No weak topics marked yet.</p>}
                </CardContent>
              </Card>
            </div>
          </div>
        </>
      ) : (
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>GATE CSE 2027 Tracker</CardTitle>
            <CardDescription>
              Start tracking the static, pre-scheduled day-wise GATE CSE 2027 preparation plan.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-4">
            <Card data-size="sm">
              <CardContent className="flex flex-col gap-2">
                <p><Badge variant="outline">Timeline</Badge> 24 June 2026 to 1 February 2027 (223 Days)</p>
                <p><Badge variant="outline">Phase 1</Badge> STUDYING: 140 Days (C, DSA, Algorithms, Maths, DBMS, OS, Networks, TOC, Compiler, COA, Digital)</p>
                <p><Badge variant="outline">Phase 2</Badge> REVISION: 83 Days (2 Revision Cycles, PYQ Practice, Mock Tests, Final revision)</p>
                <p><Badge variant="outline">GA & English</Badge> Distributed alternate-day tasks across the entire timeline.</p>
              </CardContent>
            </Card>
            <Button render={<Link href="/my-roadmap/create-sheet" />} size="lg" className="w-full">
              Start Sheet Creation
            </Button>
          </CardContent>
        </Card>
      )}
    </AppShell>
  );
}

function TopicPreview({ title, description }: { title: string; description: string }) {
  return (
    <Card data-size="sm">
      <CardContent>
        <p className="font-medium">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function Metric({ title, value, icon: Icon }: { title: string; value: string; icon: ComponentType }) {
  return (
    <Card>
      <CardContent className="flex items-center justify-between gap-4 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 truncate text-xl font-bold">{value}</p>
        </div>
        <div className="rounded-2xl bg-primary/10 p-3 text-primary"><Icon /></div>
      </CardContent>
    </Card>
  );
}
