import * as React from "react";
import { AppSidebar } from "@/components/layout/sidebar";
import { Topbar } from "@/components/layout/topbar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";

export function AppShell({ username, children }: { username: string; children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Topbar username={username} />
        <main className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 pb-28 lg:px-8 lg:pb-10">
          {children}
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}
