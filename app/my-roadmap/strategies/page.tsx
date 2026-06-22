import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { requireUser } from "@/lib/auth";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { gateStrategies } from "@/lib/roadmap/gate-strategies";
import { ArrowRight, CalendarDays, CheckCircle2, ClipboardList, TestTube2 } from "lucide-react";

const quickActions = [
  { href: "/my-roadmap/today", label: "Open Today", description: "Turn a strategy into a day plan.", icon: ClipboardList },
  { href: "/my-roadmap/calendar", label: "Open Calendar", description: "Reserve time blocks and weekends.", icon: CalendarDays },
  { href: "/my-roadmap/tests", label: "Open Tests", description: "Run the mock-test ladder.", icon: TestTube2 },
];

export default async function StrategiesPage() {
  const user = await requireUser();

  return (
    <AppShell username={user.username}>
      <div className="flex flex-col gap-6">
        <Card>
          <CardHeader className="flex flex-col gap-4">
            <div className="flex flex-wrap items-center gap-2">
              <Badge>Strategy library</Badge>
              <Badge variant="outline">Working professionals</Badge>
              <Badge variant="secondary">GATE CS</Badge>
            </div>
            <div className="grid gap-6 lg:grid-cols-[1.4fr_0.6fr] lg:items-end">
              <div className="flex flex-col gap-3">
                <CardTitle className="text-3xl">Gate strategies you can actually use</CardTitle>
                <CardDescription className="text-base">
                  These strategies are distilled from the working-professional timetable you shared and turned into a practical playbook for the platform.
                </CardDescription>
                <CardDescription className="text-base">
                  Use this page to decide what to do today, how to split the week, and when to compress easy subjects so revision and practice get more time.
                </CardDescription>
              </div>
              <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
                <MiniStat label="Weekday study" value="2-3 hours" />
                <MiniStat label="Weekend study" value="5-8 hours" />
                <MiniStat label="Mock timing" value="4 months before" />
              </div>
            </div>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {quickActions.map((action) => (
              <Button key={action.href} render={<Link href={action.href} />} variant="outline">
                <action.icon data-icon="inline-start" />
                {action.label}
              </Button>
            ))}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How to use these strategies in GateTrack</CardTitle>
            <CardDescription>Pick the strategy that fits your current time budget, then let the platform enforce it.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <UsageStep
              step="01"
              title="Choose your mode"
              description="Working professional, night study, fast-track, or full-year prep."
            />
            <UsageStep
              step="02"
              title="Turn it into tasks"
              description="Use Today to keep concept, PYQ, and revision work in one place, with easy subjects kept short."
            />
            <UsageStep
              step="03"
              title="Protect the week"
              description="Use Calendar to block weekends, mock slots, and recovery time."
            />
            <UsageStep
              step="04"
              title="Close the loop"
              description="Use Revision and Tests to turn the saved time into more practice and mistake fixing."
            />
          </CardContent>
        </Card>

        <div className="grid gap-4 xl:grid-cols-2">
          {gateStrategies.map((strategy) => (
            <Card key={strategy.title}>
              <CardHeader>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-col gap-1">
                    <CardTitle className="text-xl">{strategy.title}</CardTitle>
                    <CardDescription>{strategy.summary}</CardDescription>
                  </div>
                  <Badge variant="outline">{strategy.cadence}</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <div className="grid gap-3 sm:grid-cols-2">
                  <InfoBlock title="When to use" text={strategy.whenToUse} />
                  <InfoBlock title="How to use" text={strategy.howToUse.join(" ")} />
                </div>
                <Separator />
                <div className="flex flex-col gap-2">
                  <p className="text-sm font-semibold">Use it in the platform</p>
                  <ul className="grid gap-2 text-sm text-muted-foreground">
                    {strategy.useInPlatform.map((item) => (
                      <li key={item} className="flex gap-2">
                        <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <Separator />
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <a
                    href={strategy.sourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-muted-foreground underline decoration-dotted underline-offset-4 hover:text-foreground"
                  >
                    Source: Gate At Zeal article
                  </a>
                  <Button variant="ghost" render={<Link href="/my-roadmap/today" />}>
                    Apply now
                    <ArrowRight data-icon="inline-end" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </AppShell>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <Card data-size="sm">
      <CardContent className="py-4">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="mt-1 text-xl font-bold">{value}</p>
      </CardContent>
    </Card>
  );
}

function UsageStep({ step, title, description }: { step: string; title: string; description: string }) {
  return (
    <Card data-size="sm" className="border-dashed">
      <CardContent className="flex flex-col gap-2 py-4">
        <Badge variant="secondary" className="w-fit">{step}</Badge>
        <p className="font-semibold">{title}</p>
        <p className="text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}

function InfoBlock({ title, text }: { title: string; text: string }) {
  return (
    <div className="rounded-lg border border-border p-4">
      <p className="text-sm font-semibold">{title}</p>
      <p className="mt-1 text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
