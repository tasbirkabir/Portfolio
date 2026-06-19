"use client";

import { useNav, type View } from "@/lib/store/nav";
import { Twitter, Linkedin, Github, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

export function Footer() {
  const navigate = useNav((s) => s.navigate);

  const cols: { title: string; links: { label: string; view?: View; bookSlug?: string }[] }[] = [
    {
      title: "Explore",
      links: [
        { label: "Home", view: "home" },
        { label: "Books", view: "books" },
        { label: "Resources", view: "resources" },
        { label: "Blog", view: "blog" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About", view: "about" },
        { label: "Contact", view: "contact" },
        { label: "The AI Agency OS", view: "book", bookSlug: "ai-agency-operating-system" },
      ],
    },
  ];

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30 pb-safe-nav md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
              <Logo size={36} rounded="rounded-full" />
              <span className="font-display text-xl tracking-tight">Tasbir Kabir</span>
            </button>
            <p className="mt-4 max-w-sm font-reader text-sm leading-relaxed text-muted-foreground">
              AI Consultant, Web Developer &amp; Media Buyer based in Dhaka, Bangladesh.
              I build AI agents, automation systems, and high-performing websites that help
              businesses save time, generate leads, and scale faster.
            </p>
            <div className="mt-5 flex items-center gap-2">
              {[
                { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/tasbirrkabir" },
                { icon: Twitter, label: "X (Twitter)", href: "https://x.com/tasbirrkabir" },
                { icon: Github, label: "GitHub", href: "https://github.com/tasbirkabir" },
                { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1Tf65s6PB7/" },
                { icon: Mail, label: "Email", href: "mailto:tasbirrkabir@gmail.com" },
              ].map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href.startsWith("mailto") ? undefined : "_blank"}
                  rel={href.startsWith("mailto") ? undefined : "noopener noreferrer"}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-border text-muted-foreground transition-colors hover:border-foreground hover:text-foreground"
                >
                  <Icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {cols.map((c) => (
            <div key={c.title}>
              <h4 className="eyebrow mb-4">{c.title}</h4>
              <ul className="space-y-2.5">
                {c.links.map((l) => (
                  <li key={l.label}>
                    <button
                      onClick={() => navigate(l.view as View, { bookSlug: l.bookSlug })}
                      className="group inline-flex items-center gap-1 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                      <ArrowUpRight className="h-3 w-3 opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border/60 pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>© {new Date().getFullYear()} Tasbir Kabir — AI Consultant &amp; Web Developer. All rights reserved.</p>
          <p className="font-reader italic">Build · Automate · Scale · Optimize · Repeat</p>
        </div>
      </div>
    </footer>
  );
}
