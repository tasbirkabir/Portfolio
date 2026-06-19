"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Star, BookOpen, Rocket, Globe, Workflow, ThumbsUp, Check } from "lucide-react";
import { useNav } from "@/lib/store/nav";
import { useData } from "@/hooks/use-data";
import { BookCover } from "@/components/site/book-cover";
import { BookShelf, SectionHeader } from "@/components/site/shelf";
import { NewsletterBand } from "@/components/site/newsletter-band";
import type { BookLite } from "@/components/site/book-card";

const STATS = [
  { icon: Rocket, value: "60+", label: "Projects completed" },
  { icon: Globe, value: "100+", label: "Websites built" },
  { icon: Workflow, value: "15+", label: "Workflows created" },
  { icon: ThumbsUp, value: "98%", label: "Client satisfaction" },
];

export function HomeView() {
  const navigate = useNav((s) => s.navigate);
  const { data: featuredData } = useData<{ books: any[] }>("/api/books?featured=1");
  const { data: resData } = useData<{ resources: any[] }>("/api/resources");
  const { data: testiData } = useData<{ testimonials: any[] }>("/api/testimonials");
  const { data: allBooksData } = useData<{ books: BookLite[] }>("/api/books");

  const featured = featuredData?.books?.[0];
  const resources = resData?.resources?.slice(0, 6) ?? [];
  const testimonials = testiData?.testimonials ?? [];
  const allBooks = allBooksData?.books ?? [];

  return (
    <div>
      {/* ============ HERO ============ */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-60 [mask-image:radial-gradient(70%_60%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 pb-16 pt-16 sm:px-8 sm:pt-24">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-12">
            {/* Text */}
            <div className="lg:col-span-7">
              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background/60 px-3 py-1 text-xs font-medium text-muted-foreground backdrop-blur"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-clay" />
                AI Consultant · Web Developer · Media Buyer — Dhaka, Bangladesh
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
                className="mt-5 font-display text-[clamp(2.6rem,7vw,5.5rem)] leading-[0.95] tracking-[-0.02em] text-balance"
              >
                I build the
                <br />
                future.{" "}
                <span className="relative inline-block">
                  <span className="italic text-clay">Digital systems.</span>
                  <motion.svg
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: 1 }}
                    transition={{ duration: 1, delay: 0.6 }}
                    viewBox="0 0 200 12"
                    className="absolute -bottom-2 left-0 h-2 w-full text-clay"
                    fill="none"
                  >
                    <motion.path d="M2 8 Q 100 2 198 7" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  </motion.svg>
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.15 }}
                className="mt-7 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground text-pretty sm:text-xl"
              >
                Hey, I&rsquo;m Tasbir. I build AI agents, automation systems, and high-performing
                websites that help businesses save time, generate leads, and scale faster —
                from intelligent workflows to conversion-focused web experiences.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.25 }}
                className="mt-8 flex flex-wrap items-center gap-3"
              >
                <button
                  onClick={() => navigate("books")}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
                >
                  Explore the books
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => navigate("blog")}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  Read the blog
                </button>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.7, delay: 0.4 }}
                className="mt-8 flex items-center gap-3 text-sm text-muted-foreground"
              >
                <div className="flex -space-x-2">
                  {["#1a1a1a", "#b45309", "#0f766e", "#7c2d12"].map((c) => (
                    <span key={c} className="h-7 w-7 rounded-full border-2 border-background" style={{ background: c }} />
                  ))}
                </div>
                <span>
                  <span className="font-semibold text-foreground">60+ projects</span> delivered across web · AI · automation
                </span>
              </motion.div>
            </div>

            {/* Portrait */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.9, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="relative lg:col-span-5"
            >
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-clay/10 blur-2xl" />
                <div className="relative overflow-hidden rounded-[1.75rem] shadow-premium ring-1 ring-black/5">
                  <img
                    src="/images/logo.png"
                    alt="Tasbir Kabir"
                    className="aspect-square w-full object-cover"
                  />
                </div>

                {/* Floating stat card */}
                <motion.div
                  initial={{ opacity: 0, x: 20, y: 20 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.6 }}
                  className="absolute -bottom-5 -left-5 hidden rounded-2xl border border-border bg-background/90 p-4 shadow-float backdrop-blur sm:block"
                >
                  <div className="flex items-center gap-2">
                    <ThumbsUp className="h-4 w-4 text-clay" />
                    <span className="font-display text-2xl">98%</span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">client satisfaction</p>
                </motion.div>

                {/* Floating tagline chip */}
                <motion.div
                  initial={{ opacity: 0, x: -20, y: -10 }}
                  animate={{ opacity: 1, x: 0, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.7 }}
                  className="absolute -right-3 top-6 hidden rounded-full bg-foreground px-3 py-1.5 text-xs font-medium text-background shadow-float sm:block"
                >
                  Build · Automate · Scale
                </motion.div>
              </div>
            </motion.div>
          </div>

          {/* Stats row */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.5 }}
            className="mt-16 grid grid-cols-2 gap-4 border-t border-border/60 pt-8 sm:mt-20 sm:grid-cols-4"
          >
            {STATS.map((s) => (
              <div key={s.label} className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <s.icon className="h-4 w-4 text-clay" />
                  <span className="font-display text-3xl tracking-tight">{s.value}</span>
                </div>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ============ FEATURED EBOOK ============ */}
      {featured && (
        <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
            <div className="relative mx-auto max-w-sm lg:mx-0">
              <div className="absolute -inset-6 -z-10 rounded-3xl bg-clay/10 blur-3xl" />
              <motion.div
                initial={{ opacity: 0, y: 24, rotateY: -12 }}
                whileInView={{ opacity: 1, y: 0, rotateY: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
                style={{ perspective: 1200 }}
              >
                <div className="transition-transform duration-700 hover:-translate-y-2 hover:rotate-[-1deg]">
                  <BookCover book={featured} className="w-full max-w-[280px]" />
                </div>
              </motion.div>
            </div>

            <div>
              <p className="eyebrow mb-3">Featured ebook</p>
              <h2 className="font-display text-4xl leading-[1.05] tracking-tight sm:text-5xl">{featured.title}</h2>
              <p className="mt-4 font-reader text-lg leading-relaxed text-muted-foreground">{featured.subtitle}</p>

              <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
                <span className="font-display text-3xl">${featured.price}</span>
                {featured.originalPrice && (
                  <span className="text-muted-foreground line-through">${featured.originalPrice}</span>
                )}
                <span className="rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay">
                  Save {Math.round((1 - featured.price / featured.originalPrice) * 100)}%
                </span>
                <span className="flex items-center gap-1 text-muted-foreground">
                  <Star className="h-3.5 w-3.5 fill-clay text-clay" />
                  {featured.rating} · {featured.reviewsCount} reviews
                </span>
              </div>

              <ul className="mt-6 space-y-2.5">
                {[
                  `${featured.pages} pages of frameworks, not fluff`,
                  "Built-in premium ebook reader",
                  "Every template & checklist included",
                  "30-day no-questions refund",
                ].map((b) => (
                  <li key={b} className="flex items-start gap-2.5 text-sm">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    <span className="text-foreground/80">{b}</span>
                  </li>
                ))}
              </ul>

              <div className="mt-8 flex flex-wrap gap-3">
                <button
                  onClick={() => navigate("book", { bookSlug: featured.slug })}
                  className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
                >
                  View details
                  <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </button>
                <button
                  onClick={() => useNav.getState().openReader(featured.slug)}
                  className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                >
                  <BookOpen className="h-4 w-4" />
                  Read preview
                </button>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* ============ LATEST BOOKS ============ */}
      {allBooks.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <SectionHeader
            eyebrow="The library"
            title="All books & playbooks"
            action="See all"
            onAction={() => navigate("books")}
          />
          <BookShelf books={allBooks} />
        </section>
      )}

      {/* ============ SOCIAL PROOF ============ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <div className="mb-10 text-center">
          <p className="eyebrow mb-2">Loved by clients</p>
          <h2 className="mx-auto max-w-2xl font-display text-3xl tracking-tight sm:text-4xl text-balance">
            What clients say about the work
          </h2>
        </div>
        <div className="grid gap-5 md:grid-cols-3">
          {testimonials.filter((t: any) => !t.bookSlug).slice(0, 3).map((t: any, i: number) => (
            <motion.figure
              key={t.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: i * 0.1 }}
              className="flex flex-col justify-between rounded-2xl border border-border/60 bg-card p-6 shadow-premium"
            >
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: t.rating }).map((_, j) => (
                  <Star key={j} className="h-3.5 w-3.5 fill-clay text-clay" />
                ))}
              </div>
              <blockquote className="font-reader text-[15px] leading-relaxed text-foreground/90">
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption className="mt-5 flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-sm text-background">
                  {t.name.charAt(0)}
                </span>
                <div>
                  <p className="text-sm font-semibold">{t.name}</p>
                  <p className="text-xs text-muted-foreground">{t.role}</p>
                </div>
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ============ FREE RESOURCES ============ */}
      {resources.length > 0 && (
        <section className="mx-auto max-w-7xl px-5 py-8 sm:px-8 sm:py-12">
          <SectionHeader
            eyebrow="Free downloads"
            title="Resources & lead magnets"
            action="Browse all"
            onAction={() => navigate("resources")}
          />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-6">
            {resources.map((r: any, i: number) => (
              <motion.button
                key={r.id}
                initial={{ opacity: 0, y: 18 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.05 }}
                onClick={() => navigate("resources")}
                className="group flex flex-col gap-3 rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-1 hover:shadow-premium"
              >
                <div
                  className="flex aspect-[4/3] items-center justify-center rounded-xl text-2xl font-display"
                  style={{ background: `${r.accent}18`, color: r.accent }}
                >
                  {r.type === "prompt-pack" ? "AI" : r.type === "checklist" ? "✓" : r.type === "template" ? "▤" : "PDF"}
                </div>
                <div>
                  <p className="line-clamp-2 text-xs font-semibold leading-snug">{r.title}</p>
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-muted-foreground">{r.type}</p>
                </div>
              </motion.button>
            ))}
          </div>
        </section>
      )}

      {/* ============ NEWSLETTER ============ */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
        <NewsletterBand />
      </section>
    </div>
  );
}
