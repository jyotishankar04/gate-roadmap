"use client";

import { Fragment, useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { ChevronDown, ChevronRight, Search, Edit2, Timer } from "lucide-react";
import { updateSubtopicProgress, updateSubtopicStatus } from "@/actions/task.actions";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Textarea } from "@/components/ui/textarea";
import { displayDate } from "@/lib/dates";

type SheetItem = {
  subjectName: string;
  topicName: string;
  subtopicName: string;
  plannedDate: Date | null;
  status: string;
  progressPercentage: number;
  confidenceScore: number | null;
  notes: string | null;
  estimatedMinutes: number;
  actualMinutes: number | null;
};

export function SheetTracker({ items }: { items: SheetItem[] }) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [subjectFilter, setSubjectFilter] = useState("all");
  const [expandedSubjects, setExpandedSubjects] = useState<Set<string>>(new Set());
  const [expandedTopics, setExpandedTopics] = useState<Set<string>>(new Set());
  const [editingItem, setEditingItem] = useState<SheetItem | null>(null);

  // Group by Subject and Topic
  const subjects = useMemo(() => {
    const map = new Map<string, Map<string, SheetItem[]>>();
    for (const item of items) {
      if (!map.has(item.subjectName)) map.set(item.subjectName, new Map());
      const topicMap = map.get(item.subjectName)!;
      if (!topicMap.has(item.topicName)) topicMap.set(item.topicName, []);
      topicMap.get(item.topicName)!.push(item);
    }
    return map;
  }, [items]);

  // Calculations for progress bars
  const subjectProgressMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>();
    for (const item of items) {
      const entry = map.get(item.subjectName) ?? { completed: 0, total: 0 };
      entry.total += 1;
      if (item.status === "COMPLETED" || item.status === "FAST_PACED") {
        entry.completed += 1;
      }
      map.set(item.subjectName, entry);
    }
    return map;
  }, [items]);

  const topicProgressMap = useMemo(() => {
    const map = new Map<string, { completed: number; total: number }>();
    for (const item of items) {
      const key = `${item.subjectName}::${item.topicName}`;
      const entry = map.get(key) ?? { completed: 0, total: 0 };
      entry.total += 1;
      if (item.status === "COMPLETED" || item.status === "FAST_PACED") {
        entry.completed += 1;
      }
      map.set(key, entry);
    }
    return map;
  }, [items]);

  const filteredSubjects = useMemo(() => {
    const result = new Map<string, Map<string, SheetItem[]>>();
    for (const [subjectName, topicMap] of subjects) {
      if (subjectFilter !== "all" && subjectName !== subjectFilter) continue;
      const filteredTopicMap = new Map<string, SheetItem[]>();
      for (const [topicName, subtopics] of topicMap) {
        const filtered = subtopics.filter((st) => {
          const matchSearch =
            !search ||
            st.subtopicName.toLowerCase().includes(search) ||
            st.topicName.toLowerCase().includes(search);
          const matchStatus = statusFilter === "all" || st.status === statusFilter;
          return matchSearch && matchStatus;
        });
        if (filtered.length) filteredTopicMap.set(topicName, filtered);
      }
      if (filteredTopicMap.size) result.set(subjectName, filteredTopicMap);
    }
    return result;
  }, [subjects, search, statusFilter, subjectFilter]);

  const uniqueSubjects = useMemo(() => [...subjects.keys()], [subjects]);
  const isCompleted = (status: string) => status === "COMPLETED" || status === "FAST_PACED";

  const toggleSubject = useCallback((name: string) => {
    setExpandedSubjects((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });
  }, []);

  const toggleTopic = useCallback((key: string) => {
    setExpandedTopics((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  }, []);

  const toggleSubtopicStatus = useCallback((item: SheetItem, checked: boolean) => {
    const formData = new FormData();
    formData.set("subjectName", item.subjectName);
    formData.set("topicName", item.topicName);
    formData.set("subtopicName", item.subtopicName);
    formData.set("status", checked ? "COMPLETED" : "NOT_STARTED");
    void updateSubtopicStatus(formData);
  }, []);

  function expandAll() {
    setExpandedSubjects(new Set(filteredSubjects.keys()));
    const allTopics = new Set<string>();
    for (const [subjectName, topicMap] of filteredSubjects) {
      for (const topicName of topicMap.keys()) {
        allTopics.add(`${subjectName}::${topicName}`);
      }
    }
    setExpandedTopics(allTopics);
  }

  function collapseAll() {
    setExpandedSubjects(new Set());
    setExpandedTopics(new Set());
  }

  return (
    <div className="flex flex-col gap-4">
      <Card>
        <CardHeader>
          <CardTitle>Filters & Bulk Controls</CardTitle>
          <CardDescription>Filter the syllabus or perform bulk operations on selected subtopics.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search subtopics..."
                value={search}
                onChange={(e) => setSearch(e.target.value.toLowerCase())}
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={(v) => v && setStatusFilter(v)}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                  <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                  <SelectItem value="COMPLETED">Completed</SelectItem>
                  <SelectItem value="BEHIND">Behind</SelectItem>
                  <SelectItem value="FAST_PACED">Fast Paced</SelectItem>
                  <SelectItem value="PUT_TO_REVISE">Put To Revise</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
            <Select value={subjectFilter} onValueChange={(v) => v && setSubjectFilter(v)}>
              <SelectTrigger className="w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="all">All subjects</SelectItem>
                  {uniqueSubjects.map((s) => (
                    <SelectItem key={s} value={s}>
                      {s}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" onClick={expandAll}>
              Expand all
            </Button>
            <Button variant="outline" size="sm" onClick={collapseAll}>
              Collapse all
            </Button>
            
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="overflow-x-auto p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-8" />
                <TableHead className="w-8" />
                <TableHead className="w-[120px]">Status</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Topic</TableHead>
                <TableHead>Subtopic</TableHead>
                <TableHead>Planned Date</TableHead>
                <TableHead className="w-[120px]">Progress</TableHead>
                <TableHead>Confidence</TableHead>
                <TableHead>Est / Act Time</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="w-12" />
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...filteredSubjects.entries()].map(([subjectName, topicMap]) => {
                const subStats = subjectProgressMap.get(subjectName) || { completed: 0, total: 1 };
                const subPercentage = Math.round((subStats.completed / subStats.total) * 100);

                return (
                  <Fragment key={subjectName}>
                    {/* Subject Row */}
                    <TableRow
                      className="cursor-pointer bg-muted/60 hover:bg-muted/80"
                      onClick={() => toggleSubject(subjectName)}
                    >
                      <TableCell>
                        {expandedSubjects.has(subjectName) ? (
                          <ChevronDown className="size-4" />
                        ) : (
                          <ChevronRight className="size-4" />
                        )}
                      </TableCell>
                      <TableCell />
                      <TableCell colSpan={5}>
                        <span className="font-bold text-sm md:text-base">{subjectName}</span>
                        <span className="ml-2 text-xs text-muted-foreground">
                          ({[...topicMap.values()].reduce((sum, st) => sum + st.length, 0)} subtopics)
                        </span>
                      </TableCell>
                      <TableCell colSpan={5}>
                        <div className="flex items-center gap-2">
                          <Progress value={subPercentage} className="h-2 w-24" />
                          <Badge variant="outline">{subPercentage}%</Badge>
                        </div>
                      </TableCell>
                    </TableRow>

                    {expandedSubjects.has(subjectName) &&
                      [...topicMap.entries()].map(([topicName, subtopics]) => {
                        const topKey = `${subjectName}::${topicName}`;
                        const topStats = topicProgressMap.get(topKey) || { completed: 0, total: 1 };
                        const topPercentage = Math.round((topStats.completed / topStats.total) * 100);

                        return (
                          <Fragment key={`topic-${subjectName}::${topicName}`}>
                            {/* Topic Row */}
                            <TableRow
                              className="cursor-pointer bg-muted/20 hover:bg-muted/30"
                              onClick={() => toggleTopic(topKey)}
                            >
                              <TableCell />
                              <TableCell>
                                {expandedTopics.has(topKey) ? (
                                  <ChevronDown className="size-4" />
                                ) : (
                                  <ChevronRight className="size-4" />
                                )}
                              </TableCell>
                              <TableCell colSpan={5}>
                                <span className="font-semibold text-sm pl-4">{topicName}</span>
                                <span className="ml-2 text-xs text-muted-foreground">({subtopics.length} subtopics)</span>
                              </TableCell>
                              <TableCell colSpan={5}>
                                <div className="flex items-center gap-2">
                                  <Progress value={topPercentage} className="h-1.5 w-16" />
                                  <Badge variant="outline">{topPercentage}%</Badge>
                                </div>
                              </TableCell>
                            </TableRow>

                            {/* Subtopic Rows */}
                            {expandedTopics.has(topKey) &&
                              subtopics.map((st) => {
                                const subtopicKey = `${st.subjectName}::${st.topicName}::${st.subtopicName}`;
                                
                                return (
                                    <TableRow key={subtopicKey} className="hover:bg-muted/10">
                                    <TableCell />
                                    <TableCell>
                                      <Checkbox
                                        checked={isCompleted(st.status)}
                                        onCheckedChange={(checked) => toggleSubtopicStatus(st, checked === true)}
                                      />
                                    </TableCell>
                                    <TableCell>
                                      <TaskStatusBadge status={st.status} />
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">{st.subjectName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground max-w-[120px] truncate">{st.topicName}</TableCell>
                                    <TableCell className="text-sm font-semibold">{st.subtopicName}</TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                      {st.plannedDate ? displayDate(st.plannedDate, "dd MMM yyyy") : "—"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-2">
                                        <Progress value={st.progressPercentage} className="h-2 w-14" />
                                        <Badge variant="outline">{Math.round(st.progressPercentage)}%</Badge>
                                      </div>
                                    </TableCell>
                                    <TableCell className="text-sm font-medium">
                                      {st.confidenceScore !== null ? (
                                        <Badge variant={st.confidenceScore <= 40 ? "destructive" : "secondary"}>{Math.round(st.confidenceScore)}%</Badge>
                                      ) : "—"}
                                    </TableCell>
                                    <TableCell className="text-xs text-muted-foreground">
                                      {st.estimatedMinutes}m / {st.actualMinutes !== null ? `${st.actualMinutes}m` : "—"}
                                    </TableCell>
                                    <TableCell className="max-w-[180px] truncate text-xs text-muted-foreground">
                                      {st.notes ?? "—"}
                                    </TableCell>
                                    <TableCell>
                                      <div className="flex items-center gap-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="size-8"
                                          render={<Link href={`/my-roadmap/tools?${new URLSearchParams({
                                            subject: st.subjectName,
                                            topic: st.topicName,
                                            subtopic: st.subtopicName,
                                            title: st.subtopicName,
                                            type: "TIMER",
                                          }).toString()}`} />}
                                        >
                                          <Timer data-icon="inline-start" />
                                        </Button>
                                        <Button variant="ghost" size="icon" className="size-8" onClick={() => setEditingItem(st)}>
                                          <Edit2 data-icon="inline-start" />
                                        </Button>
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                          </Fragment>
                        );
                      })}
                  </Fragment>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Inline Subtopic Dialog Editor */}
      <Dialog open={Boolean(editingItem)} onOpenChange={(open) => !open && setEditingItem(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Subtopic Details</DialogTitle>
            <DialogDescription>
              Update tracking status, confidence level, actual time, and logs for this subtopic.
            </DialogDescription>
          </DialogHeader>
          {editingItem && (
            <form action={updateSubtopicProgress} onSubmit={() => setEditingItem(null)}>
              <input type="hidden" name="subjectName" value={editingItem.subjectName} />
              <input type="hidden" name="topicName" value={editingItem.topicName} />
              <input type="hidden" name="subtopicName" value={editingItem.subtopicName} />

              <FieldGroup className="grid gap-4 py-4">
                <Field>
                  <FieldLabel>Status</FieldLabel>
                  <Select name="status" defaultValue={editingItem.status}>
                    <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                        <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                        <SelectItem value="COMPLETED">Completed</SelectItem>
                        <SelectItem value="BEHIND">Behind</SelectItem>
                        <SelectItem value="FAST_PACED">Fast Paced</SelectItem>
                        <SelectItem value="PUT_TO_REVISE">Put to Revise</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </Field>

                <Field>
                  <FieldLabel>Confidence level (0 - 100%)</FieldLabel>
                  <Input
                    name="confidenceScore"
                    type="number"
                    min={0}
                    max={100}
                    defaultValue={editingItem.confidenceScore ?? ""}
                    placeholder="Enter confidence percentage"
                  />
                </Field>

                <Field>
                  <FieldLabel>Actual study minutes</FieldLabel>
                  <Input
                    name="actualMinutes"
                    type="number"
                    min={0}
                    defaultValue={editingItem.actualMinutes ?? ""}
                    placeholder="Enter total actual minutes studied"
                  />
                </Field>

                <Field>
                  <FieldLabel>Notes / Takeaways</FieldLabel>
                  <Textarea
                    name="notes"
                    placeholder="Doubts, formulas, mistakes list, etc."
                    defaultValue={editingItem.notes ?? ""}
                  />
                </Field>
              </FieldGroup>

              <div className="flex justify-end gap-2 mt-4">
                <Button type="button" variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button type="submit">Save Changes</Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
