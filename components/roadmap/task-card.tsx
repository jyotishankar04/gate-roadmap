"use client";

import Link from "next/link";
import { useState, useRef } from "react";
import type { RoadmapTask } from "@prisma/client";
import { updateTaskStatus } from "@/actions/task.actions";
import { TaskStatusBadge } from "@/components/roadmap/task-status-badge";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Timer } from "lucide-react";

import { cn } from "@/lib/utils";

export function TaskCard({ task, highlighted = false }: { task: RoadmapTask; highlighted?: boolean }) {
  const [status, setStatus] = useState(task.status);
  const formRef = useRef<HTMLFormElement>(null);
  const timerHref = `/my-roadmap/tools?${new URLSearchParams({
    subject: task.subjectName,
    topic: task.topicName ?? "",
    subtopic: task.subtopicName ?? "",
    task: task.id,
    title: task.title,
    type: "TIMER",
  }).toString()}`;

  const handleMarkToRevise = () => {
    setStatus("PUT_TO_REVISE");
    setTimeout(() => {
      if (formRef.current) {
        formRef.current.requestSubmit();
      }
    }, 100);
  };

  return (
    <Card
      id={`task-${task.id}`}
      className={cn(
        highlighted && "border-primary bg-primary/5",
        "scroll-mt-24 border-muted/60 shadow-none transition-colors",
      )}
    >
      <CardContent className="flex flex-col gap-3 p-3">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0 flex-1 flex flex-col gap-1">
            <p className="truncate text-[11px] font-medium text-muted-foreground">
              {task.subjectName}
            </p>
            <h3 className="truncate text-[15px] font-semibold leading-snug md:text-base">
              {task.title}
            </h3>
            <p className="truncate text-xs text-muted-foreground">
              {[task.topicName, task.subtopicName].filter(Boolean).join(" • ")}
            </p>
          </div>
          <TaskStatusBadge status={task.status} />
        </div>
        <form ref={formRef} action={updateTaskStatus}>
          <input type="hidden" name="taskId" value={task.id} />
          <input type="hidden" name="status" value={status} />
          <FieldGroup className="grid gap-2 md:grid-cols-3 md:items-end">
            <Field>
              <FieldLabel className="text-[11px] font-medium text-muted-foreground">Status</FieldLabel>
              <Select value={status} onValueChange={(value) => value && setStatus(value)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="NOT_STARTED">Not Started</SelectItem>
                    <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                    <SelectItem value="COMPLETED">Completed</SelectItem>
                    <SelectItem value="BEHIND">Behind</SelectItem>
                    <SelectItem value="FAST_PACED">Fast Paced</SelectItem>
                    <SelectItem value="PUT_TO_REVISE">Put To Revise</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </Field>
            <Field>
              <FieldLabel className="text-[11px] font-medium text-muted-foreground">Rating</FieldLabel>
              <Input
                name="selfRating"
                type="number"
                min={1}
                max={5}
                placeholder="1-5"
                defaultValue={task.selfRating ?? ""}
                className="h-9"
              />
            </Field>
            <Field>
              <FieldLabel className="text-[11px] font-medium text-muted-foreground">Time</FieldLabel>
              <Input
                name="actualMinutes"
                type="number"
                min={0}
                placeholder="Min"
                defaultValue={task.actualMinutes ?? ""}
                className="h-9"
              />
            </Field>
            <Field className="md:col-span-3 flex flex-col gap-2 sm:flex-row sm:justify-end">
              <Button type="submit" className="h-9 px-4 sm:w-auto w-full" size="sm">
                Update
              </Button>
              <Button
                type="button"
                variant="outline"
                className="h-9 px-4 sm:w-auto w-full"
                size="sm"
                onClick={handleMarkToRevise}
              >
                Revise
              </Button>
            </Field>
            <Field className="md:col-span-4">
              <FieldLabel className="text-[11px] font-medium text-muted-foreground">Notes</FieldLabel>
              <Textarea
                name="notes"
                placeholder="Add a short note or mistake"
                defaultValue={task.notes ?? ""}
                className="min-h-16 resize-none text-sm"
              />
            </Field>
          </FieldGroup>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-[11px] text-muted-foreground">
            <Badge variant="outline" className="h-6 px-2 text-[10px] font-normal text-muted-foreground">
              {task.taskType.replaceAll("_", " ")}
            </Badge>
            <span>Est. {task.estimatedMinutes}m</span>
            {task.actualMinutes ? <span>Act. {task.actualMinutes}m</span> : null}
            <Button render={<Link href={timerHref} />} size="sm" variant="ghost" className="ml-auto h-7 px-3 text-[11px]">
              <Timer className="size-3.5" />
              Start Timer
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
