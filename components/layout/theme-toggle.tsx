"use client";

import { Moon, Sun } from "lucide-react";
import { useGateTheme } from "@/components/theme/theme-provider";
import { Button } from "@/components/ui/button";

export function ThemeToggle() {
  const { setTheme, theme } = useGateTheme();
  const nextTheme = theme === "light" ? "dark" : "light";
  const Icon = theme === "dark" ? Moon : Sun;

  return (
    <Button variant="outline" size="sm" type="button" onClick={() => setTheme(nextTheme)} aria-label="Toggle theme">
      <Icon data-icon="inline-start" />
      {theme}
    </Button>
  );
}
