import Link from "next/link";
import { getActiveRoadmap } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

export default async function RoadmapsPage() {
  const user = await requireUser();
  const activeRoadmap = await getActiveRoadmap(user.id);

  return (
      <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Roadmaps</h1>
        <p className="text-muted-foreground">Select a roadmap to track your preparation schedule.</p>
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <Card className="border-primary/20">
          <CardHeader>
            <CardTitle>GATE CSE 2027 Static Roadmap</CardTitle>
            <CardDescription>
              A fixed day-wise study schedule spanning 223 days. Focuses on covering all core CSE subjects, general aptitude, verbal ability, and revision/mock-test blocks.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Starts: 24 June 2026 • Ends: 1 February 2027</p>
          </CardContent>
          <CardFooter>
            {activeRoadmap ? (
              <Button render={<Link href="/my-roadmap/sheet" />}>
                Continue Tracking
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button render={<Link href="/my-roadmap/create-sheet" />}>
                Create Sheet
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </CardFooter>
        </Card>

        <Card className="opacity-60">
          <CardHeader>
            <CardTitle>DSA Practice Tracker</CardTitle>
            <CardDescription>Interview-ready Striver A2Z data structures and algorithms checklist.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Coming soon</p>
          </CardContent>
          <CardFooter>
            <Button disabled variant="secondary">Unavailable</Button>
          </CardFooter>
        </Card>
      </div>
    </AppShell>
  );
}
