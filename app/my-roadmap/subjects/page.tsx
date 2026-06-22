import { getSubjectProgress } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { Badge } from "@/components/ui/badge";

export default async function SubjectsPage() {
  const user = await requireUser();
  const subjects = await getSubjectProgress(user.id);

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Subjects Progress</h1>
        <p className="text-muted-foreground">Detailed overview of core subject-level preparation parameters.</p>
      </div>

      {subjects.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Core Subjects</CardTitle>
            <CardDescription>Overall completion stats mapped to subjects.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Progress %</TableHead>
                  <TableHead>Completed Topics</TableHead>
                  <TableHead>Total Topics</TableHead>
                  <TableHead>Completed Subtopics</TableHead>
                  <TableHead>Total Subtopics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last Studied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {subjects.map((subject) => (
                  <TableRow key={subject.subjectName}>
                    <TableCell className="font-semibold text-sm">{subject.subjectName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={subject.progressPercentage} className="h-2 w-14" />
                        <Badge variant="outline">{Math.round(subject.progressPercentage)}%</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{subject.completedTopics}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{subject.totalTopics}</TableCell>
                    <TableCell className="text-sm font-medium">{subject.completedSubtopics}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{subject.totalSubtopics}</TableCell>
                    <TableCell>
                      <TaskStatusBadge status={subject.status} />
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {subject.confidenceScore !== null ? (
                        <Badge variant={subject.confidenceScore <= 40 ? "destructive" : "secondary"}>{Math.round(subject.confidenceScore)}%</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {subject.lastStudiedAt ? displayDate(subject.lastStudiedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyPanel title="No subject progress" description="Progress appears after you start tracking the GATE CSE 2027 plan." />
      )}
    </AppShell>
  );
}
