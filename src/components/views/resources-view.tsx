"use client";

import { useMemo, useState } from "react";
import { motion } from "motion/react";
import { Download, FileText, CheckSquare, LayoutTemplate, Bot, BookMarked, ArrowUpRight, Layers } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/store/nav";
import { ExpandableTabs } from "@/components/site/expandable-tabs";
import { cn } from "@/lib/utils";

const TYPE_META: Record<string, { icon: typeof FileText; label: string }> = {
  pdf: { icon: FileText, label: "Free PDF" },
  template: { icon: LayoutTemplate, label: "Template" },
  checklist: { icon: CheckSquare, label: "Checklist" },
  "prompt-pack": { icon: Bot, label: "Prompt Pack" },
  guide: { icon: BookMarked, label: "Guide" },
};

const FILTERS = ["All", "pdf", "template", "checklist", "prompt-pack", "guide"] as const;

const FILTER_TABS = [
  { title: "All resources", icon: Layers },
  { type: "separator" as const },
  { title: "pdf", icon: FileText },
  { title: "template", icon: LayoutTemplate },
  { title: "checklist", icon: CheckSquare },
  { title: "prompt-pack", icon: Bot },
  { title: "guide", icon: BookMarked },
];

export function ResourcesView() {
  const { data, loading } = useData<{ resources: any[] }>("/api/resources");
  const [filter, setFilter] = useState<string>("All");
  const { toast } = useToast();
  const navigate = useNav((s) => s.navigate);

  const resources = data?.resources ?? [];
  const filtered = filter === "All" ? resources : resources.filter((r) => r.type === filter);

  const byCategory = useMemo(() => {
    const map = new Map<string, any[]>();
    for (const r of filtered) {
      if (!map.has(r.category)) map.set(r.category, []);
      map.get(r.category)!.push(r);
    }
    return Array.from(map.entries());
  }, [filtered]);

  // Map filter string → ExpandableTabs index (skipping the separator item).
  const filterIndex = useMemo(() => {
    if (filter === "All") return 0;
    let realIdx = 0;
    for (let i = 1; i < FILTER_TABS.length; i++) {
      const t = FILTER_TABS[i];
      if (t.type === "separator") continue;
      realIdx++;
      if (t.title === filter) return i;
    }
    return 0;
  }, [filter]);

  function download(r: any) {
    toast({
      title: "Download started.",
      description: `${r.title} is on its way to your inbox. (Demo)`,
    });
  }

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-10"
      >
        <p className="eyebrow mb-3">Free resources</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] tracking-tight text-balance">
          Templates, checklists
          <br />& prompt packs
        </h1>
        <p className="mt-5 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground">
          The same tools I use every week — free to download, no email gymnastics. Grab what you need and put it to
          work today.
        </p>
      </motion.div>

      {/* Expandable type filter */}
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
            if (!t || t.type === "separator") return;
            setFilter(t.title === "All resources" ? "All" : t.title);
          }}
        />
      </div>

      {loading ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-52 animate-pulse rounded-3xl bg-muted" />
          ))}
        </div>
      ) : (
        <div className="space-y-12">
          {byCategory.map(([category, items]) => (
            <div key={category}>
              <div className="mb-5 flex items-center gap-3">
                <span className="h-2 w-2 rounded-full bg-clay" />
                <h2 className="font-display text-xl tracking-tight sm:text-2xl">{category}</h2>
                <span className="text-xs text-muted-foreground">{items.length}</span>
              </div>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((r, i) => {
                  const meta = TYPE_META[r.type] || TYPE_META.pdf;
                  const Icon = meta.icon;
                  return (
                    <motion.div
                      key={r.id}
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: i * 0.06 }}
                      className="group flex flex-col rounded-3xl border border-border/60 bg-card p-6 transition-all hover:-translate-y-1 hover:shadow-premium"
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <div
                          className="flex h-12 w-12 items-center justify-center rounded-2xl"
                          style={{ background: `${r.accent}18`, color: r.accent }}
                        >
                          <Icon className="h-5 w-5" />
                        </div>
                        <span className="rounded-full bg-muted px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                          {meta.label}
                        </span>
                      </div>
                      <h3 className="font-display text-lg leading-snug tracking-tight">{r.title}</h3>
                      <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{r.description}</p>
                      <div className="mt-5 flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {r.downloads.toLocaleString()} downloads
                          {r.pages && ` · ${r.pages}p`}
                        </span>
                        <button
                          onClick={() => download(r)}
                          className="inline-flex items-center gap-1.5 rounded-full bg-foreground px-4 py-2 text-xs font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
                        >
                          <Download className="h-3.5 w-3.5" />
                          Get free
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* CTA */}
      <div className="mt-16 flex flex-col items-start justify-between gap-5 rounded-3xl border border-border/60 bg-muted/30 p-8 sm:flex-row sm:items-center sm:p-10">
        <div>
          <h3 className="font-display text-2xl tracking-tight">Want all of them at once?</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Get the complete resource vault with every book purchase.
          </p>
        </div>
        <button
          onClick={() => navigate("books")}
          className="inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
        >
          Browse the books
          <ArrowUpRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
