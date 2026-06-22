import { getTopicProgress } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

export default async function TopicsPage() {
  const user = await requireUser();
  const topics = await getTopicProgress(user.id);

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Topic Progress</h1>
        <p className="text-muted-foreground">Track completion at the topic level across subjects.</p>
      </div>

      {topics.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Topics</CardTitle>
            <CardDescription>Topic progress percentages and confidence ratings.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Completed Subtopics</TableHead>
                  <TableHead>Total Subtopics</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Last studied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topics.map((topic) => (
                  <TableRow key={`${topic.subjectName}-${topic.topicName}`}>
                    <TableCell className="text-xs text-muted-foreground">{topic.subjectName}</TableCell>
                    <TableCell className="font-semibold text-sm">{topic.topicName}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={topic.progressPercentage} className="h-1.5 w-12" />
                        <Badge variant="outline">{Math.round(topic.progressPercentage)}%</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-medium">{topic.completedSubtopics}</TableCell>
                    <TableCell className="text-sm text-muted-foreground">{topic.totalSubtopics}</TableCell>
                    <TableCell>
                      <TaskStatusBadge status={topic.status} />
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {topic.confidenceScore !== null ? (
                        <Badge variant={topic.confidenceScore <= 40 ? "destructive" : "secondary"}>{Math.round(topic.confidenceScore)}%</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {topic.lastStudiedAt ? displayDate(topic.lastStudiedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyPanel title="No topic progress" description="Progress appears after you start tracking the GATE CSE 2027 plan." />
      )}
    </AppShell>
  );
}
