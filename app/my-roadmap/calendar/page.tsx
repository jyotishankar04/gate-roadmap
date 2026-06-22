import { getRoadmapCalendar } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { MinimalCalendarView } from "@/components/roadmap/minimal-calendar-view";
import { requireUser } from "@/lib/auth";

export default async function CalendarPage() {
  const user = await requireUser();
  const days = await getRoadmapCalendar(user.id);
  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Roadmap Calendar</h1>
        <p className="text-muted-foreground">Track your daily progress at a glance.</p>
      </div>
      {days.length ? (
        <MinimalCalendarView days={days} />
      ) : (
        <EmptyPanel title="No calendar yet" description="Generate a roadmap first." />
      )}
    </AppShell>
  );
}
