/**
 * Default content for the homepage, about page, and footer.
 *
 * The admin can edit all of this from the Site Settings panel; these defaults
 * are used the first time the site loads (before the admin has saved anything)
 * and as the seed shape the admin editor starts from.
 */

export type StatItem = { icon: string; value: string; label: string };
export type WhatIBuildItem = { icon: string; title: string; desc: string };
export type ServiceItem = { icon: string; title: string; desc: string; stack: string };
export type ProcessItem = { icon: string; step: string; title: string; desc: string };
export type TimelineItem = { year: string; title: string; desc: string };
export type AchievementItem = { value: string; label: string };
export type FooterLink = { label: string; view?: string; bookSlug?: string };
export type FooterColumn = { title: string; links: FooterLink[] };
export type NavItem = { label: string; view: string };

export const DEFAULT_STATS: StatItem[] = [
  { icon: "Rocket", value: "60+", label: "Projects completed" },
  { icon: "Globe", value: "100+", label: "Websites built" },
  { icon: "Workflow", value: "15+", label: "Workflows created" },
  { icon: "ThumbsUp", value: "98%", label: "Client satisfaction" },
];

export const DEFAULT_WHAT_I_BUILD: WhatIBuildItem[] = [
  { icon: "Bot", title: "AI Agents", desc: "Custom AI systems that automate workflows and business operations." },
  { icon: "Workflow", title: "Automation Systems", desc: "End-to-end automation for marketing, sales and operations." },
  { icon: "Globe", title: "High-Performance Websites", desc: "Fast, conversion-focused websites built to scale." },
  { icon: "TrendingUp", title: "Growth Systems", desc: "Tracking, funnels, analytics and performance optimization." },
  { icon: "BookOpen", title: "Digital Products", desc: "Ebooks, frameworks, templates and business resources." },
];

export const DEFAULT_SERVICES: ServiceItem[] = [
  { icon: "Bot", title: "AI Agents", desc: "Custom AI agents that handle customer interactions, lead qualification, support tasks, data processing, and business operations — working around the clock.", stack: "OpenAI · Claude · n8n" },
  { icon: "Workflow", title: "Automation Systems", desc: "Smart workflows that connect your tools, streamline repetitive processes, automate lead management, and improve operational efficiency.", stack: "n8n · Make · API Integrations" },
  { icon: "Globe", title: "AI-Integrated Web Development", desc: "Modern websites enhanced with AI-powered features, automation, lead generation systems, and conversion-focused experiences.", stack: "WordPress · AI Features · Optimization" },
  { icon: "Megaphone", title: "AI Consulting & Media Buying", desc: "Strategy and media buying that puts AI to work on acquisition — from intelligent workflows to conversion-focused campaigns.", stack: "Strategy · Ads · Analytics" },
];

export const DEFAULT_PROCESS: ProcessItem[] = [
  { icon: "Search", step: "01", title: "Understand", desc: "First I map your business or goal — where time is leaking, and where AI fits best." },
  { icon: "Hammer", step: "02", title: "Build", desc: "Agent or automation designed + built — fast, tested, and plugged into your real workflow." },
  { icon: "GraduationCap", step: "03", title: "Learn", desc: "I don't just deliver — I teach you how to run and modify the system yourself, step by step." },
  { icon: "TrendingUp", step: "04", title: "Scale", desc: "Once the system runs, we scale it across more brands, more products, more income streams." },
];

export const DEFAULT_TIMELINE: TimelineItem[] = [
  { year: "Start", title: "Began building websites", desc: "Started helping businesses establish and grow their digital presence through websites and marketing systems." },
  { year: "Growth", title: "Discovered automation", desc: "Realized many repetitive processes could be streamlined and enhanced using automation tools like n8n and Make." },
  { year: "AI era", title: "Went all-in on AI", desc: "Began building AI agents, automation systems, and AI-integrated websites that help businesses operate more efficiently." },
  { year: "Today", title: "60+ projects delivered", desc: "Now serving clients globally from Dhaka, Bangladesh — combining AI and digital strategy to create systems that drive real growth." },
];

export const DEFAULT_ACHIEVEMENTS: AchievementItem[] = [
  { value: "60+", label: "Projects completed" },
  { value: "100+", label: "Websites built" },
  { value: "15+", label: "Workflows created" },
  { value: "98%", label: "Client satisfaction" },
];

export const DEFAULT_FOOTER_COLUMNS: FooterColumn[] = [
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

export const DEFAULT_NAV_ITEMS: NavItem[] = [];

/** JSON array fields stored as strings in the DB. */
export const SETTINGS_JSON_FIELDS = [
  "navItems",
  "homeStats",
  "homeWhatIBuild",
  "aboutServices",
  "aboutProcess",
  "aboutTimeline",
  "aboutAchievements",
  "footerColumns",
] as const;

/** Parse a settings DB row into a client-friendly object (JSON arrays decoded, defaults applied). */
export function parseSettings(row: any) {
  if (!row) return null;
  const parsed: any = { ...row };
  for (const f of SETTINGS_JSON_FIELDS) {
    try {
      const raw = row[f];
      parsed[f] = raw ? JSON.parse(raw) : [];
    } catch {
      parsed[f] = [];
    }
  }
  // Apply defaults when empty so the frontend always has content to render.
  if (!parsed.homeStats?.length) parsed.homeStats = DEFAULT_STATS;
  if (!parsed.homeWhatIBuild?.length) parsed.homeWhatIBuild = DEFAULT_WHAT_I_BUILD;
  if (!parsed.aboutServices?.length) parsed.aboutServices = DEFAULT_SERVICES;
  if (!parsed.aboutProcess?.length) parsed.aboutProcess = DEFAULT_PROCESS;
  if (!parsed.aboutTimeline?.length) parsed.aboutTimeline = DEFAULT_TIMELINE;
  if (!parsed.aboutAchievements?.length) parsed.aboutAchievements = DEFAULT_ACHIEVEMENTS;
  if (!parsed.footerColumns?.length) parsed.footerColumns = DEFAULT_FOOTER_COLUMNS;
  if (!parsed.navItems?.length) parsed.navItems = DEFAULT_NAV_ITEMS;
  return parsed;
}

/** Stringify JSON array fields for DB persistence. Returns the DB-shaped object. */
export function serializeSettingsForDb(body: any) {
  const data: any = { ...body };
  for (const f of SETTINGS_JSON_FIELDS) {
    if (Array.isArray(body[f])) data[f] = JSON.stringify(body[f]);
  }
  return data;
}
