"use client";

import { motion } from "motion/react";
import { Star, Check, BookOpen, FileText, Shield, ArrowUpRight, ChevronDown, Quote } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { useState } from "react";
import { useData } from "@/hooks/use-data";
import { useNav } from "@/lib/store/nav";
import { BookCover } from "@/components/site/book-cover";
import { CheckoutModal } from "@/components/platform/checkout-modal";
import { useToast } from "@/hooks/use-toast";

export function BookView({ slug }: { slug: string }) {
  const { data, loading } = useData<{ book: any; testimonials: any[] }>(`/api/books/${slug}`);
  const navigate = useNav((s) => s.navigate);
  const openReader = useNav((s) => s.openReader);
  const { toast } = useToast();
  const [checkoutOpen, setCheckoutOpen] = useState(false);

  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-5 py-24 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-12">
          <div className="h-[480px] animate-pulse rounded-3xl bg-muted lg:col-span-7" />
          <div className="h-[480px] animate-pulse rounded-3xl bg-muted lg:col-span-5" />
        </div>
      </div>
    );
  }

  const book = data?.book;
  if (!book) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="font-display text-3xl">Book not found.</p>
        <button onClick={() => navigate("books")} className="mt-4 text-clay underline">
          Back to the library
        </button>
      </div>
    );
  }

  const testimonials = data?.testimonials ?? [];
  const discount = book.originalPrice
    ? Math.round((1 - book.price / book.originalPrice) * 100)
    : 0;

  function buy() {
    setCheckoutOpen(true);
  }

  const checkoutItems = book
    ? [{ slug: book.slug, title: book.title, type: "book" as const, price: book.price }]
    : [];

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden border-b border-border/60">
        <div
          className="pointer-events-none absolute inset-0 opacity-50"
          style={{
            background: `radial-gradient(60% 50% at 80% 0%, ${book.accent}1a, transparent 70%)`,
          }}
        />
        <div className="relative mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
          <button
            onClick={() => navigate("books")}
            className="mb-8 inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to library
          </button>

          <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
            {/* Cover */}
            <motion.div
              initial={{ opacity: 0, y: 24, rotateY: -10 }}
              animate={{ opacity: 1, y: 0, rotateY: 0 }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-xs" style={{ perspective: 1200 }}>
                <div className="absolute -inset-6 -z-10 rounded-3xl blur-3xl" style={{ background: `${book.accent}22` }} />
                <div className="transition-transform duration-700 hover:-translate-y-2 hover:rotate-[-1deg]">
                  <BookCover book={book} className="w-full" />
                </div>
              </div>
            </motion.div>

            {/* Details */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="lg:col-span-7"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-2.5 py-1 text-xs font-medium"
                  style={{ background: `${book.accent}14`, color: book.accent }}
                >
                  {book.category}
                </span>
                {book.badge && (
                  <span className="rounded-full bg-clay/10 px-2.5 py-1 text-xs font-medium text-clay">
                    {book.badge}
                  </span>
                )}
              </div>

              <h1 className="mt-4 font-display text-[clamp(2.2rem,5vw,4rem)] leading-[1.02] tracking-tight text-balance">
                {book.title}
              </h1>
              <p className="mt-4 font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
                {book.subtitle}
              </p>

              <div className="mt-5 flex flex-wrap items-center gap-4 text-sm">
                <span className="flex items-center gap-1">
                  <Star className="h-4 w-4 fill-clay text-clay" />
                  <span className="font-semibold">{book.rating}</span>
                  <span className="text-muted-foreground">({book.reviewsCount})</span>
                </span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{book.pages} pages</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">{book.buyers.toLocaleString()} readers</span>
              </div>

              {/* Sticky-ish purchase on mobile */}
              <div className="mt-8 rounded-2xl border border-border/60 bg-card p-5 shadow-premium lg:hidden">
                <PurchaseCard book={book} discount={discount} onBuy={buy} onPreview={() => openReader(book.slug)} />
              </div>

              {/* What you learn preview */}
              <div className="mt-8 hidden lg:block">
                <p className="eyebrow mb-3">The promise</p>
                <p className="font-reader text-lg leading-relaxed text-foreground/85">{book.description}</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Body with sticky sidebar */}
      <section className="mx-auto max-w-7xl px-5 py-14 sm:px-8 sm:py-20">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
          {/* Main content */}
          <div className="lg:col-span-7">
            {/* What you learn */}
            <Block title="What you'll learn" eyebrow="Outcomes">
              <ul className="grid gap-3 sm:grid-cols-2">
                {book.whatYouLearn.map((item: string, i: number) => (
                  <motion.li
                    key={i}
                    initial={{ opacity: 0, y: 12 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.4, delay: i * 0.05 }}
                    className="flex items-start gap-2.5 rounded-xl border border-border/50 bg-card p-3.5"
                  >
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
                    <span className="text-sm leading-snug text-foreground/85">{item}</span>
                  </motion.li>
                ))}
              </ul>
            </Block>

            {/* Table of contents */}
            <Block title="Table of contents" eyebrow="Inside the book">
              <ol className="overflow-hidden rounded-2xl border border-border/60">
                {book.chapters.map((c: any, i: number) => (
                  <li
                    key={i}
                    className="flex items-center justify-between gap-4 border-b border-border/60 px-5 py-4 last:border-0 transition-colors hover:bg-muted/40"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-display text-lg text-muted-foreground">
                        {String(i + 1).padStart(2, "0")}
                      </span>
                      <span className="text-sm font-medium">{c.title}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{c.pages} pp</span>
                  </li>
                ))}
              </ol>
            </Block>

            {/* Testimonials */}
            {testimonials.length > 0 && (
              <Block title="Reader reviews" eyebrow="Social proof">
                <div className="grid gap-4">
                  {testimonials.map((t: any) => (
                    <figure
                      key={t.id}
                      className="relative rounded-2xl border border-border/60 bg-card p-5"
                    >
                      <Quote className="absolute right-4 top-4 h-6 w-6 text-clay/20" />
                      <div className="mb-3 flex gap-0.5">
                        {Array.from({ length: t.rating }).map((_, j) => (
                          <Star key={j} className="h-3.5 w-3.5 fill-clay text-clay" />
                        ))}
                      </div>
                      <blockquote className="font-reader text-[15px] leading-relaxed text-foreground/90">
                        {t.quote}
                      </blockquote>
                      <figcaption className="mt-4 flex items-center gap-3">
                        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-foreground font-display text-sm text-background">
                          {t.name.charAt(0)}
                        </span>
                        <div>
                          <p className="text-sm font-semibold">{t.name}</p>
                          <p className="text-xs text-muted-foreground">{t.role}</p>
                        </div>
                      </figcaption>
                    </figure>
                  ))}
                </div>
              </Block>
            )}

            {/* FAQ */}
            <Block title="Frequently asked" eyebrow="Before you buy">
              <Accordion type="single" collapsible className="rounded-2xl border border-border/60">
                {book.faq.map((f: any, i: number) => (
                  <AccordionItem key={i} value={`faq-${i}`} className="border-b border-border/60 last:border-0">
                    <AccordionTrigger className="px-5 text-left text-sm font-medium hover:no-underline">
                      {f.q}
                    </AccordionTrigger>
                    <AccordionContent className="px-5 text-sm leading-relaxed text-muted-foreground">
                      {f.a}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </Block>

            {/* Final CTA */}
            <div className="mt-10 rounded-3xl border border-border/60 bg-foreground p-8 text-background sm:p-10">
              <h3 className="font-display text-2xl tracking-tight sm:text-3xl text-balance">
                Start reading in the next two minutes.
              </h3>
              <p className="mt-2 text-sm text-background/70">
                Instant access. Built-in reader. 30-day refund. No risk.
              </p>
              <button
                onClick={buy}
                className="mt-5 inline-flex items-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-transform hover:scale-[1.03] active:scale-95"
              >
                Get the book for ${book.price}
                <ArrowUpRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Sticky purchase card (desktop) */}
          <aside className="hidden lg:col-span-5 lg:block">
            <div className="sticky top-24">
              <div className="rounded-3xl border border-border/60 bg-card p-6 shadow-premium">
                <PurchaseCard book={book} discount={discount} onBuy={buy} onPreview={() => openReader(book.slug)} />
              </div>
            </div>
          </aside>
        </div>
      </section>

      <CheckoutModal
        open={checkoutOpen}
        items={checkoutItems}
        onClose={() => setCheckoutOpen(false)}
        onSuccess={() => openReader(book.slug)}
      />
    </div>
  );
}

function Block({ title, eyebrow, children }: { title: string; eyebrow: string; children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.6 }}
      className="mb-12"
    >
      <p className="eyebrow mb-1.5">{eyebrow}</p>
      <h2 className="mb-5 font-display text-2xl tracking-tight sm:text-3xl">{title}</h2>
      {children}
    </motion.div>
  );
}

function PurchaseCard({
  book,
  discount,
  onBuy,
  onPreview,
}: {
  book: any;
  discount: number;
  onBuy: () => void;
  onPreview: () => void;
}) {
  return (
    <div>
      <div className="flex items-end gap-3">
        <span className="font-display text-5xl tracking-tight">${book.price}</span>
        {book.originalPrice && (
          <span className="mb-1.5 text-lg text-muted-foreground line-through">${book.originalPrice}</span>
        )}
        {discount > 0 && (
          <span className="mb-2 rounded-full bg-clay/10 px-2 py-0.5 text-xs font-semibold text-clay">
            Save {discount}%
          </span>
        )}
      </div>
      <p className="mt-1 text-xs text-muted-foreground">One-time payment · Lifetime access</p>

      <button
        onClick={onBuy}
        className="group mt-5 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-4 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95"
      >
        Buy now — instant access
        <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
      </button>
      <button
        onClick={onPreview}
        className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-full border border-border py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
      >
        <BookOpen className="h-4 w-4" />
        Read a free preview
      </button>

      <div className="mt-6 space-y-3 border-t border-border/60 pt-5">
        {book.highlights.map((h: string, i: number) => (
          <div key={i} className="flex items-start gap-2.5 text-sm">
            {i === 0 && <BookOpen className="mt-0.5 h-4 w-4 shrink-0 text-clay" />}
            {i === 1 && <FileText className="mt-0.5 h-4 w-4 shrink-0 text-clay" />}
            {i >= 2 && <Shield className="mt-0.5 h-4 w-4 shrink-0 text-clay" />}
            <span className="text-foreground/80">{h}</span>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center gap-3 rounded-xl bg-muted/50 p-3">
        <Shield className="h-5 w-5 shrink-0 text-clay" />
        <p className="text-xs leading-snug text-muted-foreground">
          30-day, no-questions refund. If it doesn't pay for itself, email me.
        </p>
      </div>
    </div>
  );
}
