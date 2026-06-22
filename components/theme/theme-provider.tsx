"use client";

import * as React from "react";

type Theme = "light" | "dark";

type ThemeContextValue = {
  theme: Theme;
  setTheme: (theme: Theme) => void;
};

const ThemeContext = React.createContext<ThemeContextValue | null>(null);
const listeners = new Set<() => void>();
let currentTheme: Theme = "light";

function getSystemTheme(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

function applyTheme(theme: Theme) {
  document.documentElement.classList.remove("light", "dark");
  document.documentElement.classList.add(theme);
}

function readStoredTheme() {
  const stored = window.localStorage.getItem("gatetrack-theme") as Theme | null;
  return stored === "light" || stored === "dark" ? stored : getSystemTheme();
}

function setThemeSnapshot(nextTheme: Theme, persist = true) {
  currentTheme = nextTheme;
  if (persist) {
    window.localStorage.setItem("gatetrack-theme", nextTheme);
  }
  applyTheme(nextTheme);
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  queueMicrotask(() => {
    const nextTheme = readStoredTheme();
    if (nextTheme !== currentTheme) {
      setThemeSnapshot(nextTheme, false);
      return;
    }
    applyTheme(nextTheme);
  });
  return () => {
    listeners.delete(listener);
  };
}

function getSnapshot() {
  return currentTheme;
}

function getServerSnapshot() {
  return "light" as Theme;
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const theme = React.useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const setTheme = React.useCallback((nextTheme: Theme) => {
    setThemeSnapshot(nextTheme);
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useGateTheme() {
  const context = React.useContext(ThemeContext);
  if (!context) {
    throw new Error("useGateTheme must be used within ThemeProvider");
  }
  return context;
}
