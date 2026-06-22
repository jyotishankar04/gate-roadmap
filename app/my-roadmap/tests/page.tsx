import { createTestAttempt, deleteTestAttempt, getTestAttempts } from "@/actions/test.actions";
import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/app-shell";
import { EmptyPanel } from "@/components/roadmap/empty-panel";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { requireUser } from "@/lib/auth";
import { displayDate } from "@/lib/dates";
import { Trash2 } from "lucide-react";

export default async function TestsPage() {
  const user = await requireUser();
  const attempts = await getTestAttempts(user.id);
  
  return (
    <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Mock Test Logs</h1>
        <p className="text-muted-foreground">Log your score cards, mistake topics, and time tracking stats for mock test reviews.</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[0.8fr_1.2fr]">
        <Card className="h-fit">
          <CardHeader>
            <CardTitle>Log Test Attempt</CardTitle>
            <CardDescription>Enter your score details and weak areas identified.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createTestAttempt}>
              <FieldGroup className="grid gap-4">
                <TestField label="Test Name">
                  <Input name="title" placeholder="e.g. MadeEasy Subject Test 1" required />
                </TestField>
                <TestField label="Type">
                  <Select name="testType" defaultValue="SUBJECT_TEST">
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="SUBJECT_TEST">Subject Test</SelectItem>
                        <SelectItem value="TOPIC_TEST">Topic Test</SelectItem>
                        <SelectItem value="PYQ_TEST">PYQ Test</SelectItem>
                        <SelectItem value="FULL_MOCK">Full Mock</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </TestField>
                <TestField label="Subject / Syllabus focus">
                  <Input name="subjectName" placeholder="e.g. Data Structures" />
                </TestField>
                <div className="grid grid-cols-2 gap-3">
                  <TestField label="Obtained Marks">
                    <Input name="score" type="number" step="0.01" placeholder="e.g. 23.5" required />
                  </TestField>
                  <TestField label="Total Marks">
                    <Input name="totalMarks" type="number" step="0.01" placeholder="e.g. 33" required />
                  </TestField>
                </div>
                <TestField label="Time Taken (Minutes)">
                  <Input name="timeTakenMinutes" type="number" placeholder="e.g. 45" required />
                </TestField>
                <TestField label="Mistakes list (one per line)">
                  <Textarea name="mistakes" placeholder="Tricky pointers, recursion memory limit exceeded..." />
                </TestField>
                <TestField label="Weak topics (one per line)">
                  <Textarea name="weakTopics" placeholder="AVL tree rotations, time complexity bounds..." />
                </TestField>
                <Button type="submit" className="w-full mt-2">Save Test Attempt</Button>
              </FieldGroup>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Attempt History</CardTitle>
            <CardDescription>Logged feedback scores, accuracy rates, and logged mistakes list.</CardDescription>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            {attempts.length ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Test Name</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Subject</TableHead>
                    <TableHead>Marks</TableHead>
                    <TableHead>Accuracy</TableHead>
                    <TableHead>Time (min)</TableHead>
                    <TableHead>Weak Topics / Mistakes</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead className="w-10" />
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {attempts.map((attempt) => (
                    <TableRow key={attempt.id}>
                      <TableCell className="font-semibold text-sm">{attempt.title}</TableCell>
                      <TableCell className="text-xs">{attempt.testType.replaceAll("_", " ")}</TableCell>
                      <TableCell className="text-xs text-muted-foreground">{attempt.subjectName ?? "—"}</TableCell>
                      <TableCell className="text-sm font-semibold">{attempt.score} / {attempt.totalMarks}</TableCell>
                      <TableCell className="text-sm">
                        {attempt.accuracy !== null ? <Badge variant={attempt.accuracy < 50 ? "destructive" : "secondary"}>{attempt.accuracy}%</Badge> : "—"}
                      </TableCell>
                      <TableCell className="text-xs">{attempt.timeTakenMinutes ?? "—"}</TableCell>
                      <TableCell className="max-w-[200px] text-xs text-muted-foreground">
                        {Array.isArray(attempt.weakTopics) && attempt.weakTopics.length > 0 && (
                          <p className="truncate"><strong>Weak:</strong> {attempt.weakTopics.join(", ")}</p>
                        )}
                        {Array.isArray(attempt.mistakes) && attempt.mistakes.length > 0 && (
                          <p className="truncate mt-0.5"><strong>Mistakes:</strong> {attempt.mistakes.join(", ")}</p>
                        )}
                      </TableCell>
                      <TableCell className="text-xs text-muted-foreground">{displayDate(attempt.attemptedAt, "dd MMM yyyy")}</TableCell>
                      <TableCell>
                        <form action={deleteTestAttempt}>
                          <input type="hidden" name="id" value={attempt.id} />
                          <Button variant="ghost" size="icon" type="submit">
                            <Trash2 data-icon="inline-start" />
                          </Button>
                        </form>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyPanel title="No test attempts logged yet" description="Use the form to add your first mock or subject test result." />
            )}
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}

function TestField({ label, children }: { label: string; children: ReactNode }) {
  return <Field><FieldLabel>{label}</FieldLabel>{children}</Field>;
}
