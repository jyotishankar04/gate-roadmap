"use client";

import { useMemo, useState, useCallback, useTransition } from "react";
import type { RoadmapDay, RoadmapTask } from "@prisma/client";
import { format, startOfMonth, addMonths, subMonths, getDaysInMonth, startOfWeek, addDays } from "date-fns";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { displayDate, sameDay, today, toStartOfDay } from "@/lib/dates";
import { ChevronLeft, ChevronRight, Clock, ListTodo, CircleCheck } from "lucide-react";
import { updateTaskStatus } from "@/actions/task.actions";

type CalendarDay = RoadmapDay & { tasks: RoadmapTask[] };
type CalendarView = "month" | "week" | "day" | "agenda";

type GridCell = {
  date: Date;
  isCurrentMonth: boolean;
};

function formatMinutes(minutes: number) {
  if (minutes <= 0) return "0m";
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (!h) return `${m}m`;
  if (!m) return `${h}h`;
  return `${h}h ${m}m`;
}

function dayMeta(day: CalendarDay) {
  const total = day.tasks.length;
  const done = day.tasks.filter((t) => t.status === "COMPLETED" || t.status === "FAST_PACED").length;
  const estimated = day.tasks.reduce((s, t) => s + t.estimatedMinutes, 0);
  return { total, done, estimated };
}

function getMonthGrid(year: number, month: number): GridCell[] {
  const firstOfMonth = new Date(year, month, 1);
  const start = startOfWeek(firstOfMonth, { weekStartsOn: 0 });
  const totalCells = 42;
  const cells: GridCell[] = [];
  for (let i = 0; i < totalCells; i++) {
    const d = addDays(start, i);
    cells.push({ date: d, isCurrentMonth: d.getMonth() === month });
  }
  return cells;
}

function weekStarts(reference: Date) {
  const start = startOfWeek(reference, { weekStartsOn: 0 });
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function MinimalCalendarView({ days }: { days: CalendarDay[] }) {
  const [, startTransition] = useTransition();

  const normalizedDays = useMemo(() => days.map(normalizeDay), [days]);
  const initialDate = useMemo(
    () => normalizedDays.find((d) => d.date >= today())?.date ?? normalizedDays[0]?.date,
    [normalizedDays],
  );

  const [localDays, setLocalDays] = useState<CalendarDay[]>(normalizedDays);
  const [view, setView] = useState<CalendarView>("month");
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(initialDate);
  const [currentMonth, setCurrentMonth] = useState(() => startOfMonth(initialDate ?? new Date()));

  const dayMap = useMemo(
    () => new Map(localDays.map((d) => [format(d.date, "yyyy-MM-dd"), d])),
    [localDays],
  );

  const selectedDay = useMemo(
    () => localDays.find((d) => selectedDate && sameDay(d.date, selectedDate)) ?? null,
    [localDays, selectedDate],
  );

  const monthGrid = useMemo(
    () => getMonthGrid(currentMonth.getFullYear(), currentMonth.getMonth()),
    [currentMonth],
  );

  const gridDayData = useCallback(
    (date: Date) => dayMap.get(format(date, "yyyy-MM-dd")) ?? null,
    [dayMap],
  );

  const weekDays = useMemo(() => weekStarts(selectedDate ?? today()), [selectedDate]);

  const totalDays = localDays.length;
  const completedDays = localDays.filter((d) => d.completionPercentage >= 100).length;
  const completionRate = totalDays ? Math.round((completedDays / totalDays) * 100) : 0;

  const allTasks = useMemo(() => localDays.flatMap((d) => d.tasks), [localDays]);
  const totalAllTasks = allTasks.length;
  const completedAllTasks = allTasks.filter((t) => t.status === "COMPLETED" || t.status === "FAST_PACED").length;
  const overallCompletion = totalAllTasks ? Math.round((completedAllTasks / totalAllTasks) * 100) : 0;

  const todayTasks = useMemo(() => {
    const todayDay = localDays.find((d) => sameDay(d.date, today()));
    if (!todayDay) return { total: 0, done: 0, estimated: 0 };
    return dayMeta(todayDay);
  }, [localDays]);

  const upcomingDays = useMemo(
    () =>
      localDays
        .filter((d) => d.date >= today())
        .slice(0, 5),
    [localDays],
  );

  const selectedSummary = selectedDay ? dayMeta(selectedDay) : { total: 0, done: 0, estimated: 0 };

  const handleSelectDate = useCallback((date: Date) => {
    setSelectedDate(date);
    setCurrentMonth(startOfMonth(date));
  }, []);

  const handleToggleTask = useCallback(
    (taskId: string, dayId: string) => {
      setLocalDays((prev) =>
        prev.map((day) => {
          if (day.id !== dayId) return day;
          const newTasks = day.tasks.map((task) => {
            if (task.id !== taskId) return task;
            const isComplete = task.status === "COMPLETED" || task.status === "FAST_PACED";
            return { ...task, status: isComplete ? "NOT_STARTED" as const : "COMPLETED" as const };
          });
          const done = newTasks.filter((t) => t.status === "COMPLETED" || t.status === "FAST_PACED").length;
          const pct = newTasks.length ? Math.round((done / newTasks.length) * 100) : 0;
          return { ...day, tasks: newTasks, completionPercentage: pct };
        }),
      );

      const task = localDays.find((d) => d.id === dayId)?.tasks.find((t) => t.id === taskId);
      if (!task) return;
      const isComplete = task.status === "COMPLETED" || task.status === "FAST_PACED";
      const newStatus = isComplete ? "NOT_STARTED" : "COMPLETED";

      startTransition(async () => {
        const fd = new FormData();
        fd.set("taskId", taskId);
        fd.set("status", newStatus);
        await updateTaskStatus(fd);
      });
    },
    [localDays],
  );

  const statCards = useMemo(
    () => [
      { label: "Completed", value: `${completedDays}/${totalDays} days` },
      { label: "Current Month", value: format(currentMonth, "MMM yyyy") },
      { label: "Selected Day", value: selectedDate ? format(selectedDate, "dd MMM") : "\u2014" },
      { label: "Today Tasks", value: `${todayTasks.done}/${todayTasks.total} done` },
    ],
    [completedDays, totalDays, currentMonth, selectedDate, todayTasks],
  );

  return (
    <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
      <div className="flex flex-col gap-4">
        <Card className="border-border/70 shadow-none">
          <CardHeader className="gap-3 pb-0">
            <div className="flex items-start justify-between gap-3">
              <div>
                <CardTitle className="text-lg">Calendar</CardTitle>
                <CardDescription>A clean month view with only the details you need.</CardDescription>
              </div>
              <Badge variant="outline" className="gap-1.5 text-xs">
                <CircleCheck className="size-3.5" />
                {overallCompletion}%
              </Badge>
            </div>

            <div className="flex flex-wrap items-center gap-2 text-xs">
              <Badge variant="outline" className="gap-1.5">
                <ListTodo className="size-3.5" />
                {totalDays} days
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                <Clock className="size-3.5" />
                {upcomingDays.length} upcoming
              </Badge>
              <Badge variant="outline" className="gap-1.5">
                {selectedDate ? format(selectedDate, "dd MMM") : "\u2014"}
              </Badge>
            </div>

            <Progress value={overallCompletion} className="h-1.5" />
          </CardHeader>

          <CardContent className="flex flex-col gap-4 pt-4">
            <Tabs value={view} onValueChange={(v) => setView(v as CalendarView)}>
              <TabsList className="grid w-full grid-cols-4">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
                <TabsTrigger value="agenda">Agenda</TabsTrigger>
              </TabsList>
            </Tabs>

            <div className="min-h-[320px]">
              {view === "month" && (
                <MonthGrid
                  grid={monthGrid}
                  currentMonth={currentMonth}
                  selectedDate={selectedDate}
                  dayMap={dayMap}
                  gridDayData={gridDayData}
                  onSelectDate={handleSelectDate}
                  onPrevMonth={() => setCurrentMonth((m) => subMonths(m, 1))}
                  onNextMonth={() => setCurrentMonth((m) => addMonths(m, 1))}
                />
              )}

              {view === "week" && (
                <WeekView
                  weekDays={weekDays}
                  dayMap={dayMap}
                  selectedDate={selectedDate}
                  onSelectDate={handleSelectDate}
                />
              )}

              {view === "day" && (
                <DayViewPanel day={selectedDay} summary={selectedSummary} />
              )}

              {view === "agenda" && (
                <AgendaView days={upcomingDays} selectedDate={selectedDate} onSelectDate={handleSelectDate} />
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {statCards.map((s) => (
                <StatBox key={s.label} label={s.label} value={s.value} />
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex min-w-0 flex-col gap-4">
        <SelectedDayCard
          day={selectedDay}
          summary={selectedSummary}
          onToggleTask={handleToggleTask}
        />

        <UpcomingCard
          days={upcomingDays}
          selectedDate={selectedDate}
          onSelectDate={handleSelectDate}
        />
      </div>
    </div>
  );
}

function MonthGrid({
  grid,
  currentMonth,
  selectedDate,
  dayMap,
  gridDayData,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
}: {
  grid: GridCell[];
  currentMonth: Date;
  selectedDate: Date | undefined;
  dayMap: Map<string, CalendarDay>;
  gridDayData: (date: Date) => CalendarDay | null;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
}) {
  const weeks: GridCell[][] = [];
  for (let i = 0; i < 6; i++) weeks.push(grid.slice(i * 7, (i + 1) * 7));

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center justify-between pb-2">
        <button
          type="button"
          onClick={onPrevMonth}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronLeft className="size-4" />
        </button>
        <span className="text-sm font-medium">{format(currentMonth, "MMMM yyyy")}</span>
        <button
          type="button"
          onClick={onNextMonth}
          className="flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px">
        {DAY_LABELS.map((label) => (
          <div
            key={label}
            className="pb-1 text-center text-[11px] font-medium uppercase tracking-wider text-muted-foreground"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-px rounded-lg border border-border/60 bg-border/30 p-2">
        {grid.map((cell, idx) => {
          const dayData = gridDayData(cell.date);
          const isSel = selectedDate && sameDay(cell.date, selectedDate);
          const isTod = sameDay(cell.date, today());
          const meta = dayData ? dayMeta(dayData) : null;
          const completed = dayData ? dayData.completionPercentage >= 100 : false;
          const partial = dayData && dayData.completionPercentage > 0 && dayData.completionPercentage < 100;
          const behind = dayData && dayData.completionPercentage === 0 && cell.date < today() && !sameDay(cell.date, today());

          return (
            <button
              key={idx}
              type="button"
              onClick={() => onSelectDate(cell.date)}
              className={cn(
                "flex min-h-[56px] flex-col items-center gap-0.5 px-1 py-1.5 text-center transition-colors",
                !cell.isCurrentMonth && "opacity-30",
                cell.isCurrentMonth && dayData && "cursor-pointer hover:bg-muted/40",
                cell.isCurrentMonth && !dayData && "cursor-default",
                isSel && "bg-primary/10 ring-1 ring-primary/40",
                isTod && !isSel && "bg-primary/20",
              )}
            >
              <span
                className={cn(
                  "flex size-6 items-center justify-center rounded-full text-xs",
                  isTod && "bg-primary text-primary-foreground font-medium",
                  isSel && !isTod && "bg-primary text-primary-foreground font-medium",
                  !isSel && !isTod && "text-foreground",
                )}
              >
                {format(cell.date, "d")}
              </span>
              {dayData && (
                <div className="flex flex-col items-center gap-0.5">
                  {completed && (
                    <CircleCheck className="size-3 text-green-500" />
                  )}
                  {partial && !completed && (
                    <div className="flex gap-0.5">
                      <div className="size-1.5 rounded-full bg-amber-500" />
                      <div className="size-1.5 rounded-full bg-muted-foreground/30" />
                    </div>
                  )}
                  {!completed && !partial && behind && (
                    <div className="size-1.5 rounded-full bg-red-500/60" />
                  )}
                  {!completed && !partial && !behind && (
                    <div className="size-1.5 rounded-full bg-muted-foreground/20" />
                  )}
                  {meta && meta.estimated > 0 && (
                    <span className="text-[10px] leading-none text-muted-foreground">
                      {formatMinutes(meta.estimated)}
                    </span>
                  )}
                </div>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function WeekView({
  weekDays,
  dayMap,
  selectedDate,
  onSelectDate,
}: {
  weekDays: Date[];
  dayMap: Map<string, CalendarDay>;
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}) {
  return (
    <div className="grid grid-cols-7 gap-2">
      {weekDays.map((date) => {
        const key = format(date, "yyyy-MM-dd");
        const day = dayMap.get(key) ?? null;
        const isSel = selectedDate && sameDay(date, selectedDate);
        const isTod = sameDay(date, today());
        const meta = day ? dayMeta(day) : null;
        return (
          <button
            key={key}
            type="button"
            onClick={() => onSelectDate(date)}
            className={cn(
              "flex min-h-24 flex-col gap-1 rounded-lg border border-border/60 p-2.5 text-left transition-colors hover:bg-muted/50",
              isSel && "bg-primary/10 ring-1 ring-primary/40",
              isTod && !isSel && "border-border bg-primary/20",
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <span className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground">
                {format(date, "EEE")}
              </span>
              <span
                className={cn(
                  "flex size-5 items-center justify-center rounded-full text-xs",
                  isTod && "bg-primary text-primary-foreground font-medium",
                  isSel && !isTod && "bg-primary text-primary-foreground font-medium",
                )}
              >
                {format(date, "d")}
              </span>
            </div>
            {day ? (
              <>
                <div className="flex items-center gap-1">
                  {day.tasks.length > 0 && (
                    <span className="text-[11px] text-muted-foreground">{day.tasks.length} tasks</span>
                  )}
                </div>
                <p className="line-clamp-2 text-[11px] leading-tight text-muted-foreground">{day.title}</p>
                {meta && day.tasks.length > 0 && (
                  <div className="mt-auto flex items-center gap-1.5">
                    <Progress value={day.completionPercentage} className="h-1 flex-1" />
                    <span className="text-[10px] text-muted-foreground">{meta.done}/{meta.total}</span>
                  </div>
                )}
              </>
            ) : (
              <p className="text-[11px] text-muted-foreground/50">No tasks</p>
            )}
          </button>
        );
      })}
    </div>
  );
}

function DayViewPanel({
  day,
  summary,
}: {
  day: CalendarDay | null;
  summary: { total: number; done: number; estimated: number };
}) {
  if (!day) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border/60 bg-card">
        <p className="text-sm text-muted-foreground">Select a date to view details.</p>
      </div>
    );
  }
  return (
    <div className="rounded-lg border border-border/60 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-2xl font-semibold">{format(day.date, "dd MMM")}</p>
          <p className="mt-1 text-sm text-muted-foreground">
            {day.title} &middot; {day.subjectName ?? "Mixed syllabus"}
          </p>
        </div>
        <Badge variant="outline">{day.phase === "STUDYING" ? "Studying" : "Revision"}</Badge>
      </div>
      <Progress value={day.completionPercentage} className="mt-4" />
      <div className="mt-3 grid grid-cols-3 gap-2">
        <MiniStatBox label="Tasks" value={`${summary.done}/${summary.total}`} />
        <MiniStatBox label="Time" value={formatMinutes(summary.estimated)} />
        <MiniStatBox label="Day" value={`#${day.dayNumber}`} />
      </div>
    </div>
  );
}

function AgendaView({
  days,
  selectedDate,
  onSelectDate,
}: {
  days: CalendarDay[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}) {
  if (!days.length) {
    return (
      <div className="flex h-40 items-center justify-center rounded-lg border border-border/60 bg-card">
        <p className="text-sm text-muted-foreground">No upcoming days.</p>
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-1.5">
      {days.map((day) => {
        const isSel = selectedDate && sameDay(day.date, selectedDate);
        const meta = dayMeta(day);
        return (
          <button
            key={day.id}
            type="button"
            onClick={() => onSelectDate(day.date)}
            className={cn(
              "flex items-center justify-between gap-3 rounded-lg border border-border/60 px-3 py-2.5 text-left transition-colors hover:bg-muted/50",
              isSel && "bg-primary/10 ring-1 ring-primary/40",
            )}
          >
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{day.title}</p>
              <p className="truncate text-xs text-muted-foreground">
                {format(day.date, "dd MMM")} &middot; {day.subjectName ?? "Mixed"}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="text-xs text-muted-foreground">
                {meta.done}/{meta.total}
              </span>
              <Badge variant="outline" className="text-xs">
                {Math.round(day.completionPercentage)}%
              </Badge>
            </div>
          </button>
        );
      })}
    </div>
  );
}

function SelectedDayCard({
  day,
  summary,
  onToggleTask,
}: {
  day: CalendarDay | null;
  summary: { total: number; done: number; estimated: number };
  onToggleTask: (taskId: string, dayId: string) => void;
}) {
  if (!day) {
    return (
      <Card className="border-border/70 shadow-none">
        <CardContent className="flex h-32 items-center justify-center p-4">
          <p className="text-sm text-muted-foreground">Select a day from the calendar.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-border/70 shadow-none">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-base">{format(day.date, "dd MMM")}</CardTitle>
        <CardDescription className="truncate">
          {day.title} &middot; {day.subjectName ?? "Mixed syllabus"}
        </CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-3">
        <div className="flex items-center justify-between gap-2">
          <Badge variant="outline" className="text-xs">
            {day.phase === "STUDYING" ? "Studying" : "Revision"}
          </Badge>
          <span className="text-xs text-muted-foreground">
            {Math.round(day.completionPercentage)}% complete
          </span>
        </div>

        <Progress value={day.completionPercentage} className="h-2" />

        <div className="grid grid-cols-3 gap-2">
          <MiniStatBox label="Tasks" value={`${summary.done}/${summary.total}`} />
          <MiniStatBox label="Time" value={formatMinutes(summary.estimated)} />
          <MiniStatBox label="Day" value={`#${day.dayNumber}`} />
        </div>

        <div className="flex flex-col gap-1.5">
          <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
            Tasks
          </p>
          {day.tasks.length ? (
            <ul className="flex max-h-[240px] flex-col gap-1 overflow-y-auto pr-1">
              {day.tasks.map((task) => {
                const done = task.status === "COMPLETED" || task.status === "FAST_PACED";
                return (
                  <li
                    key={task.id}
                    className="flex items-start gap-2.5 rounded-lg border border-border/60 px-3 py-2"
                  >
                    <Checkbox
                      checked={done}
                      onCheckedChange={() => onToggleTask(task.id, day.id)}
                      className="mt-0.5"
                    />
                    <div className={cn("min-w-0 flex-1", done && "opacity-50")}>
                      <p className={cn("text-sm font-medium", done && "line-through")}>
                        {task.title}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {[task.topicName, task.subtopicName].filter(Boolean).join(" \u2022 ") ||
                          task.taskType.replaceAll("_", " ")}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      {task.estimatedMinutes}m
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="py-2 text-center text-xs text-muted-foreground/60">
              No tasks scheduled for this day.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

function UpcomingCard({
  days,
  selectedDate,
  onSelectDate,
}: {
  days: CalendarDay[];
  selectedDate: Date | undefined;
  onSelectDate: (date: Date) => void;
}) {
  if (!days.length) return null;

  return (
      <Card className="border-border/70 shadow-none">
      <CardHeader className="gap-1 pb-2">
        <CardTitle className="text-sm">Upcoming</CardTitle>
        <CardDescription>Next {days.length} roadmap days.</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-1.5">
        {days.map((day) => {
          const isSel = selectedDate && sameDay(day.date, selectedDate);
          const meta = dayMeta(day);
          return (
            <button
              key={day.id}
              type="button"
              onClick={() => onSelectDate(day.date)}
              className={cn(
              "flex items-center justify-between gap-2 rounded-lg border border-transparent px-3 py-2 text-left transition-colors hover:border-border hover:bg-muted/50",
                isSel && "border-primary bg-primary/10",
              )}
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{day.title}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {format(day.date, "dd MMM")} &middot; {day.subjectName ?? "Mixed"}
                </p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                <span className="text-xs text-muted-foreground">{meta.done}/{meta.total}</span>
                <Badge variant="outline" className="text-[10px]">
                  {Math.round(day.completionPercentage)}%
                </Badge>
              </div>
            </button>
          );
        })}
      </CardContent>
    </Card>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-3 py-2">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 truncate text-sm font-medium">{value}</p>
    </div>
  );
}

function MiniStatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border/60 bg-background px-2.5 py-2 text-center">
      <p className="text-[11px] text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-sm font-semibold">{value}</p>
    </div>
  );
}

function normalizeDay(day: CalendarDay): CalendarDay {
  return { ...day, date: toStartOfDay(day.date) };
}
