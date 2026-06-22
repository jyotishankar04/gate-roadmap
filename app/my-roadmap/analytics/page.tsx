import { getProgressAnalytics, getStudyStreak, getWeakTopics } from "@/actions/analytics.actions";
import { getActiveRoadmap } from "@/actions/roadmap.actions";

import { getTestAttempts } from "@/actions/test.actions";
import {
  OverallProgressChart,
  DailyCompletionChart,
  StudyTimeChart as RoadmapStudyTimeChart,
  SubjectProgressChart,
  SubtopicStatusDistributionChart,
  MockScoreTrendChart,
  BehindVsCompletedChart
} from "@/components/analytics/charts";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { requireUser } from "@/lib/auth";
import { prisma } from "@/lib/db";
import { displayDate } from "@/lib/dates";


type ProgressAnalytics = NonNullable<Awaited<ReturnType<typeof getProgressAnalytics>>>;
type TestAttempt = Awaited<ReturnType<typeof getTestAttempts>>[number];
type WeakTopic = Awaited<ReturnType<typeof getWeakTopics>>[number];
type SubjectAnalyticsItem = ProgressAnalytics["subjectProgress"][number];

export default async function AnalyticsPage() {
  const user = await requireUser();
  const activeRoadmap = await getActiveRoadmap(user.id);

  if (!activeRoadmap) {
    return (
      <AppShell username={user.username}>
        <EmptyPanel title="No active roadmap" description="Start tracking the GATE CSE 2027 plan to see progress analytics." />
      </AppShell>
    );
  }

  const [analytics, streak, weakTopics, mockAttempts] = await Promise.all([
    getProgressAnalytics(user.id),
    getStudyStreak(user.id),
    getWeakTopics(user.id),
    getTestAttempts(user.id),
  ]);

  // Query Subtopic statuses counts
  const subtopicStatuses = await prisma.subtopicProgress.groupBy({
    by: ["status"],
    where: { userRoadmapId: activeRoadmap.id },
    _count: { status: true },
  });

  const subtopicStatusDistribution = [
    "NOT_STARTED",
    "IN_PROGRESS",
    "COMPLETED",
    "BEHIND",
    "FAST_PACED",
    "PUT_TO_REVISE",
  ].map((status) => {
    const found = subtopicStatuses.find((s) => s.status === status);
    return {
      status,
      count: found ? found._count.status : 0,
    };
  });

  // Query task behind vs completed
  const allTasks = await prisma.roadmapTask.findMany({
    where: { userRoadmapId: activeRoadmap.id },
    select: { status: true },
  });

  const totalTasksCount = allTasks.length;
  const completedTasksCount = allTasks.filter(t => t.status === "COMPLETED" || t.status === "FAST_PACED").length;
  const behindTasksCount = allTasks.filter(t => t.status === "BEHIND").length;

  // Mock attempts trend formatting
  const mockTrendData = mockAttempts
    .filter((attempt: TestAttempt) => attempt.testType === "FULL_MOCK" || attempt.testType === "SUBJECT_TEST")
    .map((attempt: TestAttempt) => ({
      date: displayDate(attempt.attemptedAt, "dd MMM"),
      scorePercentage: attempt.totalMarks > 0 ? Math.round((attempt.score / attempt.totalMarks) * 100) : 0,
      title: attempt.title,
    }))
    .reverse(); // Order from oldest to newest for trendline

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Deep dive into completion metrics, subject strength distribution, streaks, and test performance.</p>
      </div>

      {analytics ? (
        <>
          <div className="grid gap-4 md:grid-cols-4">
            <SummaryCard title="Overall Completion" value={`${activeRoadmap.overallProgress}%`} />
            <SummaryCard title="Study Streak" value={`${streak} days`} />
            <SummaryCard title="Hours Logged" value={`${Math.round(analytics.studyTime.reduce((sum, item) => sum + item.minutes, 0) / 60)} hrs`} />
            <SummaryCard title="Mock Tests Taken" value={mockAttempts.length} />
          </div>

          <div className="grid gap-4 xl:grid-cols-2">
            <OverallProgressChart
              overall={activeRoadmap.overallProgress}
              studying={activeRoadmap.studyingProgress}
              revision={activeRoadmap.revisionProgress}
            />
            <SubtopicStatusDistributionChart data={subtopicStatusDistribution} />
            <BehindVsCompletedChart
              behind={behindTasksCount}
              completed={completedTasksCount}
              total={totalTasksCount}
            />
            <MockScoreTrendChart data={mockTrendData} />
            <SubjectProgressChart data={analytics.subjectProgress} />
            <DailyCompletionChart data={analytics.dailyCompletion} />
            <RoadmapStudyTimeChart data={analytics.studyTime} />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <ListCard title="Strongest Subjects" items={analytics.strongestSubjects.map((item: SubjectAnalyticsItem) => `${item.subject}: ${item.progress}%`)} />
            <ListCard title="Weakest Subjects" items={analytics.weakestSubjects.map((item: SubjectAnalyticsItem) => `${item.subject}: ${item.progress}%`)} />
            <ListCard
              title="Topics Flagged for Review"
              items={weakTopics.map((item: WeakTopic) => `${item.subjectName}: ${item.subtopicName ?? item.topicName}`)}
            />
          </div>


        </>
      ) : (
        <EmptyPanel title="No analytics yet" description="Complete tasks and log test scores to view charts." />
      )}
    </AppShell>
  );
}

function SummaryCard({ title, value }: { title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm text-muted-foreground">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="mt-1 text-3xl font-black">{value}</p>
      </CardContent>
    </Card>
  );
}

function ListCard({ title, items }: { title: string; items: string[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Separator />
        {items.length ? (
          items.map((item) => (
            <Badge key={item} variant="secondary" className="h-auto justify-start py-2 whitespace-normal">
              {item}
            </Badge>
          ))
        ) : (
          <p className="text-xs text-muted-foreground p-2">No items logged yet.</p>
        )}
      </CardContent>
    </Card>
  );
}
