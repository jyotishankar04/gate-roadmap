import { getSubtopicProgress } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

type SearchParams = Promise<{
  q?: string;
  status?: string;
  subject?: string;
}>;

export default async function SubtopicsPage({ searchParams }: { searchParams?: SearchParams }) {
  const user = await requireUser();
  const params = (await searchParams) ?? {};
  const q = params.q?.toLowerCase().trim() ?? "";
  const status = params.status ?? "all";
  const subject = params.subject?.toLowerCase().trim() ?? "";
  const items = await getSubtopicProgress(user.id);

  const filtered = items.filter((item) => {
    const matchesQuery =
      !q ||
      [item.subjectName, item.topicName, item.subtopicName, item.notes ?? ""].some((value) => value.toLowerCase().includes(q));
    const matchesSubject = !subject || item.subjectName.toLowerCase().includes(subject);
    const matchesStatus = status === "all" || item.status === status;
    return matchesQuery && matchesSubject && matchesStatus;
  });

  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Subtopic Progress</h1>
        <p className="text-muted-foreground">Detailed overview of all specific, fine-grained subtopics in the GATE CSE syllabus.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
          <CardDescription>Search and filter subtopics by status, subject name, or keywords.</CardDescription>
        </CardHeader>
        <CardContent>
          <form method="get">
            <FieldGroup className="grid gap-3 md:grid-cols-[1fr_200px_200px_auto]">
              <Field>
                <FieldLabel htmlFor="q" className="sr-only">Search</FieldLabel>
                <Input id="q" name="q" placeholder="Search subtopics, topics or notes..." defaultValue={params.q ?? ""} />
              </Field>
              <Field>
                <FieldLabel htmlFor="subject" className="sr-only">Subject</FieldLabel>
                <Input id="subject" name="subject" placeholder="Subject filter" defaultValue={params.subject ?? ""} />
              </Field>
              <Field>
                <FieldLabel className="sr-only">Status</FieldLabel>
                <Select name="status" defaultValue={status}>
                  <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      <SelectItem value="all">All statuses</SelectItem>
                      <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                      <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                      <SelectItem value="COMPLETED">Completed</SelectItem>
                      <SelectItem value="BEHIND">Behind</SelectItem>
                      <SelectItem value="FAST_PACED">Fast Paced</SelectItem>
                      <SelectItem value="PUT_TO_REVISE">Put to revise</SelectItem>
                    </SelectGroup>
                  </SelectContent>
                </Select>
              </Field>
              <Field>
                <FieldLabel className="sr-only">Apply filters</FieldLabel>
                <Button type="submit">Apply Filters</Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>

      {filtered.length ? (
        <Card>
          <CardHeader>
            <CardTitle>Syllabus Sheet</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Topic</TableHead>
                  <TableHead>Subtopic</TableHead>
                  <TableHead>Planned Date</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Progress</TableHead>
                  <TableHead>Confidence</TableHead>
                  <TableHead>Revision Priority</TableHead>
                  <TableHead>Notes</TableHead>
                  <TableHead>Last studied</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filtered.map((item) => (
                  <TableRow key={`${item.subjectName}-${item.topicName}-${item.subtopicName}`}>
                    <TableCell className="text-xs text-muted-foreground">{item.subjectName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{item.topicName}</TableCell>
                    <TableCell className="text-sm font-semibold">{item.subtopicName}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.plannedDate ? displayDate(item.plannedDate, "dd MMM yyyy") : "—"}
                    </TableCell>
                    <TableCell>
                      <TaskStatusBadge status={item.status} />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Progress value={item.progressPercentage} className="h-1.5 w-12" />
                        <Badge variant="outline">{Math.round(item.progressPercentage)}%</Badge>
                      </div>
                    </TableCell>
                    <TableCell className="text-sm font-semibold">
                      {item.confidenceScore !== null ? (
                        <Badge variant={item.confidenceScore <= 40 ? "destructive" : "secondary"}>{Math.round(item.confidenceScore)}%</Badge>
                      ) : "—"}
                    </TableCell>
                    <TableCell className="text-xs font-semibold text-center">{item.revisionPriority}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-[150px] truncate">{item.notes ?? "—"}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {item.lastStudiedAt ? displayDate(item.lastStudiedAt) : "—"}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <EmptyPanel title="No subtopics found" description="Adjust your filters or make sure you have started tracking a roadmap." />
      )}
    </AppShell>
  );
}
