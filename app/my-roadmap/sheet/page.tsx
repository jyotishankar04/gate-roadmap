import { getRoadmapSheet } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { SheetTracker } from "@/components/roadmap/sheet-tracker";
import { requireUser } from "@/lib/auth";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default async function SheetPage() {
  const user = await requireUser();
  const items = await getRoadmapSheet(user.id);

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="retro-title text-3xl sm:text-4xl">Sheet Tracker</h1>
        <p className="text-muted-foreground">
          Expand subjects and topics to track every subtopic. Inspired by Striver A2Z sheet layout.
        </p>
      </div>
      {items.length ? (
        <SheetTracker items={items} />
      ) : (
        <div className="flex flex-col gap-3">
          <EmptyPanel title="No sheet data" description="Create your sheet first to see progress grouped by subject and topic." />
          <Button render={<Link href="/my-roadmap/create-sheet" />} className="w-fit">
            Create Sheet
          </Button>
        </div>
      )}
    </AppShell>
  );
}
