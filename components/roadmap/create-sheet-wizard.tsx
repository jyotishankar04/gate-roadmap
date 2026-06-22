"use client";

import { useMemo, useState } from "react";
import { createUserSheetFromPreview } from "@/actions/roadmap.actions";
import {
  calculateSheetPlan,
  gateSubjectChoices,
  normalizeGateSubjectName,
  recalculatePreviewAfterSubjectEdit,
  type ParallelSubjects,
  type PrepAggression,
  type SheetPlanPreview,
} from "@/lib/roadmap/sheet-calculator";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldLegend,
  FieldSet,
  FieldSeparator,
  FieldTitle,
} from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";

type Props = {
  userId: string;
  initialExamDate: string;
  initialSource: string;
};

const subjectOptions = gateSubjectChoices;

function toDateInput(value: string) {
  return value.slice(0, 10);
}

function toCanonical(name: string) {
  return normalizeGateSubjectName(name);
}

function toDateObject(value: string) {
  return new Date(`${value}T00:00:00`);
}

export function CreateSheetWizard({ userId, initialExamDate, initialSource }: Props) {
  const [step, setStep] = useState(1);
  const [examDate, setExamDate] = useState(toDateInput(initialExamDate));
  const [dailyStudyHours, setDailyStudyHours] = useState(4);
  const [weekendStudyHours, setWeekendStudyHours] = useState(6);
  const [aggression, setAggression] = useState<PrepAggression>("BALANCED");
  const [parallelSubjects, setParallelSubjects] = useState<ParallelSubjects>(1);
  const [strongSubjects, setStrongSubjects] = useState<string[]>([]);
  const [weakSubjects, setWeakSubjects] = useState<string[]>([]);
  const [previewState, setPreviewState] = useState<SheetPlanPreview | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const resolvedExamDate = examDate || toDateInput(initialExamDate);

  const generatedPlan = useMemo(() => {
    return calculateSheetPlan({
      userId,
      today: new Date(),
      examDate: toDateObject(resolvedExamDate),
      dailyStudyHours,
      weekendStudyHours,
      strongSubjects,
      weakSubjects,
      aggression,
      parallelSubjects,
    });
  }, [aggression, dailyStudyHours, parallelSubjects, resolvedExamDate, strongSubjects, userId, weekendStudyHours, weakSubjects]);

  const preview = previewState ?? generatedPlan;
  const canCreate = preview.isValid;

  function resetAllocationState() {
    setPreviewState(null);
    setPreviewError(null);
  }

  function useGeneratedDays() {
    resetAllocationState();
  }

  function updateEditedDays(subjectName: string, value: number) {
    const nextPreview = recalculatePreviewAfterSubjectEdit(preview, subjectName, Math.max(1, Math.floor(value)));
    if (!nextPreview.isValid) {
      setPreviewError(
        "Revision phase cannot go below the minimum required days. Reduce another subject or keep this value lower.",
      );
      return;
    }

    setPreviewError(null);
    setPreviewState(nextPreview);
  }

  function toggleStrongSubject(value: string) {
    const canonical = toCanonical(value);
    if (weakSubjects.includes(canonical)) return;
    setStrongSubjects((prev) => (prev.includes(canonical) ? prev.filter((item) => item !== canonical) : [...prev, canonical]));
    resetAllocationState();
  }

  function toggleWeakSubject(value: string) {
    const canonical = toCanonical(value);
    if (strongSubjects.includes(canonical)) return;
    setWeakSubjects((prev) => (prev.includes(canonical) ? prev.filter((item) => item !== canonical) : [...prev, canonical]));
    resetAllocationState();
  }

  return (
    <div className="flex flex-col gap-6">
      <Card>
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <Badge>Step {step} of 5</Badge>
            <Badge variant="outline">Dynamic sheet</Badge>
          </div>
          <CardTitle className="text-2xl">Create your sheet</CardTitle>
          <CardDescription>
            Expected GATE 2027 exam date:{" "}
            {format(toDateObject(resolvedExamDate), "d MMMM yyyy")}
            . {initialSource}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {step === 1 && (
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Exam date</FieldLegend>
                <FieldDescription>Pick the expected GATE 2027 date and the planner will calculate the remaining days.</FieldDescription>
                <div className="grid gap-4 md:grid-cols-2">
                  <Field>
                    <FieldLabel>Exam date</FieldLabel>
                    <FieldContent>
                      <Popover>
                        <PopoverTrigger render={<Button variant="outline" className="justify-start font-normal" />}>
                          <CalendarDays data-icon="inline-start" />
                          {format(toDateObject(resolvedExamDate), "d MMMM yyyy")}
                        </PopoverTrigger>
                        <PopoverContent className="p-0">
                          <Calendar
                            mode="single"
                            selected={toDateObject(resolvedExamDate)}
                            onSelect={(date) => {
                              if (!date) return;
                              setExamDate(format(date, "yyyy-MM-dd"));
                              resetAllocationState();
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </FieldContent>
                  </Field>
                  <Field>
                    <FieldLabel>Days remaining</FieldLabel>
                    <FieldContent>
                      <Input readOnly value={`${preview.totalDaysRemaining} days`} />
                    </FieldContent>
                  </Field>
                </div>
              </FieldSet>
            </FieldGroup>
          )}

          {step === 2 && (
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Subject strength</FieldLegend>
                <FieldDescription>Pick the subjects you already handle well and the ones that need more time.</FieldDescription>
                <div className="grid gap-4 xl:grid-cols-2">
                  <SubjectPicker
                    title="Strong subjects"
                    description="These should get fewer concept days but still keep PYQ and revision coverage."
                    values={strongSubjects}
                    onToggle={toggleStrongSubject}
                    tone="secondary"
                  />
                  <SubjectPicker
                    title="Weak subjects"
                    description="These get more concept days and earlier attention in the schedule."
                    values={weakSubjects}
                    onToggle={toggleWeakSubject}
                    tone="destructive"
                  />
                </div>
              </FieldSet>
            </FieldGroup>
          )}

          {step === 3 && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="flex flex-col gap-2">
                <Label htmlFor="dailyHours">Daily study hours</Label>
                <Input
                  id="dailyHours"
                  type="number"
                  min={1}
                  max={16}
                  value={dailyStudyHours}
                  onChange={(e) => {
                    const nextHours = Number(e.target.value) || 4;
                    setDailyStudyHours(nextHours);
                    if (nextHours < 5) setParallelSubjects(1);
                    resetAllocationState();
                  }}
                />
              </div>
              <div className="flex flex-col gap-2">
                <Label htmlFor="weekendHours">Weekend study hours</Label>
                <Input
                  id="weekendHours"
                  type="number"
                  min={1}
                  max={20}
                  value={weekendStudyHours}
                  onChange={(e) => {
                    setWeekendStudyHours(Number(e.target.value) || dailyStudyHours + 2);
                    resetAllocationState();
                  }}
                />
              </div>
            </div>
          )}

          {step === 4 && (
            <FieldGroup>
              <FieldSet>
                <FieldLegend>Preparation pace</FieldLegend>
                <FieldDescription>Choose how tightly the schedule should be compressed.</FieldDescription>
                <RadioGroup
                  value={aggression}
                  onValueChange={(value) => {
                    setAggression(value as PrepAggression);
                    resetAllocationState();
                  }}
                  className="grid gap-3 md:grid-cols-3"
                >
                  <Field>
                    <FieldLabel>
                      <RadioGroupItem value="LOOSE" />
                      <FieldContent>
                        <FieldTitle>Loose</FieldTitle>
                        <FieldDescription>More buffer days and fewer tasks per day.</FieldDescription>
                      </FieldContent>
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <RadioGroupItem value="BALANCED" />
                      <FieldContent>
                        <FieldTitle>Balanced</FieldTitle>
                        <FieldDescription>Recommended mix of concepts, practice, and revision.</FieldDescription>
                      </FieldContent>
                    </FieldLabel>
                  </Field>
                  <Field>
                    <FieldLabel>
                      <RadioGroupItem value="AGGRESSIVE" />
                      <FieldContent>
                        <FieldTitle>Aggressive</FieldTitle>
                        <FieldDescription>Faster pace with more PYQs and mixed revision.</FieldDescription>
                      </FieldContent>
                    </FieldLabel>
                  </Field>
                </RadioGroup>
              </FieldSet>
              <FieldSeparator />
              <FieldSet>
                <FieldLegend>Parallel subjects</FieldLegend>
                <FieldDescription>Use multiple subjects only if your daily hours can support it.</FieldDescription>
                {dailyStudyHours >= 5 ? (
                  <Select
                    value={String(parallelSubjects)}
                    onValueChange={(value) => {
                      setParallelSubjects(Number(value) as ParallelSubjects);
                      resetAllocationState();
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="1">1 subject at a time</SelectItem>
                        <SelectItem value="2">2 subjects at a time</SelectItem>
                        {dailyStudyHours >= 7 ? <SelectItem value="3">3 subjects at a time</SelectItem> : null}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                ) : (
                  <Card className="border-dashed">
                    <CardContent className="py-4 text-sm text-muted-foreground">
                      Parallel study unlocks when you can study at least 5 hours daily.
                    </CardContent>
                  </Card>
                )}
              </FieldSet>
            </FieldGroup>
          )}

          {step === 5 && (
            <div className="flex flex-col gap-4">
              <div className="grid gap-3 md:grid-cols-4">
                <SummaryStat label="Total days remaining" value={preview.totalDaysRemaining} />
                <SummaryStat label="Original studying days" value={preview.originalStudyingDays} />
                <SummaryStat label="Original revision days" value={preview.originalRevisionDays} />
                <SummaryStat label="Moved to revision" value={preview.movedToRevisionDays} />
              </div>

              <Separator />
              <Card className="bg-destructive/5">
                <CardContent className="flex flex-col gap-1 py-4">
                  <p className="text-sm text-muted-foreground">Edited studying days</p>
                  <p className="text-xl font-bold">{preview.editedStudyingDays}</p>
                  <p className="text-sm text-muted-foreground">Revision days after adjustment: {preview.adjustedRevisionDays}</p>
                  <p className="text-sm text-muted-foreground">
                    {preview.movedToRevisionDays > 0
                      ? `${preview.movedToRevisionDays} days moved from studying to revision.`
                      : preview.takenFromRevisionDays > 0
                        ? `${preview.takenFromRevisionDays} days moved from revision into studying.`
                        : "No day movement applied."}
                  </p>
                </CardContent>
              </Card>

              {previewError ? (
                <Card className="border-destructive/30 bg-destructive/5">
                  <CardContent className="py-4 text-sm text-destructive">{previewError}</CardContent>
                </Card>
              ) : null}

              <div className="overflow-x-auto rounded-lg border border-border bg-background">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Subject</TableHead>
                      <TableHead>Order</TableHead>
                      <TableHead>Generated days</TableHead>
                      <TableHead>Edited days</TableHead>
                      <TableHead>Tag</TableHead>
                      <TableHead>Reason</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.subjectAllocations.map((allocation) => (
                      <TableRow key={allocation.subjectName}>
                        <TableCell className="font-medium">{allocation.subjectName}</TableCell>
                        <TableCell>{allocation.order}</TableCell>
                        <TableCell>{allocation.generatedDays}</TableCell>
                        <TableCell>
                          <Input
                            type="number"
                            min={1}
                            value={allocation.editedDays}
                            onChange={(e) => updateEditedDays(allocation.subjectName, Number(e.target.value) || 1)}
                            className="w-24"
                          />
                        </TableCell>
                        <TableCell>
                          <div className="flex flex-wrap gap-2">
                            {allocation.isStrong ? <Badge variant="secondary">Strong</Badge> : null}
                            {allocation.isWeak ? <Badge variant="destructive">Weak</Badge> : null}
                            {!allocation.isStrong && !allocation.isWeak ? <Badge variant="outline">Normal</Badge> : null}
                          </div>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{allocation.reason}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="text-sm text-muted-foreground">
                  {preview.isValid ? "Sheet allocation is balanced." : "Please fix the preview before creating the sheet."}
                </div>
                <div className="flex flex-wrap gap-2">
                  <Button variant="outline" type="button" onClick={useGeneratedDays}>
                    Use Generated Days
                  </Button>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex gap-2">
          <Button variant="outline" type="button" onClick={() => setStep((value) => Math.max(1, value - 1))} disabled={step === 1}>
            Back
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={() => setStep((value) => Math.min(5, value + 1))}>
              Next
            </Button>
          ) : null}
        </div>

        {step === 5 ? (
          <form action={createUserSheetFromPreview}>
            <input type="hidden" name="userId" value={userId} />
            <input type="hidden" name="examDate" value={resolvedExamDate} />
            <input type="hidden" name="previewJson" value={JSON.stringify(preview)} />
            <input type="hidden" name="dailyStudyHours" value={dailyStudyHours} />
            <input type="hidden" name="weekendStudyHours" value={weekendStudyHours} />
            <input type="hidden" name="aggression" value={aggression} />
            <input type="hidden" name="parallelSubjects" value={parallelSubjects} />
            <Button type="submit" disabled={!canCreate}>
              Create My Sheet
            </Button>
          </form>
        ) : null}
      </div>
    </div>
  );
}

function SubjectPicker({
  title,
  description,
  values,
  onToggle,
  tone,
}: {
  title: string;
  description: string;
  values: string[];
  onToggle: (value: string) => void;
  tone: "secondary" | "destructive";
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="grid gap-3 md:grid-cols-2">
        {subjectOptions.map((item) => {
          const canonical = toCanonical(item.name);
          const active = values.includes(canonical);
          return (
            <Field key={item.name}>
              <FieldLabel className="items-start gap-3 rounded-xl border p-3">
                <Checkbox checked={active} onCheckedChange={() => onToggle(item.name)} />
                <FieldContent>
                  <FieldTitle>{item.name}</FieldTitle>
                  <FieldDescription>Order {item.order}</FieldDescription>
                  <Badge variant={tone}>{active ? "Selected" : "Tap to select"}</Badge>
                </FieldContent>
              </FieldLabel>
            </Field>
          );
        })}
      </CardContent>
    </Card>
  );
}

function SummaryStat({ label, value }: { label: string; value: string | number }) {
  return (
    <Card data-size="sm">
      <CardContent className="py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}
