"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Layers, Bot, Megaphone, User, Zap, Boxes, Sparkles } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { BookShelf, ColoredShelf } from "@/components/site/shelf";
import { ExpandableTabs } from "@/components/site/expandable-tabs";
import type { BookLite } from "@/components/site/book-card";

// Shelf accent per category
const CATEGORY_ACCENT: Record<string, string> = {
  "AI Business": "#1a1a1a",
  AI: "#1e3a8a",
  Marketing: "#9d174d",
  Freelance: "#15803d",
  Productivity: "#7c2d12",
  Frameworks: "#4c1d95",
};

const FILTERS = ["All", "AI Business", "AI", "Marketing", "Freelance", "Productivity", "Frameworks"] as const;

const FILTER_TABS = [
  { title: "All", icon: Layers },
  { type: "separator" as const },
  { title: "AI Business", icon: Sparkles },
  { title: "AI", icon: Bot },
  { title: "Marketing", icon: Megaphone },
  { title: "Freelance", icon: User },
  { title: "Productivity", icon: Zap },
  { title: "Frameworks", icon: Boxes },
];

export function BooksView() {
  const { data, loading } = useData<{ books: BookLite[] }>("/api/books");
  const [filter, setFilter] = useState<string>("All");

  const books = data?.books ?? [];

  const grouped = useMemo(() => {
    const list = filter === "All" ? books : books.filter((b) => b.category === filter);
    const map = new Map<string, BookLite[]>();
    for (const b of list) {
      if (!map.has(b.category)) map.set(b.category, []);
      map.get(b.category)!.push(b);
    }
    return Array.from(map.entries());
  }, [books, filter]);

  // Map ExpandableTabs index → filter string (accounting for the separator item).
  const filterIndex = useMemo(() => {
    let realIdx = -1;
    for (let i = 0; i < FILTER_TABS.length; i++) {
      const t = FILTER_TABS[i];
      if (t.type === "separator") continue;
      realIdx++;
      if (t.title === filter) return i;
    }
    return 0;
  }, [filter]);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10"
      >
        <p className="eyebrow mb-3">The library</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] tracking-tight text-balance">
          Books, playbooks
          <br />& operating systems
        </h1>
        <p className="mt-5 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground">
          Every resource I publish is a working system, not a tweet storm. Browse by category, read a free preview,
          and buy only what you will actually use.
        </p>
      </motion.div>

      {/* Expandable category filter */}
      <div className="no-scrollbar -mx-5 mb-10 overflow-x-auto px-5 sm:mx-0 sm:px-0">
        <ExpandableTabs
          tabs={FILTER_TABS}
          value={filterIndex}
          activeColor="text-clay"
          className="w-max"
          onChange={(index) => {
            if (index === null) {
              setFilter("All");
              return;
            }
            const t = FILTER_TABS[index];
            if (t && t.type !== "separator") setFilter(t.title);
          }}
        />
      </div>

      {/* Shelves */}
      {loading ? (
        <div className="space-y-8">
          {[0, 1, 2].map((i) => (
            <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-7">
          {grouped.map(([category, items]) => (
            <ColoredShelf
              key={category}
              label={category}
              count={items.length}
              accent={CATEGORY_ACCENT[category] || "#1a1a1a"}
            >
              <BookShelf books={items} />
            </ColoredShelf>
          ))}
        </div>
      )}
    </div>
  );
}
