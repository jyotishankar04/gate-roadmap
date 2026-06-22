import Link from "next/link";
import type { RoadmapDay, RoadmapTask } from "@prisma/client";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { TaskCard } from "@/components/roadmap/task-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { displayDate, sameDay, today } from "@/lib/dates";
import { CalendarDays, ArrowRight } from "lucide-react";

function isDone(task: RoadmapTask) {
  return task.status === "COMPLETED" || task.status === "FAST_PACED";
}

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0 min";
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  if (!hours) return `${remainingMinutes} min`;
  if (!remainingMinutes) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export function TodayTaskList({
  day,
  focusTaskId,
}: {
  day: (RoadmapDay & { tasks: RoadmapTask[] }) | null;
  focusTaskId?: string | null;
}) {
  if (!day) {
    return <EmptyPanel title="No scheduled tasks" description="Generate a roadmap or open the calendar to continue from another day." />;
  }

  const isToday = sameDay(day.date, today());
  const totalTasks = day.tasks.length;
  const completedTasks = day.tasks.filter(isDone).length;
  const openTasks = Math.max(totalTasks - completedTasks, 0);
  const estimatedMinutes = day.tasks.reduce((total, task) => total + task.estimatedMinutes, 0);
  const completion = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const nextTask = day.tasks.find((task) => !isDone(task));

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="flex flex-col gap-2">
              <div className="flex flex-wrap items-center gap-2">
                <Badge variant={isToday ? "default" : "outline"}>{isToday ? "Today" : "Scheduled"}</Badge>
                <Badge variant="secondary">{day.phase.replaceAll("_", " ")}</Badge>
              </div>
              <CardTitle className="text-2xl md:text-3xl">{day.title}</CardTitle>
              <CardDescription>
                {displayDate(day.date)}{day.subjectName ? ` • ${day.subjectName}` : ""}
              </CardDescription>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button variant="outline" size="sm" render={<Link href="/my-roadmap/calendar" />}>
                <CalendarDays data-icon="inline-start" />
                Calendar
              </Button>
              <Button size="sm" render={<Link href="/my-roadmap/sheet" />}>
                Sheet
                <ArrowRight data-icon="inline-end" />
              </Button>
            </div>
          </div>
        </CardHeader>
      <CardContent className="flex flex-col gap-3 pt-0">
          <div className="flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
            <span>{completedTasks}/{totalTasks} done</span>
            <span>•</span>
            <span>{openTasks} open</span>
            <span>•</span>
            <span>{formatMinutes(estimatedMinutes)} planned</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="w-12 text-sm font-medium text-muted-foreground">{completion}%</span>
            <Progress value={completion} />
          </div>
        </CardContent>
      </Card>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Tasks</h2>
          <p className="text-sm text-muted-foreground">
            {nextTask ? `Start with ${nextTask.title}.` : "All tasks are done for this day."}
          </p>
        </div>
        {nextTask ? <Badge variant="outline">Next up: {nextTask.subjectName}</Badge> : null}
      </div>

      {day.tasks.map((task) => (
        <TaskCard key={task.id} task={task} highlighted={task.id === focusTaskId} />
      ))}
    </div>
  );
}
