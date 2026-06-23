"use client";

import { useNav, type View } from "@/lib/store/nav";
import { useData } from "@/hooks/use-data";
import { Twitter, Linkedin, Github, Facebook, Mail, ArrowUpRight } from "lucide-react";
import { Logo } from "./logo";

// Hardcoded fallbacks — used before settings load (or if the API fails).
const FALLBACK_BIO =
  "AI Consultant, Web Developer & Media Buyer based in Dhaka, Bangladesh. I build AI agents, automation systems, and high-performing websites that help businesses save time, generate leads, and scale faster.";

const FALLBACK_SOCIALS = [
  { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/in/tasbirrkabir" },
  { icon: Twitter, label: "X (Twitter)", href: "https://x.com/tasbirrkabir" },
  { icon: Github, label: "GitHub", href: "https://github.com/tasbirkabir" },
  { icon: Facebook, label: "Facebook", href: "https://www.facebook.com/share/1Tf65s6PB7/" },
  { icon: Mail, label: "Email", href: "mailto:tasbirrkabir@gmail.com" },
];

const FALLBACK_COLUMNS: { title: string; links: { label: string; view?: View; bookSlug?: string }[] }[] = [
  {
    title: "Explore",
    links: [
      { label: "Home", view: "home" },
      { label: "Books", view: "books" },
      { label: "Resources", view: "resources" },
      { label: "Blog", view: "blog" },
      { label: "Knowledge Hub", view: "knowledge" },
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

export function Footer() {
  const navigate = useNav((s) => s.navigate);
  const { data: settingsData } = useData<{ settings: any }>("/api/settings");
  const s = settingsData?.settings ?? null;

  const brandName = s?.brandName ?? "Tasbir Kabir";
  const bio = s?.footerBio ?? FALLBACK_BIO;
  const copyright = s?.footerCopyright ?? "Tasbir Kabir — AI Consultant & Web Developer";
  const tagline = s?.footerTagline ?? "Build · Automate · Scale · Optimize · Repeat";

  // Social links from settings, falling back to hardcoded list.
  const socials = s
    ? [
        { icon: Linkedin, label: "LinkedIn", href: s.socialLinkedin },
        { icon: Twitter, label: "X (Twitter)", href: s.socialTwitter },
        { icon: Github, label: "GitHub", href: s.socialGithub },
        { icon: Facebook, label: "Facebook", href: s.socialFacebook },
        { icon: Mail, label: "Email", href: s.socialEmail },
      ].filter((x) => x.href)
    : FALLBACK_SOCIALS;

  // Footer columns from settings (navigate by view), else hardcoded fallback.
  const cols =
    Array.isArray(s?.footerColumns) && s.footerColumns.length
      ? (s.footerColumns as { title: string; links: { label: string; view?: string; bookSlug?: string }[] }[])
      : FALLBACK_COLUMNS;

  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border/60 bg-muted/30 pb-safe-nav md:pb-0">
      <div className="mx-auto max-w-7xl px-5 py-12 sm:px-8 sm:py-16">
        <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <button onClick={() => navigate("home")} className="flex items-center gap-2.5">
              <Logo size={36} rounded="rounded-full" />
              <span className="font-display text-xl tracking-tight">{brandName}</span>
            </button>
            <p className="mt-4 max-w-sm font-reader text-sm leading-relaxed text-muted-foreground">
              {bio}
            </p>
            <div className="mt-5 flex items-center gap-2">
              {socials.map(({ icon: Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  target={href?.startsWith("mailto") ? undefined : "_blank"}
                  rel={href?.startsWith("mailto") ? undefined : "noopener noreferrer"}
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
                      onClick={() => navigate((l.view as View) ?? "home", { bookSlug: l.bookSlug })}
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
          <p>© {year} {copyright}. All rights reserved.</p>
          <p className="font-reader italic">{tagline}</p>
        </div>
      </div>
    </footer>
  );
}
