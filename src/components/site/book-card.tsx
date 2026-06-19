"use client";

import { useRef, useState } from "react";
import { motion } from "motion/react";
import { BookCover, type BookCoverData } from "./book-cover";
import { useNav } from "@/lib/store/nav";
import { cn } from "@/lib/utils";

export type BookLite = {
  title: string;
  slug: string;
  subtitle?: string;
  category?: string;
  accent: string;
  coverStyle: string;
  badge?: string | null;
  price?: number;
  pages?: number;
  rating?: number;
  reviewsCount?: number;
};

/**
 * Book card with premium 3D hover tilt + Apple-style lift.
 */
export function BookCard({ book, size = "md", index = 0 }: { book: BookLite; size?: "sm" | "md" | "lg"; index?: number }) {
  const navigate = useNav((s) => s.navigate);
  const ref = useRef<HTMLButtonElement>(null);
  const [t, setT] = useState({ rx: 0, ry: 0 });

  const widths = { sm: "w-32 sm:w-36", md: "w-40 sm:w-48", lg: "w-52 sm:w-60" };

  function onMove(e: React.MouseEvent) {
    const el = ref.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    setT({ ry: px * 14, rx: -py * 12 });
  }

  return (
    <motion.button
      ref={ref}
      onMouseMove={onMove}
      onMouseLeave={() => setT({ rx: 0, ry: 0 })}
      onClick={() => navigate("book", { bookSlug: book.slug })}
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.22, 1, 0.36, 1] }}
      className={cn("group relative shrink-0 text-left", widths[size])}
      style={{ perspective: 1000 }}
    >
      <motion.div
        animate={{ rotateX: t.rx, rotateY: t.ry }}
        transition={{ type: "spring", stiffness: 200, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
        className="relative"
      >
        {/* glow */}
        <div
          className="absolute -inset-2 -z-10 rounded-2xl opacity-0 blur-2xl transition-opacity duration-500 group-hover:opacity-30"
          style={{ background: book.accent }}
        />
        <div className="transition-transform duration-500 ease-out group-hover:-translate-y-1.5">
          <BookCover book={book as BookCoverData} />
        </div>
      </motion.div>

      <div className="mt-3 px-0.5">
        <h4 className="line-clamp-1 text-sm font-semibold tracking-tight">{book.title}</h4>
        <div className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
          {typeof book.price === "number" && <span className="font-medium text-foreground">${book.price}</span>}
          {typeof book.rating === "number" && (
            <span className="flex items-center gap-0.5">
              <span className="text-clay">★</span>
              {book.rating.toFixed(1)}
            </span>
          )}
        </div>
      </div>
    </motion.button>
  );
}
