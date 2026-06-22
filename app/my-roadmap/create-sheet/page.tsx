import Link from "next/link";
import { detectGateExamDate, getActiveRoadmap } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { CreateSheetWizard } from "@/components/roadmap/create-sheet-wizard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";

export default async function CreateSheetPage() {
  const user = await requireUser();
  const roadmap = await getActiveRoadmap(user.id);
  const examDate = await detectGateExamDate();

  return (
    <AppShell username={user.username}>
      <div className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-bold text-balance">Create Sheet</h1>
          <p className="text-muted-foreground">
            Build a dynamic GATE CSE roadmap from your available days, strengths, weaknesses, and study pace.
          </p>
        </div>

        {roadmap ? (
          <Card className="border-primary/20 bg-primary/5">
            <CardHeader>
              <CardTitle>Active roadmap already exists</CardTitle>
              <CardDescription>
                {roadmap.title} runs from {displayDate(roadmap.startDate)} to {displayDate(roadmap.endDate)}.
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Button render={<Link href="/my-roadmap/sheet" />} variant="outline">
                View Sheet
              </Button>
              <Button render={<Link href="/my-roadmap/today" />}>Go to Today</Button>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle>Sheet Creation Wizard</CardTitle>
              <CardDescription>
                Expected date source: {examDate.source}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <CreateSheetWizard userId={user.id} initialExamDate={examDate.examDate} initialSource={examDate.source} />
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
