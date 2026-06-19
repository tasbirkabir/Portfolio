"use client";

import { motion } from "motion/react";
import { BookOpen, FileText, Bookmark, ArrowRight, Play, RotateCcw } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useNav } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { AuthPrompt } from "./auth-prompt";
import { BookCover } from "@/components/site/book-cover";

export function LibraryView() {
  const { user } = useAuth();
  const navigate = useNav((s) => s.navigate);
  const openReader = useNav((s) => s.openReader);
  const { data, loading } = useFetch<{ items: any[]; progress: any[] }>(user ? "/api/library" : null);

  if (!user) {
    return <AuthPrompt title="Your library" desc="Sign in to access your purchased books, free resources, reading progress, bookmarks and highlights." />;
  }

  const items = data?.items ?? [];
  const progressMap = new Map((data?.progress ?? []).map((p: any) => [p.bookSlug, p]));
  const books = items.filter((i) => i.type === "book");
  const resources = items.filter((i) => i.type === "resource");
  const continueReading = books
    .map((b) => ({ ...b, p: progressMap.get(b.slug) }))
    .filter((b) => b.p && b.p.progress > 0 && b.p.progress < 100)
    .sort((a, b) => (b.p.progress || 0) - (a.p.progress || 0));

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
        <p className="eyebrow mb-3">My library</p>
        <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.98] tracking-tight text-balance">
          Your digital bookshelf
        </h1>
        <p className="mt-4 max-w-xl font-reader text-lg text-muted-foreground">
          Everything you own — purchased books, free resources, and your reading progress — in one place.
        </p>
      </motion.div>

      {loading ? (
        <div className="grid gap-4 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-64 animate-pulse rounded-3xl bg-muted" />)}</div>
      ) : items.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-border bg-muted/30 p-12 text-center">
          <BookOpen className="mx-auto h-10 w-10 text-muted-foreground/40" />
          <h3 className="mt-4 font-display text-xl">Your library is empty</h3>
          <p className="mt-1 text-sm text-muted-foreground">Browse the books and grab a free resource to get started.</p>
          <button onClick={() => navigate("books")} className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background">
            Browse books <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <div className="space-y-12">
          {/* Continue reading */}
          {continueReading.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-center gap-2 font-display text-xl tracking-tight sm:text-2xl">
                <RotateCcw className="h-5 w-5 text-clay" /> Continue reading
              </h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {continueReading.map((b, i) => (
                  <motion.button
                    key={b.slug}
                    initial={{ opacity: 0, y: 18 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: i * 0.06 }}
                    onClick={() => openReader(b.slug)}
                    className="group flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-1 hover:shadow-premium"
                  >
                    <div className="w-16 shrink-0"><BookCover book={b} showBadge={false} /></div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-semibold">{b.title}</p>
                      <p className="text-xs text-muted-foreground">Chapter {b.p.chapterIndex + 1} · {Math.round(b.p.progress)}%</p>
                      <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-muted">
                        <div className="h-full rounded-full bg-clay" style={{ width: `${b.p.progress}%` }} />
                      </div>
                    </div>
                    <Play className="h-5 w-5 text-clay" />
                  </motion.button>
                ))}
              </div>
            </section>
          )}

          {/* Purchased books */}
          {books.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-center gap-2 font-display text-xl tracking-tight sm:text-2xl">
                <BookOpen className="h-5 w-5 text-clay" /> Purchased books
              </h2>
              <div className="grid gap-5 sm:grid-cols-3 lg:grid-cols-5">
                {books.map((b, i) => (
                  <motion.div key={b.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }}>
                    <button onClick={() => openReader(b.slug)} className="group block w-full text-left">
                      <div className="transition-transform duration-500 group-hover:-translate-y-1.5">
                        <BookCover book={b} />
                      </div>
                      <p className="mt-3 line-clamp-1 text-sm font-semibold">{b.title}</p>
                      <p className="text-xs text-muted-foreground">{b.category}</p>
                    </button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Resources */}
          {resources.length > 0 && (
            <section>
              <h2 className="mb-5 flex items-center gap-2 font-display text-xl tracking-tight sm:text-2xl">
                <FileText className="h-5 w-5 text-clay" /> Resources
              </h2>
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {resources.map((r, i) => (
                  <motion.div key={r.slug} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5, delay: i * 0.05 }} className="rounded-2xl border border-border/60 bg-card p-5">
                    <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-xl text-xs font-semibold uppercase" style={{ background: `${r.accent}18`, color: r.accent }}>{r.type_label}</div>
                    <p className="text-sm font-semibold">{r.title}</p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{r.description}</p>
                    <button className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-clay hover:underline">Download <ArrowRight className="h-3 w-3" /></button>
                  </motion.div>
                ))}
              </div>
            </section>
          )}

          {/* Bookmarks placeholder */}
          <section>
            <h2 className="mb-5 flex items-center gap-2 font-display text-xl tracking-tight sm:text-2xl">
              <Bookmark className="h-5 w-5 text-clay" /> Saved bookmarks & highlights
            </h2>
            <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              Your bookmarks and highlights are saved inside each book in the reader. Open a book to view them.
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
