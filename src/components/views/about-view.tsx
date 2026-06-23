"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Quote } from "lucide-react";
import { useNav } from "@/lib/store/nav";
import { useData } from "@/hooks/use-data";
import { resolveIcon } from "@/lib/icon-registry";
import { JsonLd } from "@/lib/seo/json-ld";
import { personSchema, aboutPageSchema } from "@/lib/seo/schema";
import { FaqSection } from "@/components/site/faq-section";
import { ABOUT_FAQS } from "@/lib/seo/faq-data";

// ---- Hardcoded fallbacks (used before settings load / if API fails) ----
const FALLBACK_SERVICES = [
  { icon: "Bot", title: "AI Agents", desc: "Custom AI agents that handle customer interactions, lead qualification, support tasks, data processing, and business operations — working around the clock.", stack: "OpenAI · Claude · n8n" },
  { icon: "Workflow", title: "Automation Systems", desc: "Smart workflows that connect your tools, streamline repetitive processes, automate lead management, and improve operational efficiency.", stack: "n8n · Make · API Integrations" },
  { icon: "Globe", title: "AI-Integrated Web Development", desc: "Modern websites enhanced with AI-powered features, automation, lead generation systems, and conversion-focused experiences.", stack: "WordPress · AI Features · Optimization" },
  { icon: "Megaphone", title: "AI Consulting & Media Buying", desc: "Strategy and media buying that puts AI to work on acquisition — from intelligent workflows to conversion-focused campaigns.", stack: "Strategy · Ads · Analytics" },
];

const FALLBACK_PROCESS = [
  { icon: "Search", step: "01", title: "Understand", desc: "First I map your business or goal — where time is leaking, and where AI fits best." },
  { icon: "Hammer", step: "02", title: "Build", desc: "Agent or automation designed + built — fast, tested, and plugged into your real workflow." },
  { icon: "GraduationCap", step: "03", title: "Learn", desc: "I don't just deliver — I teach you how to run and modify the system yourself, step by step." },
  { icon: "TrendingUp", step: "04", title: "Scale", desc: "Once the system runs, we scale it across more brands, more products, more income streams." },
];

const FALLBACK_TIMELINE = [
  { year: "Start", title: "Began building websites", desc: "Started helping businesses establish and grow their digital presence through websites and marketing systems." },
  { year: "Growth", title: "Discovered automation", desc: "Realized many repetitive processes could be streamlined and enhanced using automation tools like n8n and Make." },
  { year: "AI era", title: "Went all-in on AI", desc: "Began building AI agents, automation systems, and AI-integrated websites that help businesses operate more efficiently." },
  { year: "Today", title: "60+ projects delivered", desc: "Now serving clients globally from Dhaka, Bangladesh — combining AI and digital strategy to create systems that drive real growth." },
];

const FALLBACK_ACHIEVEMENTS = [
  { value: "60+", label: "Projects completed" },
  { value: "100+", label: "Websites built" },
  { value: "15+", label: "Workflows created" },
  { value: "98%", label: "Client satisfaction" },
];

const FALLBACK_BIO =
  "Hey, I'm Tasbir Kabir — AI Consultant, Web Developer, and Media Buyer based in Dhaka, Bangladesh. For over 3 years, I've been helping businesses establish and grow their digital presence through websites, marketing systems, and automation.\n\nAlong the way, I discovered that many repetitive processes could be streamlined and enhanced using AI. Today, I build AI agents, automation systems, and AI-integrated websites that help businesses operate more efficiently and grow faster.\n\nMy focus is simple: create practical solutions that deliver measurable results while remaining easy to manage and scale.";

const FALLBACK_MISSION_BODY =
  "I combine AI and digital strategy to create systems that drive real business growth — from intelligent workflows to conversion-focused web experiences. Every system I build is designed to save time, generate leads, and scale.\n\nI don't just deliver — I teach you how to run and modify the system yourself, step by step. Because the system you understand is the system that compounds.";

export function AboutView() {
  const navigate = useNav((s) => s.navigate);
  const { data: settingsData } = useData<{ settings: any }>("/api/settings");
  const s = settingsData?.settings ?? null;

  const brandName = s?.brandName ?? "Tasbir Kabir";

  // ---- Hero ----
  const aboutEyebrow = s?.aboutEyebrow ?? "About";
  const aboutTitle = s?.aboutTitle ?? "Building digital systems that scale.";
  const aboutBio = s?.aboutBio ?? FALLBACK_BIO;
  const bioParagraphs = aboutBio.split(/\n\n+/).map((p: string) => p.trim()).filter(Boolean);

  // Wrap "scale" in italic clay if present, else last word.
  const renderTitle = () => {
    const lower = aboutTitle.toLowerCase();
    const scaleIdx = lower.indexOf("scale");
    if (scaleIdx !== -1) {
      const before = aboutTitle.slice(0, scaleIdx);
      const after = aboutTitle.slice(scaleIdx + 5); // length of "scale"
      const word = aboutTitle.slice(scaleIdx, scaleIdx + 5);
      return (
        <>
          {before}
          <span className="italic text-clay">{word}</span>
          {after}
        </>
      );
    }
    // Else: italic clay the last word.
    const trimmed = aboutTitle.trim();
    const lastSpace = trimmed.lastIndexOf(" ");
    if (lastSpace === -1) {
      return <span className="italic text-clay">{trimmed}</span>;
    }
    return (
      <>
        {trimmed.slice(0, lastSpace)}{" "}
        <span className="italic text-clay">{trimmed.slice(lastSpace + 1)}</span>
      </>
    );
  };

  // ---- Mission ----
  const aboutMissionQuote =
    s?.aboutMissionQuote ?? "The best systems work for you even when you're offline.";
  const aboutMissionBody = s?.aboutMissionBody ?? FALLBACK_MISSION_BODY;
  const missionParagraphs = aboutMissionBody
    .split(/\n\n+/)
    .map((p: string) => p.trim())
    .filter(Boolean);

  // ---- Services ----
  const aboutServicesEyebrow = s?.aboutServicesEyebrow ?? "What I build & teach";
  const aboutServicesTitle = s?.aboutServicesTitle ?? "From idea to automated business";
  const aboutServicesSubtitle =
    s?.aboutServicesSubtitle ??
    "Four services, one operating system. Each one plugs into the next — so your business runs on systems, not on you.";
  const services =
    Array.isArray(s?.aboutServices) && s.aboutServices.length ? s.aboutServices : FALLBACK_SERVICES;

  // ---- Process ----
  const aboutProcessEyebrow = s?.aboutProcessEyebrow ?? "How it works";
  const aboutProcessTitle = s?.aboutProcessTitle ?? "Simple process, serious results";
  const process =
    Array.isArray(s?.aboutProcess) && s.aboutProcess.length ? s.aboutProcess : FALLBACK_PROCESS;

  // ---- Timeline ----
  const aboutTimelineEyebrow = s?.aboutTimelineEyebrow ?? "The path";
  const aboutTimelineTitle = s?.aboutTimelineTitle ?? "3+ years, one focus";
  const timeline =
    Array.isArray(s?.aboutTimeline) && s.aboutTimeline.length ? s.aboutTimeline : FALLBACK_TIMELINE;

  // ---- Achievements ----
  const achievements =
    Array.isArray(s?.aboutAchievements) && s.aboutAchievements.length
      ? s.aboutAchievements
      : FALLBACK_ACHIEVEMENTS;

  // ---- CTA ----
  const aboutCtaTitle = s?.aboutCtaTitle ?? "Ready to build smarter?";
  const aboutCtaDesc =
    s?.aboutCtaDesc ?? "Start with the AI Agency Operating System, or browse the whole library.";

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
              <p className="eyebrow mb-4">{aboutEyebrow}</p>
              <h1 className="font-display text-[clamp(2.6rem,6vw,5rem)] leading-[0.98] tracking-tight text-balance">
                {renderTitle()}
              </h1>
              <div className="mt-7 max-w-xl space-y-4 font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
                {bioParagraphs.map((p: string, i: number) => (
                  <p key={i}>{p}</p>
                ))}
              </div>
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
                  <img src="/images/logo.webp" alt={brandName} width={400} height={400} loading="lazy" className="aspect-square w-full object-cover" />
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
          {aboutMissionQuote}
        </blockquote>
        <div className="mt-8 space-y-5 font-reader text-lg leading-relaxed text-muted-foreground text-pretty">
          {missionParagraphs.map((p: string, i: number) => (
            <p key={i}>{p}</p>
          ))}
        </div>
      </section>

      {/* Services / What I build */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-10">
          <p className="eyebrow mb-2">{aboutServicesEyebrow}</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{aboutServicesTitle}</h2>
          <p className="mt-3 max-w-2xl font-reader text-lg text-muted-foreground">
            {aboutServicesSubtitle}
          </p>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s2: any, i: number) => {
            const Icon = resolveIcon(s2.icon);
            return (
              <motion.div
                key={`${s2.title}-${i}`}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.08 }}
                className="flex flex-col rounded-3xl border border-border/60 bg-card p-6"
              >
                <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="font-display text-xl tracking-tight">{s2.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-relaxed text-muted-foreground">{s2.desc}</p>
                {s2.stack && (
                  <p className="mt-4 text-[11px] font-medium uppercase tracking-wide text-muted-foreground/70">
                    {s2.stack}
                  </p>
                )}
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Process */}
      <section className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-20">
        <div className="mb-10">
          <p className="eyebrow mb-2">{aboutProcessEyebrow}</p>
          <h2 className="font-display text-3xl tracking-tight sm:text-4xl">{aboutProcessTitle}</h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {process.map((p: any, i: number) => {
            const Icon = resolveIcon(p.icon);
            return (
              <motion.div
                key={`${p.step}-${i}`}
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
        <p className="eyebrow mb-3">{aboutTimelineEyebrow}</p>
        <h2 className="mb-10 font-display text-3xl tracking-tight sm:text-4xl">{aboutTimelineTitle}</h2>
        <div className="relative">
          <div className="absolute bottom-2 left-[7px] top-2 w-px bg-border" />
          <div className="space-y-8">
            {timeline.map((t: any, i: number) => (
              <motion.div
                key={`${t.year}-${i}`}
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
          {achievements.map((a: any, i: number) => (
            <motion.div
              key={`${a.label}-${i}`}
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
          {aboutCtaTitle}
        </h2>
        <p className="mx-auto mt-4 max-w-md font-reader text-lg text-muted-foreground">
          {aboutCtaDesc}
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

      {/* JSON-LD (Person + AboutPage) + FAQ (GEO) */}
      <JsonLd data={[personSchema(s), aboutPageSchema(s)]} />
      <FaqSection faqs={ABOUT_FAQS} eyebrow="Questions" title="Frequently asked questions" />
    </div>
  );
}
