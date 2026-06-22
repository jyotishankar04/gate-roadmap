import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function SubjectProgressCard({ subject, total, completed, revision, progress }: { subject: string; total: number; completed: number; revision: number; progress: number }) {
  return (
    <Card>
      <CardContent className="flex flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold">{subject}</h3>
            <p className="text-sm text-muted-foreground">{completed}/{total} topics complete</p>
          </div>
          <span className="text-xl font-bold">{progress}%</span>
        </div>
        <Progress value={progress} />
        <p className="text-xs text-muted-foreground">{revision} weak or revision topics</p>
      </CardContent>
    </Card>
  );
}
