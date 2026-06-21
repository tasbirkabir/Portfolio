"use client";

import { useState, useEffect, useRef, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  X, ChevronLeft, ChevronRight, Bookmark, BookmarkCheck, Highlighter,
  Type, Sun, Moon, Search, List, BookOpen, BarChart3, StickyNote,
  Trash2, Minus, Plus, Check, Maximize, Lock, ArrowUpRight, Star, Shield,
} from "lucide-react";
import { useData } from "@/hooks/use-data";
import { useNav } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";
import { CheckoutModal } from "@/components/platform/checkout-modal";
import { cn } from "@/lib/utils";

type Section = { heading: string; body: string[] };
type Chapter = { id: string; title: string; sections: Section[] };

type Highlight = {
  id: string;
  chapterId: string;
  sectionIndex: number;
  paraIndex: number;
  text: string;
  note?: string;
  createdAt: number;
};

type BookmarkT = { id: string; chapterId: string; chapterTitle: string; createdAt: number };

const WPM = 220;

export function EbookReader({ slug }: { slug: string }) {
  const { data, loading } = useData<{ book: any }>(`/api/books/${slug}`);
  const closeReader = useNav((s) => s.closeReader);
  const navigate = useNav((s) => s.navigate);
  const { toast } = useToast();
  const user = useAuth((s) => s.user);

  // Access control — determines whether the user gets the full book or the free preview.
  // In dev (with server): fetches /api/auth/access. In static mode: checks localStorage.
  const [staticAccess, setStaticAccess] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      const owned = JSON.parse(localStorage.getItem("tk-owned-books") || "[]");
      setStaticAccess(owned.includes(slug));
    } catch {}
  }, [slug]);

  const { data: accessData, refetch: refetchAccess } = useData<{ access: boolean; reason: string; accessType: string }>(
    `/api/auth/access?type=book&slug=${slug}`
  );
  const hasFullAccess = !!accessData?.access || staticAccess;
  const [paywallOpen, setPaywallOpen] = useState(false);
  const [showPreviewLockMsg, setShowPreviewLockMsg] = useState(false);

  const book = data?.book;
  const chapters: Chapter[] = useMemo(() => {
    const c = book?.content;
    if (Array.isArray(c)) return c as Chapter[];
    if (typeof c === "string") {
      try {
        const parsed = JSON.parse(c);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  }, [book]);

  // Preview = first 3 chapters free (or 20% of the book, whichever is more)
  const previewLimitIndex = Math.max(2, Math.ceil(chapters.length * 0.2) - 1);

  const [chapterIndex, setChapterIndex] = useState(0);
  const [chapterScrollRatio, setChapterScrollRatio] = useState(0);
  const [fontSize, setFontSize] = useState(18);
  const [fontFamily, setFontFamily] = useState<"serif" | "sans">("serif");
  const [readerMode, setReaderMode] = useState<"light" | "dark" | "sepia">("light");
  const [fullscreen, setFullscreen] = useState(false);
  const [islandOpen, setIslandOpen] = useState(false);
  const [islandTab, setIslandTab] = useState<"contents" | "bookmarks" | "highlights" | "stats">("contents");
  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  // persistent state
  const [bookmarks, setBookmarks] = useState<BookmarkT[]>([]);
  const [highlights, setHighlights] = useState<Highlight[]>([]);
  const [sessionStart] = useState(() => Date.now());
  const [sessionSeconds, setSessionSeconds] = useState(0);

  const scrollRef = useRef<HTMLDivElement>(null);
  const [selRect, setSelRect] = useState<{ x: number; y: number } | null>(null);
  const [selInfo, setSelInfo] = useState<{ chapterId: string; sectionIndex: number; paraIndex: number; text: string } | null>(null);

  const lsKey = `tk-reader-${slug}`;

  // Load persistent state
  useEffect(() => {
    if (!book) return;
    try {
      const raw = localStorage.getItem(lsKey);
      if (raw) {
        const s = JSON.parse(raw);
        if (typeof s.chapterIndex === "number" && s.chapterIndex < chapters.length) {
          setChapterIndex(s.chapterIndex);
        }
        if (Array.isArray(s.bookmarks)) setBookmarks(s.bookmarks);
        if (Array.isArray(s.highlights)) setHighlights(s.highlights);
        if (typeof s.fontSize === "number") setFontSize(s.fontSize);
        if (s.fontFamily) setFontFamily(s.fontFamily);
        if (s.readerMode) setReaderMode(s.readerMode);
      }
    } catch {}
  }, [book, chapters.length, lsKey]);

  // Persist state
  useEffect(() => {
    if (!book) return;
    try {
      localStorage.setItem(
        lsKey,
        JSON.stringify({ chapterIndex, bookmarks, highlights, fontSize, fontFamily, readerMode })
      );
    } catch {}
  }, [chapterIndex, bookmarks, highlights, fontSize, fontFamily, readerMode, book, lsKey]);

  // Session timer
  useEffect(() => {
    const t = setInterval(() => setSessionSeconds((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  // Lock body scroll while reader open
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = prev;
    };
  }, []);

  // Fullscreen toggle
  useEffect(() => {
    if (!fullscreen) {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
      return;
    }
    const el = document.documentElement;
    el.requestFullscreen?.().catch(() => {});
    return () => {
      if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    };
  }, [fullscreen]);

  // Track book view analytics (admin only — avoids 401 errors for logged-out users)
  useEffect(() => {
    if (!book || !user) return;
    fetch("/api/analytics", { method: "GET" }).catch(() => {});
  }, [book, user]);

  const goNext = useCallback(() => {
    // Preview gate: block navigation beyond the free preview for non-purchasers.
    if (!hasFullAccess && chapterIndex >= previewLimitIndex) {
      setPaywallOpen(true);
      return;
    }
    setChapterIndex((i) => Math.min(i + 1, chapters.length - 1));
  }, [chapters.length, hasFullAccess, chapterIndex, previewLimitIndex]);
  const goPrev = useCallback(() => {
    setChapterIndex((i) => Math.max(i - 1, 0));
  }, []);

  // Esc to close
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (islandOpen) setIslandOpen(false);
        else if (searchOpen) setSearchOpen(false);
        else closeReader();
      }
      if (e.key === "ArrowRight" && !islandOpen) goNext();
      if (e.key === "ArrowLeft" && !islandOpen) goPrev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [islandOpen, searchOpen, goNext, goPrev]);

  // Scroll handler → chapter progress
  const onScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    const max = el.scrollHeight - el.clientHeight;
    setChapterScrollRatio(max > 0 ? Math.min(1, Math.max(0, el.scrollTop / max)) : 0);
  }, []);

  // Reset scroll on chapter change
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = 0;
    setChapterScrollRatio(0);
  }, [chapterIndex]);

  const currentChapter = chapters[chapterIndex];

  // Preview-gating derived values (computed after chapterIndex is known)
  const isPreviewChapter = !hasFullAccess && chapterIndex <= previewLimitIndex;
  const reachedPreviewEnd = !hasFullAccess && chapterIndex >= previewLimitIndex;

  // Total words & overall progress
  const totalWords = useMemo(() => {
    return chapters.reduce(
      (acc, c) => acc + c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0),
      0
    );
  }, [chapters]);

  const overallProgress = useMemo(() => {
    if (chapters.length === 0) return 0;
    return ((chapterIndex + chapterScrollRatio) / chapters.length) * 100;
  }, [chapterIndex, chapterScrollRatio, chapters.length]);

  const totalMinutes = totalWords / WPM;
  const minutesRemaining = Math.max(0, Math.round(totalMinutes * (1 - overallProgress / 100)));

  // Sync reading progress to server for logged-in users (debounced)
  useEffect(() => {
    if (!book || !user) return;
    const t = setTimeout(() => {
      fetch("/api/progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookSlug: book.slug, chapterIndex, progress: overallProgress }),
      }).catch(() => {});
    }, 1500);
    return () => clearTimeout(t);
  }, [book, user, chapterIndex, overallProgress]);

  // Bookmarks
  const isBookmarked = bookmarks.some((b) => b.chapterId === currentChapter?.id);
  function toggleBookmark() {
    if (!currentChapter) return;
    if (isBookmarked) {
      setBookmarks((bs) => bs.filter((b) => b.chapterId !== currentChapter.id));
      toast({ title: "Bookmark removed" });
    } else {
      setBookmarks((bs) => [...bs, { id: crypto.randomUUID(), chapterId: currentChapter.id, chapterTitle: currentChapter.title, createdAt: Date.now() }]);
      toast({ title: "Bookmarked", description: currentChapter.title });
    }
  }

  // Highlights: selection toolbar
  useEffect(() => {
    function onSel() {
      const sel = window.getSelection();
      if (!sel || sel.isCollapsed || sel.rangeCount === 0) {
        setSelRect(null);
        setSelInfo(null);
        return;
      }
      const text = sel.toString().trim();
      if (text.length < 2) {
        setSelRect(null);
        setSelInfo(null);
        return;
      }
      const range = sel.getRangeAt(0);
      const node = (range.commonAncestorContainer.nodeType === 3
        ? range.commonAncestorContainer.parentElement
        : range.commonAncestorContainer) as HTMLElement | null;
      const para = node?.closest("[data-para]") as HTMLElement | null;
      if (!para) {
        setSelRect(null);
        setSelInfo(null);
        return;
      }
      const rect = range.getBoundingClientRect();
      setSelRect({ x: rect.left + rect.width / 2, y: rect.top });
      setSelInfo({
        chapterId: para.dataset.chapterId!,
        sectionIndex: Number(para.dataset.sectionIndex),
        paraIndex: Number(para.dataset.paraIndex),
        text,
      });
    }
    document.addEventListener("selectionchange", onSel);
    return () => document.removeEventListener("selectionchange", onSel);
  }, [chapterIndex]);

  function addHighlight(note?: string) {
    if (!selInfo) return;
    const h: Highlight = {
      id: crypto.randomUUID(),
      chapterId: selInfo.chapterId,
      sectionIndex: selInfo.sectionIndex,
      paraIndex: selInfo.paraIndex,
      text: selInfo.text,
      note,
      createdAt: Date.now(),
    };
    setHighlights((hs) => [h, ...hs]);
    window.getSelection()?.removeAllRanges();
    setSelRect(null);
    setSelInfo(null);
    toast({ title: "Highlighted" });
  }

  function removeHighlight(id: string) {
    setHighlights((hs) => hs.filter((h) => h.id !== id));
  }

  // Search
  const searchResults = useMemo(() => {
    if (!query.trim()) return [];
    const q = query.toLowerCase();
    const results: { chapterId: string; chapterTitle: string; snippet: string }[] = [];
    for (const c of chapters) {
      for (const s of c.sections) {
        for (const p of s.body) {
          const idx = p.toLowerCase().indexOf(q);
          if (idx >= 0) {
            const start = Math.max(0, idx - 40);
            const end = Math.min(p.length, idx + q.length + 40);
            results.push({
              chapterId: c.id,
              chapterTitle: c.title,
              snippet: (start > 0 ? "…" : "") + p.slice(start, end) + (end < p.length ? "…" : ""),
            });
            if (results.length >= 30) return results;
          }
        }
      }
    }
    return results;
  }, [query, chapters]);

  function jumpToChapter(chapterId: string) {
    const idx = chapters.findIndex((c) => c.id === chapterId);
    if (idx >= 0) {
      // Preview gate: block jumps to chapters beyond the free preview.
      if (!hasFullAccess && idx > previewLimitIndex) {
        setPaywallOpen(true);
        return;
      }
      setChapterIndex(idx);
      setIslandOpen(false);
    }
  }

  if (loading || !book) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[100] flex items-center justify-center bg-background"
      >
        <div className="text-center">
          <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-foreground/20 border-t-foreground" />
          <p className="mt-4 text-sm text-muted-foreground">Opening your book…</p>
        </div>
      </motion.div>
    );
  }

  const chaptersCompleted = Math.floor(overallProgress / (100 / chapters.length));

  return (
    <AnimatePresence>
      <motion.div
        key="reader-overlay"
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 30 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className={
          "fixed inset-0 z-[100] flex flex-col " +
          (readerMode === "dark" ? "bg-[#1a1714] text-[#e8e2d8]" : readerMode === "sepia" ? "bg-[#f5ecd9] text-[#3a2f1f]" : "bg-background")
        }
        data-reader-mode={readerMode}
      >
        {/* Top progress bar */}
        <div className="absolute inset-x-0 top-0 z-30 h-1 bg-muted">
          <motion.div
            className="h-full bg-clay"
            animate={{ width: `${overallProgress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Top bar */}
        <header className="relative z-20 flex h-14 shrink-0 items-center justify-between border-b border-border/60 px-4 sm:px-6">
          <div className="flex items-center gap-3">
            <button
              onClick={closeReader}
              className="flex h-9 w-9 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
              aria-label="Close reader"
            >
              <X className="h-5 w-5" />
            </button>
            <div className="hidden min-w-0 sm:block">
              <p className="flex items-center gap-2 truncate text-xs font-medium">
                <span className="truncate">{book.title}</span>
                {!hasFullAccess && (
                  <span className="shrink-0 rounded-full bg-clay/15 px-1.5 py-0.5 text-[9px] font-semibold uppercase tracking-wide text-clay">
                    Free Preview
                  </span>
                )}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">by Tasbir Kabir</p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <ReaderIconButton onClick={() => setSearchOpen((v) => !v)} active={searchOpen} label="Search">
              <Search className="h-4 w-4" />
            </ReaderIconButton>
            <div className="hidden items-center gap-0.5 rounded-full border border-border p-0.5 sm:flex">
              <button
                onClick={() => setFontSize((s) => Math.max(14, s - 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                aria-label="Decrease font"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <span className="px-1 text-[10px] tabular-nums text-muted-foreground">{fontSize}</span>
              <button
                onClick={() => setFontSize((s) => Math.min(26, s + 1))}
                className="flex h-7 w-7 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
                aria-label="Increase font"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>
            <ReaderIconButton
              onClick={() => setFontFamily((f) => (f === "serif" ? "sans" : "serif"))}
              label="Font family"
              className="hidden sm:flex"
            >
              <Type className="h-4 w-4" />
            </ReaderIconButton>
            <ReaderIconButton onClick={toggleBookmark} active={isBookmarked} label="Bookmark">
              {isBookmarked ? <BookmarkCheck className="h-4 w-4 text-clay" /> : <Bookmark className="h-4 w-4" />}
            </ReaderIconButton>
            <ReaderIconButton
              onClick={() => setReaderMode((m) => (m === "light" ? "sepia" : m === "sepia" ? "dark" : "light"))}
              label="Reading mode"
            >
              {readerMode === "dark" ? <Sun className="h-4 w-4" /> : readerMode === "sepia" ? <BookOpen className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
            </ReaderIconButton>
            <ReaderIconButton
              onClick={() => setFullscreen((f) => !f)}
              active={fullscreen}
              label="Fullscreen"
              className="hidden sm:flex"
            >
              <Maximize className="h-4 w-4" />
            </ReaderIconButton>
          </div>
        </header>

        {/* Search panel */}
        <AnimatePresence>
          {searchOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: "auto", opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="relative z-10 overflow-hidden border-b border-border/60 bg-muted/40"
            >
              <div className="px-4 py-3 sm:px-6">
                <div className="flex items-center gap-2 rounded-full border border-border bg-background px-4 py-2">
                  <Search className="h-4 w-4 text-muted-foreground" />
                  <input
                    autoFocus
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder="Search this book…"
                    className="flex-1 bg-transparent text-sm focus:outline-none"
                  />
                  {query && (
                    <button onClick={() => setQuery("")} className="text-muted-foreground hover:text-foreground">
                      <X className="h-3.5 w-3.5" />
                    </button>
                  )}
                </div>
                {query && (
                  <div className="mt-3 max-h-60 overflow-y-auto thin-scrollbar">
                    {searchResults.length === 0 ? (
                      <p className="px-2 py-3 text-sm text-muted-foreground">No matches.</p>
                    ) : (
                      <div className="space-y-1">
                        {searchResults.map((r, i) => (
                          <button
                            key={i}
                            onClick={() => jumpToChapter(r.chapterId)}
                            className="block w-full rounded-lg px-3 py-2 text-left transition-colors hover:bg-foreground/5"
                          >
                            <p className="text-[10px] font-medium uppercase tracking-wide text-clay">{r.chapterTitle}</p>
                            <p className="mt-0.5 text-xs text-muted-foreground">{r.snippet}</p>
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reading area */}
        <div ref={scrollRef} onScroll={onScroll} className="relative flex-1 overflow-y-auto thin-scrollbar">
          <div className="mx-auto max-w-2xl px-5 py-10 sm:px-8 sm:py-16">
            {/* Chapter header */}
            <div className="mb-10 border-b border-border/60 pb-8">
              <p className="eyebrow mb-2">
                Chapter {chapterIndex + 1} of {chapters.length}
              </p>
              <h1 className="font-display text-3xl leading-tight tracking-tight sm:text-5xl text-balance">
                {currentChapter?.title}
              </h1>
            </div>

            {/* Chapter content */}
            <div
              className={cn("space-y-8", fontFamily === "serif" ? "font-reader" : "font-sans")}
              style={{ fontSize: `${fontSize}px`, lineHeight: 1.75 }}
            >
              {currentChapter?.sections.map((section, si) => (
                <section key={`sec-${si}`}>
                  <h2 className="mb-4 font-display text-xl tracking-tight sm:text-2xl">{section.heading}</h2>
                  <div className="space-y-5">
                    {section.body.map((para, pi) => (
                      <p
                        key={`para-${si}-${pi}`}
                        data-para
                        data-chapter-id={currentChapter.id}
                        data-section-index={si}
                        data-para-index={pi}
                        className={cn(
                          "text-foreground/85 text-pretty",
                          si === 0 && pi === 0 && "reader-dropcap"
                        )}
                      >
                        {renderParagraphWithHighlights(para, si, pi, currentChapter.id, highlights, (hId) => {
                          const h = highlights.find((x) => x.id === hId);
                          if (h?.note) toast({ title: "Your note", description: h.note });
                          else toast({ title: "Highlight", description: h.text.slice(0, 80) });
                        })}
                      </p>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            {/* Preview paywall — shown when the reader reaches the end of the free preview */}
            {reachedPreviewEnd && (
              <motion.div
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="mt-12 overflow-hidden rounded-3xl border border-clay/30 bg-card shadow-premium"
              >
                <div className="relative p-7 sm:p-9">
                  <div className="pointer-events-none absolute -right-10 -top-10 h-40 w-40 rounded-full bg-clay/15 blur-3xl" />
                  <div className="relative">
                    <div className="inline-flex items-center gap-2 rounded-full bg-clay/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-clay">
                      <Lock className="h-3 w-3" /> Free preview ends here
                    </div>
                    <h3 className="mt-4 font-display text-2xl tracking-tight sm:text-3xl text-balance">
                      You&rsquo;ve read the free {Math.round(((previewLimitIndex + 1) / chapters.length) * 100)}%.
                    </h3>
                    <p className="mt-2 max-w-md font-reader text-base leading-relaxed text-muted-foreground">
                      Unlock all {chapters.length} chapters of <strong className="text-foreground">{book.title}</strong> —
                      plus bookmarks, highlights, and reading progress that syncs across devices.
                    </p>

                    <div className="mt-5 flex flex-wrap items-center gap-4">
                      <span className="font-display text-4xl tracking-tight">${book.price}</span>
                      {book.originalPrice && (
                        <span className="text-lg text-muted-foreground line-through">${book.originalPrice}</span>
                      )}
                      {book.originalPrice && (
                        <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-medium text-clay">
                          Save {Math.round((1 - book.price / book.originalPrice) * 100)}%
                        </span>
                      )}
                      <span className="flex items-center gap-1 text-sm text-muted-foreground">
                        <Star className="h-3.5 w-3.5 fill-clay text-clay" />
                        {book.rating} · {book.reviewsCount} reviews
                      </span>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3">
                      <button
                        onClick={() => setPaywallOpen(true)}
                        className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
                      >
                        <Lock className="h-4 w-4" />
                        Unlock the full book
                        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </button>
                      <button
                        onClick={() => { closeReader(); navigate("book", { bookSlug: book.slug }); }}
                        className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                      >
                        View details
                      </button>
                    </div>

                    <p className="mt-4 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Shield className="h-3 w-3" />
                      One-time payment · Instant access · 30-day refund
                    </p>
                  </div>
                </div>
              </motion.div>
            )}

            {/* Chapter nav */}
            <div className="mt-16 flex items-center justify-between border-t border-border/60 pt-8">
              <button
                onClick={goPrev}
                disabled={chapterIndex === 0}
                className="inline-flex items-center gap-2 rounded-full border border-border px-5 py-2.5 text-sm transition-all hover:bg-foreground/5 disabled:opacity-40 disabled:hover:bg-transparent"
              >
                <ChevronLeft className="h-4 w-4" /> Previous
              </button>
              <span className="text-xs text-muted-foreground">
                {chapterIndex + 1} / {chapters.length}
              </span>
              <button
                onClick={goNext}
                disabled={hasFullAccess ? chapterIndex === chapters.length - 1 : reachedPreviewEnd}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm text-background transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-40 disabled:hover:scale-100"
              >
                {reachedPreviewEnd ? <Lock className="h-4 w-4" /> : null}
                {reachedPreviewEnd ? "Unlock" : "Next"} <ChevronRight className="h-4 w-4" />
              </button>
            </div>

            {/* End of book */}
            {chapterIndex === chapters.length - 1 && chapterScrollRatio > 0.85 && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-10 rounded-3xl border border-border/60 bg-muted/30 p-8 text-center"
              >
                <p className="font-display text-2xl tracking-tight">You finished the book.</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Time spent this session: {formatTime(sessionSeconds)}
                </p>
                <button
                  onClick={closeReader}
                  className="mt-5 inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3 text-sm font-medium text-background"
                >
                  Back to the library
                </button>
              </motion.div>
            )}
          </div>
        </div>

        {/* Selection toolbar */}
        <AnimatePresence>
          {selRect && (
            <motion.div
              initial={{ opacity: 0, y: 8, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 8, scale: 0.9 }}
              style={{
                left: selRect.x,
                top: selRect.y - 12,
                transform: "translate(-50%, -100%)",
              }}
              className="fixed z-[120] flex items-center gap-1 rounded-full border border-border bg-background p-1 shadow-float"
            >
              <button
                onClick={() => addHighlight()}
                className="flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium transition-colors hover:bg-foreground/5"
              >
                <Highlighter className="h-3.5 w-3.5 text-clay" /> Highlight
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Reader Dynamic Island */}
        <ReaderIsland
          chapterTitle={currentChapter?.title || ""}
          chapterIndex={chapterIndex}
          totalChapters={chapters.length}
          progress={overallProgress}
          minutesRemaining={minutesRemaining}
          open={islandOpen}
          setOpen={setIslandOpen}
          tab={islandTab}
          setTab={setIslandTab}
          chapters={chapters}
          currentChapterId={currentChapter?.id || ""}
          hasFullAccess={hasFullAccess}
          previewLimitIndex={previewLimitIndex}
          onJump={jumpToChapter}
          bookmarks={bookmarks}
          onRemoveBookmark={(id) => setBookmarks((bs) => bs.filter((b) => b.id !== id))}
          highlights={highlights}
          onRemoveHighlight={removeHighlight}
          stats={{
            sessionSeconds,
            chaptersCompleted,
            totalChapters: chapters.length,
            progress: overallProgress,
            totalMinutes: Math.round(totalMinutes),
            totalWords,
            highlightCount: highlights.length,
            bookmarkCount: bookmarks.length,
          }}
        />
      </motion.div>

      {/* Preview paywall checkout — opens when the reader hits the preview limit */}
      <CheckoutModal
        key="checkout-modal"
        open={paywallOpen}
        items={book ? [{ slug: book.slug, title: book.title, type: "book" as const, price: book.price }] : []}
        onClose={() => setPaywallOpen(false)}
        onSuccess={() => {
          setPaywallOpen(false);
          // Refresh access so the reader unlocks the full book immediately.
          refetchAccess();
          toast({ title: "Book unlocked!", description: "Enjoy the full read." });
        }}
      />
    </AnimatePresence>
  );
}

/* ---------------- Helpers ---------------- */

function ReaderIconButton({
  children,
  onClick,
  active,
  label,
  className,
}: {
  children: React.ReactNode;
  onClick: () => void;
  active?: boolean;
  label: string;
  className?: string;
}) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-full transition-colors hover:bg-foreground/5",
        active ? "bg-foreground/5 text-foreground" : "text-muted-foreground hover:text-foreground",
        className
      )}
    >
      {children}
    </button>
  );
}

function renderParagraphWithHighlights(
  text: string,
  sectionIndex: number,
  paraIndex: number,
  chapterId: string,
  highlights: Highlight[],
  onClick: (id: string) => void
) {
  const matching = highlights.filter(
    (h) => h.chapterId === chapterId && h.sectionIndex === sectionIndex && h.paraIndex === paraIndex
  );
  if (matching.length === 0) return text;

  // Build a list of {start, end, id} by finding each highlight text in the paragraph
  type Range = { start: number; end: number; id: string };
  const ranges: Range[] = [];
  const used = new Set<string>();
  for (const h of matching) {
    if (used.has(h.text)) continue;
    const idx = text.indexOf(h.text);
    if (idx >= 0) {
      ranges.push({ start: idx, end: idx + h.text.length, id: h.id });
      used.add(h.text);
    }
  }
  if (ranges.length === 0) return text;
  ranges.sort((a, b) => a.start - b.start);

  const nodes: React.ReactNode[] = [];
  let cursor = 0;
  let nodeIdx = 0;
  for (const r of ranges) {
    if (r.start < cursor) continue; // overlap skip
    if (r.start > cursor) {
      nodes.push(<span key={`t-${nodeIdx++}`}>{text.slice(cursor, r.start)}</span>);
    }
    nodes.push(
      <mark
        key={`h-${r.id}`}
        className="reader-highlight"
        onClick={(e) => {
          e.stopPropagation();
          onClick(r.id);
        }}
      >
        {text.slice(r.start, r.end)}
      </mark>
    );
    cursor = r.end;
  }
  if (cursor < text.length) nodes.push(<span key={`t-${nodeIdx++}`}>{text.slice(cursor)}</span>);
  return nodes;
}

function formatTime(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}m ${sec}s`;
}

/* ---------------- Reader Dynamic Island ---------------- */

function ReaderIsland(props: {
  chapterTitle: string;
  chapterIndex: number;
  totalChapters: number;
  progress: number;
  minutesRemaining: number;
  open: boolean;
  setOpen: (v: boolean) => void;
  tab: "contents" | "bookmarks" | "highlights" | "stats";
  setTab: (t: "contents" | "bookmarks" | "highlights" | "stats") => void;
  chapters: Chapter[];
  currentChapterId: string;
  hasFullAccess: boolean;
  previewLimitIndex: number;
  onJump: (id: string) => void;
  bookmarks: BookmarkT[];
  onRemoveBookmark: (id: string) => void;
  highlights: Highlight[];
  onRemoveHighlight: (id: string) => void;
  stats: {
    sessionSeconds: number;
    chaptersCompleted: number;
    totalChapters: number;
    progress: number;
    totalMinutes: number;
    totalWords: number;
    highlightCount: number;
    bookmarkCount: number;
  };
}) {
  const {
    chapterTitle, progress, minutesRemaining, open, setOpen, tab, setTab,
    chapters, currentChapterId, hasFullAccess, previewLimitIndex, onJump, bookmarks, onRemoveBookmark,
    highlights, onRemoveHighlight, stats,
  } = props;

  const transition = { type: "tween" as const, ease: [0.22, 1, 0.36, 1] as const, duration: 0.5 };

  const tabs = [
    { id: "contents" as const, label: "Contents", icon: List },
    { id: "bookmarks" as const, label: "Marks", icon: Bookmark },
    { id: "highlights" as const, label: "Notes", icon: Highlighter },
    { id: "stats" as const, label: "Stats", icon: BarChart3 },
  ];

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={transition}
            className="fixed inset-0 z-[110] bg-black/20 backdrop-blur-[4px]"
            onClick={() => setOpen(false)}
          />
        )}
      </AnimatePresence>

      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 25 }}
        className="fixed bottom-[88px] left-1/2 z-[115] flex -translate-x-1/2 flex-col items-center sm:bottom-8"
      >
        <motion.div
          onClick={() => { if (!open) setOpen(true); }}
          initial={false}
          animate={{
            width: open ? 360 : 300,
            height: open ? 460 : 54,
            borderRadius: open ? 24 : 27,
          }}
          transition={transition}
          style={{ cursor: open ? "default" : "pointer" }}
          className="relative overflow-hidden border border-border/60 bg-background text-foreground shadow-2xl"
        >
          {/* COLLAPSED */}
          <motion.div
            initial={false}
            animate={{
              opacity: open ? 0 : 1,
              scale: open ? 0.95 : 1,
              filter: open ? "blur(4px)" : "blur(0px)",
            }}
            transition={{ ...transition, delay: open ? 0 : 0.1 }}
            className={cn("absolute inset-0 flex items-center gap-3 px-4", open && "pointer-events-none")}
          >
            <ProgressRing percentage={progress} />
            <div className="flex h-full flex-1 flex-col justify-center overflow-hidden">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.span
                  key={chapterTitle}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -12 }}
                  transition={{ duration: 0.3 }}
                  className="block w-full overflow-hidden text-ellipsis whitespace-nowrap text-xs font-medium"
                >
                  {chapterTitle}
                </motion.span>
              </AnimatePresence>
              <span className="text-[10px] text-muted-foreground">
                {Math.round(progress)}% · {minutesRemaining}m left
              </span>
            </div>
            <BookOpen className="h-4 w-4 shrink-0 text-muted-foreground" />
          </motion.div>

          {/* EXPANDED */}
          <motion.div
            initial={false}
            animate={{ opacity: open ? 1 : 0, scale: open ? 1 : 1.05 }}
            transition={{ ...transition, delay: open ? 0.1 : 0 }}
            className={cn("absolute inset-0 flex flex-col", !open && "pointer-events-none")}
          >
            {/* Header */}
            <div className="flex shrink-0 items-center justify-between px-5 pb-2 pt-4">
              <span className="text-[11px] font-semibold tracking-[0.08em] text-muted-foreground">READING ASSISTANT</span>
              <button
                onClick={(e) => { e.stopPropagation(); setOpen(false); }}
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Tabs */}
            <div className="flex shrink-0 gap-1 px-3 pb-2">
              {tabs.map((t) => {
                const Icon = t.icon;
                const active = tab === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={(e) => { e.stopPropagation(); setTab(t.id); }}
                    className={cn(
                      "flex flex-1 items-center justify-center gap-1.5 rounded-lg py-2 text-[11px] font-medium transition-colors",
                      active ? "bg-foreground text-background" : "text-muted-foreground hover:bg-foreground/5"
                    )}
                  >
                    <Icon className="h-3.5 w-3.5" />
                    {t.label}
                  </button>
                );
              })}
            </div>

            {/* Body */}
            <div className="thin-scrollbar flex-1 overflow-y-auto px-3 pb-4">
              {tab === "contents" && (
                <div className="flex flex-col gap-0.5">
                  {chapters.map((c, i) => {
                    const active = c.id === currentChapterId;
                    const locked = !hasFullAccess && i > previewLimitIndex;
                    return (
                      <button
                        key={c.id}
                        onClick={(e) => { e.stopPropagation(); onJump(c.id); }}
                        className={cn(
                          "flex items-center gap-3 rounded-lg px-3 py-2.5 text-left text-xs transition-colors",
                          active ? "bg-clay/10 font-medium" : locked ? "text-muted-foreground/40" : "text-muted-foreground hover:bg-foreground/5"
                        )}
                      >
                        <span className={cn("font-display text-sm", active ? "text-clay" : "text-muted-foreground/60")}>
                          {String(i + 1).padStart(2, "0")}
                        </span>
                        <span className={cn("flex-1 truncate", locked && "blur-[2px]")}>{c.title}</span>
                        {locked ? (
                          <Lock className="h-3.5 w-3.5 shrink-0 text-muted-foreground/50" />
                        ) : active ? (
                          <Check className="h-3.5 w-3.5 text-clay" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              )}

              {tab === "bookmarks" && (
                <div className="flex flex-col gap-1">
                  {bookmarks.length === 0 ? (
                    <EmptyState icon={Bookmark} text="No bookmarks yet. Tap the bookmark icon to save a chapter." />
                  ) : (
                    bookmarks.map((b) => (
                      <div key={b.id} className="group flex items-center gap-2 rounded-lg px-3 py-2 hover:bg-foreground/5">
                        <Bookmark className="h-3.5 w-3.5 shrink-0 text-clay" />
                        <button
                          onClick={(e) => { e.stopPropagation(); onJump(b.chapterId); }}
                          className="flex-1 truncate text-left text-xs"
                        >
                          {b.chapterTitle}
                        </button>
                        <button
                          onClick={(e) => { e.stopPropagation(); onRemoveBookmark(b.id); }}
                          className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "highlights" && (
                <div className="flex flex-col gap-2">
                  {highlights.length === 0 ? (
                    <EmptyState icon={Highlighter} text="Select text while reading to highlight it." />
                  ) : (
                    highlights.map((h) => (
                      <div key={h.id} className="group rounded-lg border border-border/50 bg-muted/30 p-3">
                        <p className="text-xs italic leading-relaxed text-foreground/80">&ldquo;{h.text}&rdquo;</p>
                        {h.note && <p className="mt-1.5 text-[11px] text-muted-foreground">📝 {h.note}</p>}
                        <div className="mt-2 flex items-center justify-between">
                          <button
                            onClick={(e) => { e.stopPropagation(); onJump(h.chapterId); }}
                            className="text-[10px] font-medium text-clay hover:underline"
                          >
                            Jump to →
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); onRemoveHighlight(h.id); }}
                            className="text-muted-foreground opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                          >
                            <Trash2 className="h-3 w-3" />
                          </button>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {tab === "stats" && (
                <div className="space-y-3 p-1">
                  <StatRow label="Time in session" value={formatTime(stats.sessionSeconds)} />
                  <StatRow label="Chapters completed" value={`${stats.chaptersCompleted} / ${stats.totalChapters}`} />
                  <StatRow label="Progress" value={`${Math.round(stats.progress)}%`} />
                  <StatRow label="Estimated total" value={`${stats.totalMinutes} min`} />
                  <StatRow label="Word count" value={stats.totalWords.toLocaleString()} />
                  <StatRow label="Highlights" value={String(stats.highlightCount)} />
                  <StatRow label="Bookmarks" value={String(stats.bookmarkCount)} />
                  <div className="mt-4">
                    <div className="mb-1 flex items-center justify-between text-[10px] text-muted-foreground">
                      <span>Overall progress</span>
                      <span>{Math.round(stats.progress)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-muted">
                      <motion.div
                        className="h-full rounded-full bg-clay"
                        animate={{ width: `${stats.progress}%` }}
                        transition={{ duration: 0.4 }}
                      />
                    </div>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      </motion.div>
    </>
  );
}

function ProgressRing({ percentage }: { percentage: number }) {
  const size = 28;
  const strokeWidth = 2.5;
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percentage / 100) * circumference;
  return (
    <svg width={size} height={size} className="-rotate-90 shrink-0">
      <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="var(--muted)" strokeWidth={strokeWidth} />
      <motion.circle
        cx={size / 2}
        cy={size / 2}
        r={radius}
        fill="none"
        stroke="var(--clay)"
        strokeWidth={strokeWidth}
        strokeDasharray={circumference}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 0.2 }}
        strokeLinecap="round"
      />
    </svg>
  );
}

function StatRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/30 px-3 py-2.5">
      <span className="text-[11px] text-muted-foreground">{label}</span>
      <span className="font-display text-sm tabular-nums">{value}</span>
    </div>
  );
}

function EmptyState({ icon: Icon, text }: { icon: typeof Bookmark; text: string }) {
  return (
    <div className="flex flex-col items-center gap-2 px-4 py-8 text-center">
      <Icon className="h-6 w-6 text-muted-foreground/40" />
      <p className="text-[11px] leading-relaxed text-muted-foreground">{text}</p>
    </div>
  );
}
