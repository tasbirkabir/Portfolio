"use client";

import { useEffect, useMemo, useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  Home, BookOpen, FileText, Newspaper, User, UserRound, Mail, Moon, Sun,
  ArrowUpRight, Search, Library, LogIn, Shield, Sparkles, type LucideIcon,
} from "lucide-react";
import { useNav, type View } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { useData } from "@/hooks/use-data";
import { useTheme } from "./theme-provider";
import { ExpandableTabs } from "./expandable-tabs";
import { Logo } from "./logo";
import { cn } from "@/lib/utils";

type NavTabItem = {
  title: string;
  view: View;
  icon: LucideIcon;
};
type NavSeparator = { type: "separator" };
type NavEntry = NavTabItem | NavSeparator;

// Hardcoded fallback tabs — used when settings.navItems is empty (the default).
const NAV_TABS: NavEntry[] = [
  { title: "Home", view: "home", icon: Home },
  { title: "Books", view: "books", icon: BookOpen },
  { title: "Resources", view: "resources", icon: FileText },
  { title: "Blog", view: "blog", icon: Newspaper },
  { type: "separator" as const },
  { title: "Knowledge", view: "knowledge", icon: Library },
  { title: "About", view: "about", icon: User },
  { title: "Contact", view: "contact", icon: Mail },
];

// Map a view name → icon. Used when settings.navItems is populated.
const VIEW_ICON_MAP: Record<string, LucideIcon> = {
  home: Home,
  books: BookOpen,
  book: BookOpen,
  resources: FileText,
  blog: Newspaper,
  post: Newspaper,
  about: User,
  contact: Mail,
  knowledge: Library,
  search: Search,
  library: Library,
  account: UserRound,
  admin: Shield,
};

function iconForView(view: string): LucideIcon {
  return VIEW_ICON_MAP[view] || Sparkles;
}

export function Navbar() {
  const { view, navigate } = useNav();
  const { theme, toggle } = useTheme();
  const { user, openAuthModal } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const { data: settingsData } = useData<{ settings: any }>("/api/settings");
  const s = settingsData?.settings ?? null;

  const brandName = s?.brandName ?? "Tasbir Kabir";

  // If settings.navItems is a non-empty array, build tabs from it; else fallback.
  const tabs = useMemo<NavEntry[]>(() => {
    const items = s?.navItems;
    if (Array.isArray(items) && items.length) {
      return items.map((it: { label?: string; title?: string; view: string }) => ({
        title: it.label || it.title || it.view,
        view: (it.view as View) || "home",
        icon: iconForView(it.view),
      }));
    }
    return NAV_TABS;
  }, [s?.navItems]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Current view → tab index in the full tabs array (incl. separators).
  const activeTabIndex = (() => {
    const idx = tabs.findIndex((t) => t.type !== "separator" && t.view === view);
    return idx === -1 ? 0 : idx;
  })();

  return (
    <header
      className={cn(
        "fixed inset-x-0 top-0 z-50 transition-all duration-500",
        scrolled
          ? "glass border-b border-border/60"
          : "bg-background/80 backdrop-blur-md border-b border-transparent md:bg-transparent md:backdrop-blur-none"
      )}
    >
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:gap-4 sm:px-8">
        {/* Wordmark — logo + name always visible */}
        <button onClick={() => navigate("home")} className="group flex min-w-0 shrink-0 items-center gap-2">
          <Logo size={30} rounded="rounded-full" />
          <span className="truncate font-display text-base tracking-tight sm:text-lg">
            {brandName}
          </span>
        </button>

        {/* Center nav — ExpandableTabs (desktop only, md+) */}
        <nav className="hidden min-w-0 md:block">
          <ExpandableTabs
            tabs={tabs}
            value={activeTabIndex}
            activeColor="text-clay"
            onChange={(index) => {
              if (index === null) return;
              const t = tabs[index];
              if (t && t.type !== "separator") navigate(t.view);
            }}
          />
        </nav>

        {/* Right actions — compact on mobile, full on desktop */}
        <div className="flex shrink-0 items-center gap-1 sm:gap-1.5">
          {/* Search — hidden on the smallest screens (available via bottom nav) */}
          <button
            onClick={() => navigate("search")}
            aria-label="Search"
            className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground sm:flex"
          >
            <Search className="h-4 w-4" />
          </button>
          {/* Library — hidden on mobile (available via bottom nav when logged in) */}
          {user && (
            <button
              onClick={() => navigate("library")}
              aria-label="Library"
              className="hidden h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground sm:flex"
            >
              <Library className="h-4 w-4" />
            </button>
          )}
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
          >
            <AnimatePresence mode="wait" initial={false}>
              <motion.span
                key={theme}
                initial={{ opacity: 0, rotate: -90, scale: 0.5 }}
                animate={{ opacity: 1, rotate: 0, scale: 1 }}
                exit={{ opacity: 0, rotate: 90, scale: 0.5 }}
                transition={{ duration: 0.25 }}
              >
                {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
              </motion.span>
            </AnimatePresence>
          </button>

          {user ? (
            <div className="flex items-center gap-1.5">
              {user.role === "admin" && (
                <button
                  onClick={() => navigate("admin")}
                  className="hidden items-center gap-1.5 rounded-full bg-clay/10 px-3 py-2 text-xs font-medium text-clay transition-colors hover:bg-clay/20 lg:flex"
                >
                  <Shield className="h-3.5 w-3.5" /> Admin
                </button>
              )}
              <button
                onClick={() => navigate("account")}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-foreground font-display text-sm text-background"
                aria-label="Account"
              >
                {(user.name || user.email).charAt(0).toUpperCase()}
              </button>
            </div>
          ) : (
            <>
              {/* Mobile: icon-only sign-in button */}
              <button
                onClick={() => openAuthModal("login")}
                aria-label="Sign in"
                className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground sm:hidden"
              >
                <UserRound className="h-[18px] w-[18px]" />
              </button>
              {/* Desktop: text sign-in button */}
              <button
                onClick={() => openAuthModal("login")}
                className="hidden items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm font-medium transition-colors hover:bg-foreground/5 sm:flex"
              >
                <LogIn className="h-3.5 w-3.5" /> Sign in
              </button>
            </>
          )}

          <button
            onClick={() => navigate("book", { bookSlug: "ai-agency-operating-system" })}
            className="hidden items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95 lg:flex"
          >
            Get the Book
            <ArrowUpRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </header>
  );
}
