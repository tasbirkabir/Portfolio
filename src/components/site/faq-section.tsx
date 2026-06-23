"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChevronDown, HelpCircle } from "lucide-react";
import { JsonLd } from "@/lib/seo/json-ld";
import { faqPageSchema, type FAQ } from "@/lib/seo/schema";

/**
 * FAQ section with accordion UI + FAQPage JSON-LD schema.
 * Used on about, resources, book, and knowledge-hub pages for GEO.
 */
export function FaqSection({ faqs, title = "Frequently asked questions", eyebrow }: { faqs: FAQ[]; title?: string; eyebrow?: string }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="mx-auto max-w-3xl px-5 py-16 sm:py-24">
      {/* FAQPage schema for rich results + AI citation */}
      <JsonLd data={faqPageSchema(faqs)} />

      <div className="mb-10 text-center">
        {eyebrow && <p className="eyebrow mb-2">{eyebrow}</p>}
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl text-balance">{title}</h2>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => {
          const isOpen = open === i;
          return (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.05 }}
              className="overflow-hidden rounded-2xl border border-border/60 bg-card"
            >
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                className="flex w-full items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-foreground/[0.02]"
                aria-expanded={isOpen}
              >
                <HelpCircle className={`h-5 w-5 shrink-0 transition-colors ${isOpen ? "text-clay" : "text-muted-foreground"}`} />
                <span className="flex-1 font-display text-base tracking-tight sm:text-lg">{faq.q}</span>
                <ChevronDown className={`h-4 w-4 shrink-0 text-muted-foreground transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
              </button>
              <AnimatePresence initial={false}>
                {isOpen && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                  >
                    <p className="px-5 pb-5 pl-14 font-reader text-sm leading-relaxed text-muted-foreground sm:text-base">{faq.a}</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
