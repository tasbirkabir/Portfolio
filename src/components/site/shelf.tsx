"use client";

import { useRef } from "react";
import { motion } from "motion/react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookCard, type BookLite } from "./book-card";
import { cn } from "@/lib/utils";

export function SectionHeader({
  eyebrow,
  title,
  action,
  onAction,
}: {
  eyebrow?: string;
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <div>
        {eyebrow && <p className="eyebrow mb-1.5">{eyebrow}</p>}
        <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      </div>
      {action && (
        <button
          onClick={onAction}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          {action}
          <ChevronRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </div>
  );
}

export function BookShelf({
  books,
  size = "md",
  className,
}: {
  books: BookLite[];
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 1 | -1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * (el.clientWidth * 0.8), behavior: "smooth" });
  };

  return (
    <div className={cn("group/shelf relative", className)}>
      <div
        ref={ref}
        className="no-scrollbar flex gap-5 overflow-x-auto scroll-smooth pb-2 pl-0.5 pr-8"
      >
        {books.map((b, i) => (
          <BookCard key={b.slug} book={b} size={size} index={i} />
        ))}
        {/* fade */}
        <div className="pointer-events-none sticky right-0 top-0 -mr-8 h-full w-8 shrink-0 bg-gradient-to-l from-background to-transparent" />
      </div>

      {/* Arrows (desktop hover) */}
      <button
        onClick={() => scroll(-1)}
        aria-label="Scroll left"
        className="absolute -left-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 shadow-float backdrop-blur transition-all hover:bg-background md:flex opacity-0 group-hover/shelf:opacity-100"
      >
        <ChevronLeft className="h-4 w-4" />
      </button>
      <button
        onClick={() => scroll(1)}
        aria-label="Scroll right"
        className="absolute -right-3 top-1/2 hidden h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-border bg-background/80 shadow-float backdrop-blur transition-all hover:bg-background md:flex opacity-0 group-hover/shelf:opacity-100"
      >
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Apple-Books style colored shelf band */
export function ColoredShelf({
  label,
  count,
  accent,
  children,
}: {
  label: string;
  count?: number;
  accent: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className="relative overflow-hidden rounded-3xl p-5 sm:p-7"
      style={{
        background: `linear-gradient(135deg, ${accent}14, ${accent}06)`,
        boxShadow: `inset 0 0 0 1px ${accent}22`,
      }}
    >
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
          <h3 className="font-display text-xl tracking-tight sm:text-2xl">{label}</h3>
        </div>
        {typeof count === "number" && (
          <span className="text-xs font-medium text-muted-foreground">{count} books</span>
        )}
      </div>
      {children}
    </motion.div>
  );
}
