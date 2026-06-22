import type { ProgressStatus } from "@prisma/client";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

const labels: Record<ProgressStatus, string> = {
  NOT_STARTED: "Not Started",
  IN_PROGRESS: "In Progress",
  COMPLETED: "Completed",
  BEHIND: "Behind",
  FAST_PACED: "Fast Paced",
  PUT_TO_REVISE: "Put To Revise",
};

const variants: Record<ProgressStatus, "default" | "secondary" | "destructive" | "outline"> = {
  NOT_STARTED: "outline",
  IN_PROGRESS: "secondary",
  COMPLETED: "default",
  BEHIND: "destructive",
  FAST_PACED: "secondary",
  PUT_TO_REVISE: "outline",
};

export function TaskStatusBadge({ status, className }: { status: ProgressStatus | string; className?: string }) {
  const s = status as ProgressStatus;
  return (
    <Badge variant={variants[s] ?? "outline"} className={cn(className)}>
      {labels[s] ?? status.replaceAll("_", " ")}
    </Badge>
  );
}
