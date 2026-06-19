"use client";

import { motion } from "motion/react";
import { Twitter, Linkedin, Github, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { OnboardingForm } from "@/components/site/onboarding-form";

const SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", handle: "in/tasbirrkabir", href: "https://www.linkedin.com/in/tasbirrkabir" },
  { icon: Twitter, label: "X (Twitter)", handle: "@tasbirrkabir", href: "https://x.com/tasbirrkabir" },
  { icon: Github, label: "GitHub", handle: "/tasbirkabir", href: "https://github.com/tasbirkabir" },
  { icon: Facebook, label: "Facebook", handle: "Tasbir Kabir", href: "https://www.facebook.com/share/1Tf65s6PB7/" },
  { icon: Mail, label: "Email", handle: "tasbirrkabir@gmail.com", href: "mailto:tasbirrkabir@gmail.com" },
];

export function ContactView() {
  return (
    <div className="mx-auto max-w-7xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="mb-12"
      >
        <p className="eyebrow mb-3">Start a project</p>
        <h1 className="font-display text-[clamp(2.4rem,6vw,4.5rem)] leading-[0.98] tracking-tight text-balance">
          Let's build
          <br />
          something useful.
        </h1>
        <p className="mt-5 max-w-xl font-reader text-lg leading-relaxed text-muted-foreground">
          Tell me about your project through this guided brief. The more I know about your goals,
          audience, and budget, the faster I can send back a precise proposal. Based in Dhaka,
          working with clients globally.
        </p>
      </motion.div>

      <div className="grid gap-10 lg:grid-cols-12 lg:gap-16">
        {/* Multi-step onboarding form */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
          className="lg:col-span-7"
        >
          <OnboardingForm />
        </motion.div>

        {/* Sidebar: socials + faq-ish */}
        <motion.aside
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-5"
        >
          <div className="rounded-3xl border border-border/60 bg-muted/30 p-6 sm:p-8">
            <h3 className="font-display text-xl tracking-tight">Find me elsewhere</h3>
            <p className="mt-1 text-sm text-muted-foreground">Fastest replies on email and Twitter.</p>
            <div className="mt-5 space-y-3">
              {SOCIALS.map((s) => {
                const Icon = s.icon;
                return (
                  <a
                    key={s.label}
                    href={s.href}
                    target={s.href.startsWith("mailto") ? undefined : "_blank"}
                    rel={s.href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                    className="group flex items-center justify-between rounded-2xl border border-border/60 bg-card p-4 transition-all hover:-translate-y-0.5 hover:shadow-premium"
                  >
                    <div className="flex items-center gap-3">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground text-background">
                        <Icon className="h-4 w-4" />
                      </span>
                      <div>
                        <p className="text-sm font-semibold">{s.label}</p>
                        <p className="text-xs text-muted-foreground">{s.handle}</p>
                      </div>
                    </div>
                    <ArrowUpRight className="h-4 w-4 text-muted-foreground transition-all group-hover:translate-x-0.5 group-hover:-translate-y-0.5 group-hover:text-foreground" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="mt-5 rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
            <h3 className="font-display text-xl tracking-tight">Before you write</h3>
            <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                For project inquiries, mention your business and what you&rsquo;re trying to automate or build.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                For book support, mention the book title — I handle these personally.
              </li>
              <li className="flex gap-2.5">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />
                Based in Dhaka, Bangladesh · replies within 1–2 business days.
              </li>
            </ul>
          </div>
        </motion.aside>
      </div>
    </div>
  );
}
