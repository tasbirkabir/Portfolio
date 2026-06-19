"use client";

import { useState, useEffect } from "react";
import { motion } from "motion/react";
import { Search as SearchIcon, ArrowUpRight, BookOpen, FileText, Newspaper } from "lucide-react";
import { useNav } from "@/lib/store/nav";
import { BookCover } from "@/components/site/book-cover";

export function SearchView() {
  const navigate = useNav((s) => s.navigate);
  const [q, setQ] = useState("");
  const [results, setResults] = useState<{ books: any[]; posts: any[]; resources: any[] } | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!q.trim()) { setResults(null); return; }
    const t = setTimeout(async () => {
      setLoading(true);
      try {
        const r = await fetch(`/api/search?q=${encodeURIComponent(q)}`);
        const j = await r.json();
        setResults(j);
      } finally { setLoading(false); }
    }, 250);
    return () => clearTimeout(t);
  }, [q]);

  const total = (results?.books.length || 0) + (results?.posts.length || 0) + (results?.resources.length || 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-8">
        <p className="eyebrow mb-3">Search</p>
        <h1 className="font-display text-[clamp(2.2rem,5vw,4rem)] leading-[0.98] tracking-tight">Find anything</h1>
      </motion.div>

      <div className="flex items-center gap-3 rounded-full border border-border bg-card px-5 py-4 shadow-premium focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/30">
        <SearchIcon className="h-5 w-5 text-muted-foreground" />
        <input
          autoFocus
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search books, articles, resources…"
          className="flex-1 bg-transparent text-base focus:outline-none"
        />
        {q && <button onClick={() => setQ("")} className="text-xs text-muted-foreground hover:text-foreground">Clear</button>}
      </div>

      {loading && <p className="mt-6 text-sm text-muted-foreground">Searching…</p>}

      {results && !loading && (
        <div className="mt-8">
          {total === 0 ? (
            <p className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
              No results for "{q}".
            </p>
          ) : (
            <div className="space-y-10">
              {results.books.length > 0 && (
                <Section icon={BookOpen} title="Books">
                  <div className="grid gap-4 sm:grid-cols-2">
                    {results.books.map((b) => (
                      <button key={b.slug} onClick={() => navigate("book", { bookSlug: b.slug })} className="group flex gap-4 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium">
                        <div className="w-14 shrink-0"><BookCover book={b} showBadge={false} /></div>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{b.title}</p>
                          <p className="line-clamp-2 text-xs text-muted-foreground">{b.subtitle}</p>
                          <p className="mt-1 text-xs text-clay">${b.price}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}
              {results.posts.length > 0 && (
                <Section icon={Newspaper} title="Articles">
                  <div className="space-y-2">
                    {results.posts.map((p) => (
                      <button key={p.slug} onClick={() => navigate("post", { postSlug: p.slug })} className="group flex w-full items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:bg-foreground/[0.02]">
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{p.title}</p>
                          <p className="line-clamp-1 text-xs text-muted-foreground">{p.excerpt}</p>
                        </div>
                        <span className="shrink-0 rounded-full bg-muted px-2 py-0.5 text-[10px] text-muted-foreground">{p.readTime}m</span>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}
              {results.resources.length > 0 && (
                <Section icon={FileText} title="Resources">
                  <div className="grid gap-3 sm:grid-cols-2">
                    {results.resources.map((r) => (
                      <button key={r.slug} onClick={() => navigate("resources")} className="group flex items-center gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium">
                        <span className="flex h-9 w-9 items-center justify-center rounded-lg text-xs font-semibold uppercase" style={{ background: `${r.accent}18`, color: r.accent }}>{r.type.slice(0, 2)}</span>
                        <div className="min-w-0 flex-1">
                          <p className="line-clamp-1 text-sm font-semibold">{r.title}</p>
                          <p className="text-xs text-muted-foreground">{r.type} · {r.accessType}</p>
                        </div>
                        <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                      </button>
                    ))}
                  </div>
                </Section>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: typeof BookOpen; title: string; children: React.ReactNode }) {
  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 font-display text-lg tracking-tight"><Icon className="h-4 w-4 text-clay" /> {title}</h2>
      {children}
    </section>
  );
}
