"use client";

import { motion } from "motion/react";
import { ArrowLeft, Clock, Calendar } from "lucide-react";
import ReactMarkdown from "react-markdown";
import { useData } from "@/hooks/use-data";
import { useNav } from "@/lib/store/nav";
import { DynamicIslandTOC } from "@/components/site/dynamic-island-toc";
import { NewsletterBand } from "@/components/site/newsletter-band";
import { Logo } from "@/components/site/logo";

export function PostView({ slug }: { slug: string }) {
  const { data, loading } = useData<{ post: any }>(`/api/blog/${slug}`);
  const navigate = useNav((s) => s.navigate);

  if (loading) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-24">
        <div className="h-8 w-24 animate-pulse rounded bg-muted" />
        <div className="mt-8 h-12 w-3/4 animate-pulse rounded bg-muted" />
        <div className="mt-6 h-64 animate-pulse rounded-3xl bg-muted" />
      </div>
    );
  }

  const post = data?.post;
  if (!post) {
    return (
      <div className="mx-auto max-w-3xl px-5 py-32 text-center">
        <p className="font-display text-3xl">Essay not found.</p>
        <button onClick={() => navigate("blog")} className="mt-4 text-clay underline">
          Back to the journal
        </button>
      </div>
    );
  }

  return (
    <>
      <article className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <button
          onClick={() => navigate("blog")}
          className="mb-10 inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" /> Back to the journal
        </button>

        {/* Header */}
        <motion.header
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center gap-2 text-xs">
            <span className="rounded-full bg-clay/10 px-2.5 py-1 font-medium text-clay">{post.category}</span>
          </div>
          <h1 className="mt-4 font-display text-[clamp(2rem,5vw,3.5rem)] leading-[1.05] tracking-tight text-balance">
            {post.title}
          </h1>
          <p className="mt-5 font-reader text-xl leading-relaxed text-muted-foreground text-pretty">{post.excerpt}</p>
          <div className="mt-6 flex items-center gap-4 border-b border-border/60 pb-8 text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Logo size={28} rounded="rounded-full" />
              Tasbir Kabir
            </span>
            <span className="flex items-center gap-1">
              <Calendar className="h-3.5 w-3.5" />
              {new Date(post.publishedAt).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              {post.readTime} min read
            </span>
          </div>
        </motion.header>

        {/* Cover */}
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="my-10 overflow-hidden rounded-3xl"
        >
          <img src={post.cover} alt="" loading="lazy" className="aspect-[16/9] w-full object-cover" />
        </motion.div>

        {/* Body */}
        <div className="prose-tk">
          <ReactMarkdown
            components={{
              h2: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
                return (
                  <h2 id={id} className="mt-12 font-display text-2xl tracking-tight sm:text-3xl scroll-mt-24">
                    {children}
                  </h2>
                );
              },
              h3: ({ children }) => {
                const text = String(children);
                const id = text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]/g, "");
                return (
                  <h3 id={id} className="mt-8 font-display text-xl tracking-tight sm:text-2xl scroll-mt-24">
                    {children}
                  </h3>
                );
              },
              p: ({ children }) => (
                <p className="mt-5 font-reader text-[1.18rem] leading-[1.75] text-foreground/85 first:first-letter:font-display first:first-letter:text-[3.4em] first:first-letter:leading-[0.82] first:first-letter:float-left first:first-letter:mr-2 first:first-letter:mt-1">
                  {children}
                </p>
              ),
              strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
              ul: ({ children }) => <ul className="mt-5 space-y-2.5">{children}</ul>,
              ol: ({ children }) => <ol className="mt-5 space-y-2.5">{children}</ol>,
              li: ({ children }) => (
                <li className="flex gap-2.5 font-reader text-[1.18rem] leading-[1.7] text-foreground/85">
                  <span className="mt-[0.7em] h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                  <span>{children}</span>
                </li>
              ),
              blockquote: ({ children }) => (
                <blockquote className="my-8 border-l-2 border-clay pl-5 font-reader text-xl italic leading-relaxed text-foreground/90">
                  {children}
                </blockquote>
              ),
              a: ({ children, href }) => (
                <a href={href} className="text-clay underline underline-offset-2 hover:text-foreground">
                  {children}
                </a>
              ),
            }}
          >
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Author card */}
        <div className="mt-16 flex items-center gap-4 rounded-3xl border border-border/60 bg-muted/30 p-6">
          <Logo size={56} rounded="rounded-2xl" />
          <div>
            <p className="font-display text-lg">Tasbir Kabir</p>
            <p className="mt-0.5 text-sm text-muted-foreground">
              Building digital systems that scale. Author of The AI Agency Operating System and seven other books on
              building, tracking, advertising and converting.
            </p>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-12">
          <NewsletterBand />
        </div>
      </article>

      <DynamicIslandTOC />
    </>
  );
}
