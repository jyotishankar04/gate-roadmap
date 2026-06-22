import { format } from "date-fns";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function Topbar({ username }: { username: string }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-border bg-background/80 px-4 backdrop-blur-xl lg:px-8">
      <div className="flex items-center gap-3">
        <SidebarTrigger />
        <div>
          <p className="text-sm text-muted-foreground">
            {format(new Date(), "EEEE, dd MMM yyyy")}
          </p>
          <h1 className="font-semibold">Welcome back, {username}</h1>
        </div>
      </div>
      <ThemeToggle />
    </header>
  );
}
