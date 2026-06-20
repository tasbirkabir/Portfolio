"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Quote, Bot, Workflow, Globe, Megaphone, Search, Hammer, GraduationCap, TrendingUp } from "lucide-react";
import { useNav } from "@/lib/store/nav";

const SERVICES = [
  { icon: Bot, title: "AI Agents", desc: "Custom AI agents that handle customer interactions, lead qualification, support tasks, data processing, and business operations — working around the clock.", stack: "OpenAI · Claude · n8n" },
  { icon: Workflow, title: "Automation Systems", desc: "Smart workflows that connect your tools, streamline repetitive processes, automate lead management, and improve operational efficiency.", stack: "n8n · Make · API Integrations" },
  { icon: Globe, title: "AI-Integrated Web Development", desc: "Modern websites enhanced with AI-powered features, automation, lead generation systems, and conversion-focused experiences.", stack: "WordPress · AI Features · Optimization" },
  { icon: Megaphone, title: "AI Consulting & Media Buying", desc: "Strategy and media buying that puts AI to work on acquisition — from intelligent workflows to conversion-focused campaigns.", stack: "Strategy · Ads · Analytics" },
];

const PROCESS = [
  { icon: Search, step: "01", title: "Understand", desc: "First I map your business or goal — where time is leaking, and where AI fits best." },
  { icon: Hammer, step: "02", title: "Build", desc: "Agent or automation designed + built — fast, tested, and plugged into your real workflow." },
  { icon: GraduationCap, step: "03", title: "Learn", desc: "I don't just deliver — I teach you how to run and modify the system yourself, step by step." },
  { icon: TrendingUp, step: "04", title: "Scale", desc: "Once the system runs, we scale it across more brands, more products, more income streams." },
];

const TIMELINE = [
  { year: "Start", title: "Began building websites", desc: "Started helping businesses establish and grow their digital presence through websites and marketing systems." },
  { year: "Growth", title: "Discovered automation", desc: "Realized many repetitive processes could be streamlined and enhanced using automation tools like n8n and Make." },
  { year: "AI era", title: "Went all-in on AI", desc: "Began building AI agents, automation systems, and AI-integrated websites that help businesses operate more efficiently." },
  { year: "Today", title: "60+ projects delivered", desc: "Now serving clients globally from Dhaka, Bangladesh — combining AI and digital strategy to create systems that drive real growth." },
];

const ACHIEVEMENTS = [
  { value: "60+", label: "Projects completed" },
  { value: "100+", label: "Websites built" },
  { value: "15+", label: "Workflows created" },
  { value: "98%", label: "Client satisfaction" },
];

export function AboutView() {
  const navigate = useNav((s) => s.navigate);

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="pointer-events-none absolute inset-0 bg-grid opacity-50 [mask-image:radial-gradient(60%_50%_at_50%_0%,black,transparent)]" />
        <div className="relative mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
          <div className="grid items-center gap-10 lg:grid-cols-12 lg:gap-16">
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7 }}
              className="lg:col-span-7"
            >
              <p className="eyebrow mb-4">About</p>
              <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-tight text-balance">
                Building digital
                <br />
                systems that{" "}
                <span className="italic text-clay">scale.</span>
              </h1>
              <p className="mt-7 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
                Hey, I&rsquo;m Tasbir Kabir — AI Consultant, Web Developer, and Media Buyer based in Dhaka,
                Bangladesh. For over 3 years, I&rsquo;ve been helping businesses establish and grow their digital
                presence through websites, marketing systems, and automation.
              </p>
              <p className="mt-4 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
                Along the way, I discovered that many repetitive processes could be streamlined and enhanced using AI.
                Today, I build AI agents, automation systems, and AI-integrated websites that help businesses operate
                more efficiently and grow faster.
              </p>
              <p className="mt-4 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
                My focus is simple: create practical solutions that deliver measurable results while remaining easy to
                manage and scale.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.15 }}
              className="lg:col-span-5"
            >
              <div className="relative mx-auto max-w-sm">
                <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-clay/10 blur-2xl" />
                <div className="overflow-hidden rounded-[1.75rem] shadow-premium ring-1 ring-black/5">
                  <img src="/images/logo.png" alt="Tasbir Kabir" loading="lazy" className="aspect-square w-full object-cover" />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Mission quote */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <p className="eyebrow mb-3">The philosophy</p>
        <blockquote className="font-display text-2xl leading-snug tracking-tight sm:text-4xl text-balance">
          <Quote className="mb-4 h-8 w-8 text-clay" />
          The best systems work for you even when you&rsquo;re offline.
        </blockquote>
        <div className="mt-8 space-y-5 font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
          <p>
            I combine AI and digital strategy to create systems that drive real business growth — from intelligent
            workflows to conversion-focused web experiences. Every system I build is designed to save time, generate
            leads, and scale.
          </p>
          <p>
            I don&rsquo;t just deliver — I teach you how to run and modify the system yourself, step by step. Because
            the system you understand is the system that compounds.
          </p>
        </div>
      </section>

      {/* Services / What I build */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-10">
          <p className="eyebrow mb-2">What I build &amp; teach</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">From idea to automated business</h2>
          <p className="mt-3 max-w-2xl font-reader text-lg text-muted-foreground">
            Four services, one operating system. Each one plugs into the next — so your business runs on systems, not
            on you.
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl tracking-tight">{s.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s.desc}</p>
                <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                  {s.stack}
                </p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-10">
          <p className="eyebrow mb-2">How it works</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Simple process, serious results</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {PROCESS.map((p, i) => {
            const Icon = p.icon;
            return (
              <motion.div
                key={p.step}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="relative rounded-3xl border border-border/60 bg-card p-6"
              >
                <span className="font-display text-4xl text-clay">{p.step}</span>
                <div className="mt-3 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-muted-foreground" />
                  <h3 className="font-display text-lg tracking-tight">{p.title}</h3>
                </div>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{p.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Timeline */}
      <section className="mx-auto max-w-3xl px-5 py-16 sm:py-20">
        <p className="eyebrow mb-3">The path</p>
        <h2 className="mb-10 font-display text-3xl tracking-tight sm:text-4xl">3+ years, one focus</h2>
        <div className="relative">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
          <div className="space-y-8">
            {TIMELINE.map((t, i) => (
              <motion.div
                key={t.year}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.06 }}
                className="relative flex gap-5"
              >
                <span className="relative z-10 mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 border-background bg-clay ring-2 ring-clay/30" />
                <div>
                  <span className="font-display text-sm text-clay">{t.year}</span>
                  <h3 className="mt-0.5 font-display text-lg tracking-tight">{t.title}</h3>
                  <p className="mt-1 text-sm leading-relaxed text-muted-foreground">{t.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Achievements */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="grid gap-5 rounded-3xl border border-border/60 bg-foreground p-8 text-background sm:grid-cols-2 sm:p-12 lg:grid-cols-4">
          {ACHIEVEMENTS.map((a, i) => (
            <motion.div
              key={a.label}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
            >
              <p className="font-display text-4xl tracking-tight sm:text-5xl">{a.value}</p>
              <p className="mt-2 text-sm text-background/60">{a.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="mx-auto max-w-3xl px-5 py-16 text-center sm:py-24">
        <h2 className="font-display text-3xl tracking-tight sm:text-4xl text-balance">
          Ready to build smarter?
        </h2>
        <p className="mx-auto mt-4 max-w-md font-reader text-lg text-muted-foreground">
          Start with the AI Agency Operating System, or browse the whole library.
        </p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <button
            onClick={() => navigate("book", { bookSlug: "ai-agency-operating-system" })}
            className="group inline-flex items-center gap-2 rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
          >
            Get the bestseller
            <ArrowUpRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
          </button>
          <button
            onClick={() => navigate("contact")}
            className="inline-flex items-center gap-2 rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5"
          >
            Work with me
          </button>
        </div>
      </section>
    </div>
  );
}
