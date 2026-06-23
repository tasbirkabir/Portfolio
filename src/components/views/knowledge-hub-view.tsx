"use client";

import { motion } from "motion/react";
import { ArrowUpRight, BookOpen, FileText, Newspaper, Bot, Workflow, Globe, Megaphone, TrendingUp, Sparkles } from "lucide-react";
import { useNav } from "@/lib/store/nav";
import { useData } from "@/hooks/use-data";
import { JsonLd } from "@/lib/seo/json-ld";
import { faqPageSchema, collectionPageSchema } from "@/lib/seo/schema";
import { FaqSection } from "@/components/site/faq-section";
import { KNOWLEDGE_HUB_FAQS } from "@/lib/seo/faq-data";
import { resolveIcon } from "@/lib/icon-registry";

type Cluster = {
  id: string;
  title: string;
  icon: string;
  desc: string;
  keywords: string[];
  match: (item: { title: string; description?: string; category?: string; tags?: string | string[]; subtitle?: string }) => boolean;
};

const CLUSTERS: Cluster[] = [
  {
    id: "ai-agents",
    title: "AI Agents",
    icon: "Bot",
    desc: "Custom AI systems that automate customer interactions, lead qualification, support, and business operations.",
    keywords: ["ai", "agent", "gpt", "chatbot", "llm", "claude", "openai"],
    match: (item) => {
      const text = `${item.title} ${item.description || ""} ${item.subtitle || ""} ${item.category || ""}`.toLowerCase();
      return text.includes("ai agent") || text.includes("chatbot") || text.includes("gpt") || text.includes("llm");
    },
  },
  {
    id: "automation",
    title: "Automation Systems",
    icon: "Workflow",
    desc: "End-to-end workflows that connect your tools and streamline repetitive processes.",
    keywords: ["automation", "workflow", "n8n", "make", "zapier", "integration"],
    match: (item) => {
      const text = `${item.title} ${item.description || ""} ${item.subtitle || ""} ${item.category || ""}`.toLowerCase();
      return text.includes("automation") || text.includes("workflow") || text.includes("n8n") || text.includes("make.com");
    },
  },
  {
    id: "web-development",
    title: "Web Development",
    icon: "Globe",
    desc: "Fast, conversion-focused websites enhanced with AI-powered features.",
    keywords: ["website", "web", "development", "nextjs", "wordpress", "frontend"],
    match: (item) => {
      const text = `${item.title} ${item.description || ""} ${item.subtitle || ""} ${item.category || ""}`.toLowerCase();
      return text.includes("website") || text.includes("web develop") || text.includes("wordpress") || text.includes("nextjs");
    },
  },
  {
    id: "marketing",
    title: "Marketing & Media Buying",
    icon: "Megaphone",
    desc: "Strategy, ads, and analytics for acquisition and growth.",
    keywords: ["marketing", "ads", "media buying", "facebook ads", "google ads", "funnel"],
    match: (item) => {
      const text = `${item.title} ${item.description || ""} ${item.subtitle || ""} ${item.category || ""}`.toLowerCase();
      return text.includes("marketing") || text.includes("media buying") || text.includes("ads") || text.includes("funnel") || text.includes("growth");
    },
  },
  {
    id: "business-systems",
    title: "Business Systems",
    icon: "TrendingUp",
    desc: "Frameworks, playbooks, and operating systems for scaling a business.",
    keywords: ["business", "systems", "framework", "operating system", "scale", "agency"],
    match: (item) => {
      const text = `${item.title} ${item.description || ""} ${item.subtitle || ""} ${item.category || ""}`.toLowerCase();
      return text.includes("business") || text.includes("system") || text.includes("framework") || text.includes("operating") || text.includes("agency") || text.includes("scale");
    },
  },
];

export function KnowledgeHubView() {
  const navigate = useNav((s) => s.navigate);
  const { data: booksData } = useData<{ books: any[] }>("/api/books");
  const { data: blogData } = useData<{ posts: any[] }>("/api/blog");
  const { data: resData } = useData<{ resources: any[] }>("/api/resources");

  const books = booksData?.books ?? [];
  const posts = blogData?.posts ?? [];
  const resources = resData?.resources ?? [];

  // Assign content to clusters
  const clusters = CLUSTERS.map((cluster) => ({
    ...cluster,
    books: books.filter(cluster.match),
    posts: posts.filter(cluster.match),
    resources: resources.filter(cluster.match),
  })).filter((c) => c.books.length > 0 || c.posts.length > 0 || c.resources.length > 0);

  return (
    <div>
      <JsonLd data={[collectionPageSchema(books), faqPageSchema(KNOWLEDGE_HUB_FAQS)]} />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.7 }}>
            <p className="eyebrow mb-4">Knowledge Hub</p>
            <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] tracking-tight text-balance">
              Everything I know, <span className="italic text-clay">organized.</span>
            </h1>
            <p className="mt-7 max-w-2xl font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
              A curated collection of ebooks, articles, and resources — grouped by topic so you can go deep on
              AI agents, automation, web development, marketing, and business systems. Start anywhere.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Clusters */}
      <section className="mx-auto max-w-7xl px-5 pb-16 sm:px-8 sm:pb-24">
        <div className="space-y-16">
          {clusters.map((cluster, ci) => {
            const Icon = resolveIcon(cluster.icon);
            return (
              <motion.div
                key={cluster.id}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.6, delay: ci * 0.05 }}
              >
                {/* Cluster header */}
                <div className="mb-6 flex items-start gap-4 border-b border-border/60 pb-5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <h2 className="font-display text-2xl tracking-tight sm:text-3xl">{cluster.title}</h2>
                    <p className="mt-1 text-sm leading-relaxed text-muted-foreground sm:text-base">{cluster.desc}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-muted px-3 py-1 text-xs font-medium text-muted-foreground">
                    {cluster.books.length + cluster.posts.length + cluster.resources.length} items
                  </span>
                </div>

                {/* Cluster content */}
                <div className="grid gap-6 lg:grid-cols-3">
                  {/* Ebooks */}
                  {cluster.books.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <BookOpen className="h-3.5 w-3.5" /> Ebooks
                      </h3>
                      <div className="space-y-2">
                        {cluster.books.map((b) => (
                          <button
                            key={b.id}
                            onClick={() => navigate("book", { bookSlug: b.slug })}
                            className="group flex w-full items-start gap-2 rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold leading-snug">{b.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{b.subtitle}</p>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Articles */}
                  {cluster.posts.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <Newspaper className="h-3.5 w-3.5" /> Articles
                      </h3>
                      <div className="space-y-2">
                        {cluster.posts.map((p) => (
                          <button
                            key={p.id}
                            onClick={() => navigate("post", { postSlug: p.slug })}
                            className="group flex w-full items-start gap-2 rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold leading-snug">{p.title}</p>
                              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{p.excerpt}</p>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Resources */}
                  {cluster.resources.length > 0 && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        <FileText className="h-3.5 w-3.5" /> Free Resources
                      </h3>
                      <div className="space-y-2">
                        {cluster.resources.map((r) => (
                          <button
                            key={r.id}
                            onClick={() => navigate("resources")}
                            className="group flex w-full items-start gap-2 rounded-xl border border-border/60 bg-card p-3 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium"
                          >
                            <div className="flex-1">
                              <p className="text-sm font-semibold leading-snug">{r.title}</p>
                              <p className="mt-0.5 text-xs uppercase tracking-wide text-muted-foreground">{r.type}</p>
                            </div>
                            <ArrowUpRight className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
        <motion.div initial={{ opacity: 0, y: 16 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
          <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-clay/10 text-clay">
            <Sparkles className="h-5 w-5" />
          </div>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl text-balance">
            Can&rsquo;t find what you&rsquo;re looking for?
          </h2>
          <p className="mx-auto mt-4 max-w-md font-reader text-lg text-muted-foreground">
            Browse the full library or reach out — I&rsquo;ll point you to the right resource.
          </p>
          <div className="mt-7 flex flex-wrap justify-center gap-3">
            <button
              onClick={() => navigate("books")}
              className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
            >
              Browse all books
              <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </button>
            <button
              onClick={() => navigate("contact")}
              className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
            >
              Contact me
            </button>
          </div>
        </motion.div>
      </section>

      {/* FAQ (GEO) */}
      <FaqSection faqs={KNOWLEDGE_HUB_FAQS} eyebrow="Questions" title="Knowledge Hub FAQ" />
    </div>
  );
}
