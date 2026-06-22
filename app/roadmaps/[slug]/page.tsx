import Link from "next/link";
import { notFound } from "next/navigation";
import { getActiveRoadmap } from "@/actions/roadmap.actions";
import { AppShell } from "@/components/layout/app-shell";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { requireUser } from "@/lib/auth";
import { ArrowRight } from "lucide-react";

const SUBJECT_TABLE = [
  { name: "C Programming", start: "24 Jun 2026", end: "1 Jul 2026", days: 8 },
  { name: "Data Structures", start: "2 Jul 2026", end: "15 Jul 2026", days: 14 },
  { name: "Algorithms", start: "16 Jul 2026", end: "27 Jul 2026", days: 12 },
  { name: "Discrete Mathematics", start: "28 Jul 2026", end: "8 Aug 2026", days: 12 },
  { name: "DBMS", start: "9 Aug 2026", end: "20 Aug 2026", days: 12 },
  { name: "Digital Logic", start: "21 Aug 2026", end: "27 Aug 2026", days: 7 },
  { name: "COA", start: "28 Aug 2026", end: "8 Sep 2026", days: 12 },
  { name: "Operating Systems", start: "9 Sep 2026", end: "22 Sep 2026", days: 14 },
  { name: "Computer Networks", start: "23 Sep 2026", end: "6 Oct 2026", days: 14 },
  { name: "Theory of Computation", start: "7 Oct 2026", end: "20 Oct 2026", days: 14 },
  { name: "Compiler Design", start: "21 Oct 2026", end: "27 Oct 2026", days: 7 },
  { name: "Engineering Mathematics", start: "28 Oct 2026", end: "10 Nov 2026", days: 14 },
];

const REVISION_TABLE = [
  { name: "Revision Cycle 1", start: "11 Nov 2026", end: "10 Dec 2026", days: 30 },
  { name: "Revision Cycle 2", start: "11 Dec 2026", end: "31 Dec 2026", days: 21 },
  { name: "PYQ Practice Block", start: "1 Jan 2027", end: "12 Jan 2027", days: 12 },
  { name: "Mock Test + Analysis Block", start: "13 Jan 2027", end: "24 Jan 2027", days: 12 },
  { name: "Final Revision", start: "25 Jan 2027", end: "1 Feb 2027", days: 8 },
];

export default async function RoadmapLandingPage({ params }: { params: Promise<{ slug: string }> }) {
  const user = await requireUser();
  const { slug } = await params;
  
  if (slug !== "gate-cse-2027") {
    notFound();
  }

  const activeRoadmap = await getActiveRoadmap(user.id);

  return (
    <AppShell username={user.username}>
      <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="flex flex-col gap-4">
          <p className="text-sm font-semibold text-primary">GATE CSE 2027</p>
          <h1 className="text-4xl font-black text-balance">GATE CSE 2027 Static Roadmap</h1>
          <p className="text-lg text-muted-foreground">
            A fixed, day-wise schedule mapping June 2026 to February 2027. Tracks core concepts, note-taking, daily practice, and PYQs, combined with 2 revision cycles and mock test reviews.
          </p>
          <div className="flex gap-2">
            {activeRoadmap ? (
              <Button size="lg" className="w-fit" render={<Link href="/my-roadmap/sheet" />}>
                Continue Tracking
                <ArrowRight data-icon="inline-end" />
              </Button>
            ) : (
              <Button size="lg" className="w-fit" render={<Link href="/my-roadmap/create-sheet" />}>
                Create My Sheet
                <ArrowRight data-icon="inline-end" />
              </Button>
            )}
          </div>
        </div>
        <Card>
          <CardHeader><CardTitle>Roadmap phases</CardTitle></CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <Card data-size="sm">
              <CardHeader>
                <CardTitle>Phase 1: STUDYING</CardTitle>
                <CardDescription>24 June 2026 to 10 November 2026 (140 days). Dedicated subject-wise completion with daily lectures, notes, practice, and PYQs.</CardDescription>
              </CardHeader>
            </Card>
            <Card data-size="sm">
              <CardHeader>
                <CardTitle>Phase 2: REVISION</CardTitle>
                <CardDescription>11 November 2026 to 1 February 2027 (83 days). Multi-cycle revisions, formula checks, PYQ blocks, and full mock reviews.</CardDescription>
              </CardHeader>
            </Card>
          </CardContent>
        </Card>
      </section>

      <section className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Subject timeline schedule (Phase 1)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Subject</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {SUBJECT_TABLE.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.start}</TableCell>
                    <TableCell>{row.end}</TableCell>
                    <TableCell className="text-right">{row.days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revision block schedule (Phase 2)</CardTitle>
          </CardHeader>
          <CardContent className="overflow-x-auto p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Revision Block</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead className="text-right">Days</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {REVISION_TABLE.map((row) => (
                  <TableRow key={row.name}>
                    <TableCell className="font-medium">{row.name}</TableCell>
                    <TableCell>{row.start}</TableCell>
                    <TableCell>{row.end}</TableCell>
                    <TableCell className="text-right">{row.days}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </section>
    </AppShell>
  );
}
