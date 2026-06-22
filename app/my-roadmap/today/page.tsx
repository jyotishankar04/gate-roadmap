import { getTodayTasks } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { TodayTaskList } from "@/components/roadmap/today-task-list";
import { requireUser } from "@/lib/auth";
import { toStartOfDay } from "@/lib/dates";

type SearchParams = Promise<{
  date?: string;
  task?: string;
}>;

function parseDateParam(value?: string) {
  if (!value) return undefined;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? undefined : toStartOfDay(parsed);
}

export default async function TodayPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const focusDate = parseDateParam(params.date);
  const day = await getTodayTasks(user.id, focusDate);

  return (
    <AppShell username={user.username}>
      <TodayTaskList day={day} focusTaskId={params.task} />
    </AppShell>
  );
}
