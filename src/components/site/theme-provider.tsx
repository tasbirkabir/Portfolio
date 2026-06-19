"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{ theme: Theme; toggle: () => void; setTheme: (t: Theme) => void } | null>(null);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Default to "light" so SSR and first client render match (no hydration mismatch).
  const [theme, setThemeState] = useState<Theme>("light");

  // One-time hydration of the persisted user preference.
  useEffect(() => {
    try {
      const stored = localStorage.getItem("tk-theme") as Theme | null;
      if (stored && stored !== "light") {
        setThemeState(stored);
      }
    } catch {}
  }, []);

  // Sync the DOM class + persist whenever theme changes.
  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    try {
      localStorage.setItem("tk-theme", theme);
    } catch {}
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggle = () => setThemeState((t) => (t === "light" ? "dark" : "light"));

  return <ThemeContext.Provider value={{ theme, toggle, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) return { theme: "light" as Theme, toggle: () => {}, setTheme: () => {} };
  return ctx;
}
