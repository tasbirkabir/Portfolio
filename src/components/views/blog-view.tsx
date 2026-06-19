"use client";

import { motion } from "motion/react";
import { Clock, ArrowUpRight } from "lucide-react";
import { useData } from "@/hooks/use-data";
import { useNav } from "@/lib/store/nav";

export function BlogView() {
  const { data, loading } = useData<{ posts: any[] }>("/api/blog");
  const navigate = useNav((s) => s.navigate);
  const posts = data?.posts ?? [];
  const featured = posts.find((p) => p.featured) || posts[0];
  const rest = posts.filter((p) => p.id !== featured?.id);

  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="eyebrow mb-3">The journal</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] tracking-tight text-balance">
          Essays on building
          <br />digital systems
        </h1>
        <p className="mt-5 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground">
          Long-form notes on systems, leverage, and the craft of building a business that compounds. New essays every
          week.
        </p>
      </motion.div>

      {loading ? (
        <div className="space-y-6">
          <div className="h-80 animate-pulse rounded-3xl bg-muted" />
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="h-64 animate-pulse rounded-3xl bg-muted" />
            <div className="h-64 animate-pulse rounded-3xl bg-muted" />
          </div>
        </div>
      ) : (
        <>
          {/* Featured */}
          {featured && (
            <motion.button
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              onClick={() => navigate("post", { postSlug: featured.slug })}
              className="group mb-14 grid w-full overflow-hidden rounded-3xl border border-border/60 bg-card text-left transition-all hover:shadow-premium"
            >
              <div className="grid md:grid-cols-2">
                <div className="relative aspect-[16/10] overflow-hidden md:aspect-auto">
                  <img
                    src={featured.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                </div>
                <div className="flex flex-col justify-center p-8 sm:p-10">
                  <div className="flex items-center gap-2 text-xs">
                    <span className="rounded-full bg-clay/10 px-2.5 py-1 font-medium text-clay">{featured.category}</span>
                    <span className="text-muted-foreground">Featured</span>
                  </div>
                  <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight text-balance sm:text-4xl">
                    {featured.title}
                  </h2>
                  <p className="mt-4 font-reader text-base leading-relaxed text-muted-foreground line-clamp-3">
                    {featured.excerpt}
                  </p>
                  <div className="mt-6 flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5" /> {featured.readTime} min read
                    </span>
                    <span>Read essay</span>
                    <ArrowUpRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </div>
                </div>
              </div>
            </motion.button>
          )}

          {/* List */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rest.map((p, i) => (
              <motion.button
                key={p.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                onClick={() => navigate("post", { postSlug: p.slug })}
                className="group flex flex-col overflow-hidden rounded-3xl border border-border/60 bg-card text-left transition-all hover:-translate-y-1 hover:shadow-premium"
              >
                <div className="relative aspect-[16/10] overflow-hidden">
                  <img
                    src={p.cover}
                    alt=""
                    className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <span className="absolute left-3 top-3 rounded-full bg-background/90 px-2.5 py-1 text-[10px] font-medium backdrop-blur">
                    {p.category}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-5">
                  <h3 className="font-display text-xl leading-snug tracking-tight line-clamp-2">{p.title}</h3>
                  <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground line-clamp-2">{p.excerpt}</p>
                  <div className="mt-4 flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" /> {p.readTime} min read
                  </div>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
