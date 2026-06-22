import { resetActiveRoadmap } from "@/actions/settings.actions";
import { logoutUser } from "@/actions/auth.actions";
import { AppShell } from "@/components/layout/app-shell";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { requireUser } from "@/lib/auth";
import { LogOut, RefreshCw } from "lucide-react";

export default async function SettingsPage() {
  const user = await requireUser();

  return (
      <AppShell username={user.username}>
      <div>
        <h1 className="text-3xl font-bold text-balance">Settings</h1>
        <p className="text-muted-foreground">Manage your themes, active roadmap trackers, and session state.</p>
      </div>

      <div className="grid gap-6 max-w-xl">
        <Card>
          <CardHeader>
            <CardTitle>Theme Settings</CardTitle>
            <CardDescription>Select between light and dark themes.</CardDescription>
          </CardHeader>
          <CardContent>
            <ThemeToggle />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Delete Active Roadmap</CardTitle>
            <CardDescription>
              This permanently deletes the active roadmap, including days, tasks, progress, tests, and study logs.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form action={resetActiveRoadmap}>
              <Button type="submit" variant="destructive" className="w-full sm:w-auto">
                <RefreshCw data-icon="inline-start" />
                Delete Active Roadmap
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Account Session</CardTitle>
            <CardDescription>Sign out of your active session.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={logoutUser}>
              <Button type="submit" variant="outline" className="w-full sm:w-auto">
                <LogOut data-icon="inline-start" />
                Sign Out
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
