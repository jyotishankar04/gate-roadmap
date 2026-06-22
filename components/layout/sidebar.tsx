import Link from "next/link";
import {
  BarChart3,
  BookMarked,
  BookOpenText,
  CalendarDays,
  ClipboardList,
  Gauge,
  Home,
  LogOut,
  Settings,
  Sparkles,
  Target,
  GraduationCap,
} from "lucide-react";
import { logoutUser } from "@/actions/auth.actions";
import { getActiveRoadmap } from "@/actions/roadmap.actions";
import { requireUser } from "@/lib/auth";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar";

const primaryNav = [
  { href: "/dashboard", label: "Dashboard", icon: Home },
  { href: "/my-roadmap", label: "My Roadmap", icon: Target },
];

const planNav = [
  { href: "/my-roadmap/create-sheet", label: "Create Sheet", icon: Sparkles },
  { href: "/my-roadmap/today", label: "Today", icon: ClipboardList },
  { href: "/my-roadmap/sheet", label: "Sheet", icon: BookOpenText },
  { href: "/my-roadmap/calendar", label: "Calendar", icon: CalendarDays },
];

const trackNav = [
  { href: "/my-roadmap/subjects", label: "Subjects", icon: BookMarked },
  { href: "/my-roadmap/topics", label: "Topics", icon: BookOpenText },
  { href: "/my-roadmap/subtopics", label: "Subtopics", icon: BookOpenText },
  { href: "/my-roadmap/revision", label: "Revision", icon: GraduationCap },
  { href: "/my-roadmap/strategies", label: "Strategies", icon: Sparkles },
  { href: "/my-roadmap/tests", label: "Tests", icon: Gauge },
  { href: "/my-roadmap/analytics", label: "Analytics", icon: BarChart3 },
];

export async function AppSidebar() {
  const user = await requireUser();
  const activeRoadmap = await getActiveRoadmap(user.id);

  const visiblePlanNav = activeRoadmap
    ? planNav.filter((item) => item.href !== "/my-roadmap/create-sheet")
    : planNav;

  return (
    <Sidebar collapsible="icon" variant="sidebar">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              render={<Link href="/dashboard" />}
              size="lg"
              className="group-data-[collapsible=icon]:p-0!"
            >
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                <GraduationCap className="size-4" />
              </div>
              <span className="text-base font-semibold tracking-tight">GateTrack</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Main</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {primaryNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Plan</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visiblePlanNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>Track</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {trackNav.map((item) => (
                <SidebarMenuItem key={item.href}>
                  <SidebarMenuButton render={<Link href={item.href} />} tooltip={item.label}>
                    <item.icon />
                    <span>{item.label}</span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton render={<Link href="/settings" />} tooltip="Settings">
                  <Settings />
                  <span>Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="p-3">
        <form action={logoutUser}>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton
                render={<button type="submit" />}
                variant="outline"
                size="sm"
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut />
                <span>Logout</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </form>
      </SidebarFooter>
    </Sidebar>
  );
}
