import Link from "next/link";
import { BarChart3, CalendarCheck, Moon, PenLine, ShieldCheck, Target, TimerReset, BookOpenText } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getCurrentUser } from "@/lib/auth";

const features = [
  { title: "Fixed GATE CSE Roadmap", icon: CalendarCheck, description: "A pre-scheduled 223-day roadmap spanning June 2026 to Feb 2027." },
  { title: "Sheet-like Tracker", icon: BookOpenText, description: "Manage subjects, topics, and subtopics in a clean tabular view." },
  { title: "Today's Tasks", icon: Target, description: "Bite-sized daily checklists containing learning, notes, and practice." },
  { title: "Calendar View", icon: CalendarCheck, description: "Browse days chronologically with completion percentages and statuses." },
  { title: "Revision Queue", icon: TimerReset, description: "Keep track of weak topics and behind schedule items." },
  { title: "Mock Tracker", icon: PenLine, description: "Log details of subject tests, mocks, scores, and mistakes." },
  { title: "Analytics Dashboard", icon: BarChart3, description: "Visualize progress by subject, daily streaks, and completion rate." },
  { title: "Dark Mode", icon: Moon, description: "Late-night friendly interface customizable to your preference." },
];

export default async function HomePage() {
  let user = null;
  try {
    user = await getCurrentUser();
  } catch {
    user = null;
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-7xl flex-col gap-16 px-4 py-8 lg:px-8">
      <nav className="flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 font-black text-xl">
          <Badge>
            <ShieldCheck data-icon="inline-start" />
          </Badge>
          GateTrack
        </Link>
        <div className="flex gap-2">
          {user ? (
            <Button render={<Link href="/dashboard" />}>Go to Dashboard</Button>
          ) : (
            <>
              <Button variant="ghost" render={<Link href="/login" />}>Login</Button>
              <Button render={<Link href="/register" />}>Start Tracking</Button>
            </>
          )}
        </div>
      </nav>

      <section className="grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="flex flex-col gap-6">
          <Badge variant="outline">GATE CSE 2027 Static Tracker</Badge>
          <h1 className="max-w-4xl text-5xl font-black tracking-tight text-balance md:text-6xl lg:text-7xl">
            GATE CSE 2027 Static Tracker
          </h1>
          <p className="max-w-2xl text-lg text-muted-foreground">
            A fixed day-wise GATE CSE roadmap from 24 June 2026 to 1 February 2027 with a clean sheet-style tracker. No complex setups. No AI replanning. Just straight tracking.
          </p>
          <div className="flex flex-wrap gap-3">
            <Button size="lg" render={<Link href={user ? "/dashboard" : "/register"} />}>Start Tracking GATE CSE 2027</Button>
            {!user && (
              <Button size="lg" variant="outline" render={<Link href="/login" />}>Login</Button>
            )}
          </div>
        </div>

        <Card className="overflow-hidden border-primary/20 bg-card/80 shadow-2xl">
          <CardHeader>
            <CardTitle>Daily workflow preview</CardTitle>
            <CardDescription>Structured around lectures, notes, practice, PYQs, and verbal/aptitude alternate days.</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-3">
            {[
              "Learn concept: Binary Search Trees (Lecture - 60 min)",
              "Make short notes: AVL trees & rotations (Notes - 20 min)",
              "Practice 15 BST questions (Practice - 45 min)",
              "Solve 5 GATE PYQs on BSTs (PYQs - 30 min)",
              "Daily Aptitude: Ratio and Proportion (Practice - 20 min)"
            ].map((item, index) => (
              <Card key={item} data-size="sm">
                <CardContent className="flex items-center gap-3">
                  <Badge>{index + 1}</Badge>
                  <span className="font-medium text-sm md:text-base">{item}</span>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {features.map((feature) => (
          <Card key={feature.title} className="hover:border-primary/30 transition-colors">
            <CardHeader>
              <Badge className="mb-2">
                <feature.icon data-icon="inline-start" />
              </Badge>
              <CardTitle className="text-lg">{feature.title}</CardTitle>
              <CardDescription>{feature.description}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </section>

      <section className="rounded-3xl border border-primary/10 bg-muted/30 p-8 md:p-12 flex flex-col gap-6 items-center text-center">
        <h2 className="text-3xl font-bold max-w-xl text-balance">Ready to conquer GATE CSE 2027?</h2>
        <p className="text-muted-foreground max-w-lg">
          Start tracking your journey from day 1 (24 June 2026) to the final revision blocks ending on 1 February 2027.
        </p>
        <Button size="lg" render={<Link href={user ? "/dashboard" : "/register"} />}>Start Tracking Now</Button>
      </section>
    </main>
  );
}
