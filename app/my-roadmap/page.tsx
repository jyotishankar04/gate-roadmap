import Link from "next/link";
import { getActiveRoadmap } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";

import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";

const tabs = [
  ["/my-roadmap/create-sheet", "Create Sheet"],
  ["/my-roadmap/today", "Today"],
  ["/my-roadmap/sheet", "Sheet"],
  ["/my-roadmap/calendar", "Calendar"],

  ["/my-roadmap/subjects", "Subjects"],
  ["/my-roadmap/topics", "Topics"],
  ["/my-roadmap/subtopics", "Subtopics"],
  ["/my-roadmap/revision", "Revision"],
  ["/my-roadmap/strategies", "Strategies"],
  ["/my-roadmap/tests", "Tests"],
  ["/my-roadmap/analytics", "Analytics"],
];

export default async function MyRoadmapPage() {
  const user = await requireUser();
  const roadmap = await getActiveRoadmap(user.id);
  const visibleTabs = roadmap ? tabs.filter(([href]) => href !== "/my-roadmap/create-sheet") : tabs;

  return (
    <AppShell username={user.username}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-balance">My Roadmap</h1>
          <p className="text-muted-foreground">Create a dynamic roadmap, then track your timetable, tasks, and revision logs.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {visibleTabs.map(([href, label]) => (
            <Button key={href} render={<Link href={href} />} variant="outline" size="sm">
              {label}
            </Button>
          ))}
        </div>
      </div>
      
      {roadmap ? (
        <>
          <Card>
            <CardHeader>
              <CardTitle>{roadmap.title}</CardTitle>
              <p className="text-sm text-muted-foreground">
                {displayDate(roadmap.startDate)} to {displayDate(roadmap.endDate)} • {roadmap.totalDays} days total
              </p>
            </CardHeader>
            <CardContent className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
              <Stat label="Overall Progress" value={`${roadmap.overallProgress}%`} progress={roadmap.overallProgress} />
              <Stat label="Studying Progress" value={`${roadmap.studyingProgress}%`} progress={roadmap.studyingProgress} />
              <Stat label="Revision Progress" value={`${roadmap.revisionProgress}%`} progress={roadmap.revisionProgress} />
              <Stat label="Remaining Days" value={`${roadmap.totalDays} Days`} progress={100} />
            </CardContent>
          </Card>
          
          <div className="mt-4">
            <h2 className="text-xl font-bold mb-3 text-balance">Weekly Timetable Preview</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {roadmap.days.slice(0, 6).map((day) => (
                <Card key={day.id} className="border-border/60">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm">{day.title}</CardTitle>
                    <p className="text-xs text-muted-foreground">
                      {displayDate(day.date)} &middot; Day {day.dayNumber}
                    </p>
                  </CardHeader>
                  <CardContent className="flex flex-col gap-2">
                    <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
                      <span>{day.subjectName ?? "Mixed syllabus"}</span>
                      <Badge variant="outline">{Math.round(day.completionPercentage)}%</Badge>
                    </div>
                    <Progress value={day.completionPercentage} className="h-1.5" />
                    <p className="text-xs text-muted-foreground">
                      {day.tasks.length} task{day.tasks.length !== 1 ? "s" : ""}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </>
      ) : (
        <EmptyPanel title="No active roadmap" description="Start tracking the GATE CSE 2027 plan to see calendar and subjects." />
      )}
    </AppShell>
  );
}

function Stat({ label, value, progress }: { label: string; value: string | number; progress: number }) {
  return (
    <Card data-size="sm">
      <CardContent>
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-2xl font-bold capitalize">{value}</p>
        <Progress value={progress} className="mt-3" />
      </CardContent>
    </Card>
  );
}
