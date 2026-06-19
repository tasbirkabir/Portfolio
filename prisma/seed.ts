import { PrismaClient } from "@prisma/client";
import { db } from "../src/lib/db";

// ---------- Reader content type ----------
type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

const featuredContent: ReaderChapter[] = [
  {
    id: "ch-1",
    title: "The New Agency Model",
    sections: [
      {
        heading: "Why most agencies stall at $10k/month",
        body: [
          "Most service businesses hit a ceiling they cannot explain. The founders are talented, the clients are happy, the work is good — and yet the business refuses to grow. Revenue flattens. Margins compress. The founder becomes the bottleneck for every decision, every deliverable, every invoice.",
          "The ceiling is not a talent problem. It is a systems problem. A business without an operating system is a person doing many jobs manually, forever. You are not running a company; you are performing one, night after night, with no understudy.",
          "This book is about building the operating system that removes you as the bottleneck. It is the exact framework I used to take a one-person service business from chaotic freelancing into a productized, profitable, semi-automated agency that runs on systems instead of willpower.",
        ],
      },
      {
        heading: "The four pillars of an AI-native agency",
        body: [
          "An operating system has four pillars: Build, Track, Advertise, Convert. Each pillar is a set of repeatable processes. Together they form a loop that compounds.",
          "Build is how you deliver value. Track is how you measure reality. Advertise is how you create demand. Convert is how you turn attention into revenue. When one pillar is weak, the whole machine wobbles. When all four are strong, growth becomes almost boring.",
          "AI does not replace these pillars — it multiplies them. A builder with AI ships ten times the output. A tracker with AI sees patterns instantly. An advertiser with AI tests a hundred messages a day. A converter with AI personalizes every conversation. The agencies that win the next decade will not be the ones that use AI occasionally. They will be the ones architected around it.",
        ],
      },
    ],
  },
  {
    id: "ch-2",
    title: "Build: The Delivery Engine",
    sections: [
      {
        heading: "Productize before you scale",
        body: [
          "Before you can automate delivery, you must standardize it. A service that is custom every time cannot be systematized. The first job of the Build pillar is to define your offer so tightly that any qualified operator could deliver it by following a playbook.",
          "Productization is not about rigidity. It is about defaults. You define the 80% that should always happen the same way, and you leave room for the 20% that requires judgment. The 80% becomes your assembly line. The 20% becomes your craft.",
          "Write down every step of your last three projects. Circle the steps that repeated. Those circles are the skeleton of your delivery system. Everything else is variation you charge a premium for.",
        ],
      },
      {
        heading: "Building AI into the workflow",
        body: [
          "The agencies that win treat AI as a teammate with a job description. It is not a chat box you poke when you are stuck. It is a station on your assembly line, with inputs, outputs, and quality checks.",
          "Map your delivery process as a sequence of stations. At each station, ask: could an AI produce a strong first draft here? If yes, redesign the station so a human reviews and refines rather than writes from scratch. The human becomes an editor, not an author. Editors are faster, cheaper, and often higher quality — because they start with raw material instead of a blank page.",
          "This single shift — author to editor — is the most leverage you will ever create in a service business. A writer produces one draft. An editor polishes five. Multiply that across every deliverable, every client, every week.",
        ],
      },
    ],
  },
  {
    id: "ch-3",
    title: "Track: The Feedback Loop",
    sections: [
      {
        heading: "You cannot improve what you do not measure",
        body: [
          "Most agencies track revenue and little else. Revenue is a lagging indicator — by the time it moves, the cause is weeks behind you. You need leading indicators: the signals that tell you whether next month will be good before next month arrives.",
          "For a service business, the three numbers that matter most are lead flow, conversion rate, and delivery capacity. Lead flow tells you about future revenue. Conversion rate tells you about the health of your offer. Delivery capacity tells you whether you can actually take the work on.",
          "When all three rise together, you have a growth engine. When one stalls, you know exactly where to look. This is the difference between flying with instruments and flying by feel. Feel works until the weather changes.",
        ],
      },
      {
        heading: "The weekly review ritual",
        body: [
          "A dashboard is useless without a ritual. Every Monday morning, spend thirty minutes with your numbers. Not to feel good or bad about them — to decide what to do this week because of them.",
          "Ask three questions: What is working and worth doubling? What is broken and worth fixing? What is missing and worth starting? Write one action for each. Do them before Friday. This is the loop that turns measurement into improvement.",
          "Systems compound because they are reviewed. A dashboard you never look at is decoration. A dashboard you act on weekly is a strategy.",
        ],
      },
    ],
  },
  {
    id: "ch-4",
    title: "Advertise: The Demand Machine",
    sections: [
      {
        heading: "Attention is the raw material",
        body: [
          "Every business is in the attention business. Before someone can buy from you, they must know you exist, trust your expertise, and remember you when they have a problem. Advertising is the systematic creation of that knowledge, trust, and recall.",
          "The cheapest advertising you will ever produce is content. A useful article compounds for years. A helpful thread travels while you sleep. A sharp framework earns you the right to be recommended. Paid ads amplify what works; they rarely rescue what does not.",
          "Build a content engine that runs on a schedule, not on inspiration. Inspiration is unreliable. Schedules ship. The agencies with the strongest pipelines are not the most creative — they are the most consistent.",
        ],
      },
      {
        heading: "The content-to-client pipeline",
        body: [
          "Treat content as the top of your sales funnel, not as a side project. Every piece should do one of three jobs: attract a new audience, nurture an existing one, or convert a warm lead. If a piece does none of these, it is a hobby, not marketing.",
          "The highest-leverage content is the framework. A named, visual framework gives people a mental hook to remember you by. When someone hears your framework referenced in conversation, you have entered their consideration set without lifting a finger.",
          "Your job is to become the person whose framework gets quoted. That is how a personal brand becomes a demand machine — not through volume, but through becoming the default reference in your category.",
        ],
      },
    ],
  },
  {
    id: "ch-5",
    title: "Convert: The Last Mile",
    sections: [
      {
        heading: "The offer is everything",
        body: [
          "Conversion is not a trick. It is the natural consequence of a clear offer meeting a real need at a fair price. If you are not converting, the leak is almost always upstream: the wrong audience, the wrong promise, or the wrong proof.",
          "A great offer answers four questions before they are asked: What exactly do I get? How long does it take? What does it cost? Why you and not someone cheaper? Answer all four in the first screen of your sales page and you will convert better than any button color ever could.",
          "Proof is the multiplier. Testimonials, case studies, samples, guarantees — each removes a reason to hesitate. The job of a sales page is not to persuade. It is to remove every objection until saying yes feels obvious.",
        ],
      },
      {
        heading: "Making the ask repeatable",
        body: [
          "Conversion is also a system. You should know your average reply rate, your call-to-close rate, and your average deal size. These three numbers tell you exactly how many conversations you need to hit your revenue target.",
          "When conversion is a system, scaling becomes arithmetic. To double revenue, double the inputs or double the rates. Both are now levers you can pull deliberately, instead of hoping for a good month.",
          "The agencies that scale never treat sales as mysterious. They treat it as mechanical. And machines, unlike moods, can be improved.",
        ],
      },
    ],
  },
];

const previewContent: ReaderChapter[] = [
  {
    id: "preview",
    title: "Introduction",
    sections: [
      {
        heading: "A note before you begin",
        body: [
          "This is a preview of the opening of the book. The full version includes every chapter, every framework, and every template referenced inside.",
          "What you are about to read is not theory. It is a working operating system, refined across dozens of projects and stripped down to what actually moves the needle.",
          "Grab a notebook. The frameworks inside are meant to be used, not just read.",
        ],
      },
    ],
  },
];

// ---------- Books ----------
const books = [
  {
    title: "The AI Agency Operating System",
    slug: "ai-agency-operating-system",
    subtitle: "Build, Track, Advertise, Convert — the complete framework for a productized, AI-native agency.",
    description:
      "The operating system behind a modern service business. This is the exact framework I used to turn chaotic freelancing into a productized, profitable agency that runs on systems instead of willpower. Four pillars — Build, Track, Advertise, Convert — wired together into a compounding loop, with AI integrated at every station.",
    price: 19,
    originalPrice: 39,
    pages: 124,
    category: "AI Business",
    accent: "#1a1a1a",
    coverStyle: "editorial",
    badge: "Bestseller",
    featured: true,
    rating: 4.9,
    reviewsCount: 412,
    buyers: 3820,
    whatYouLearn: [
      "How to productize a custom service into a repeatable delivery system",
      "The four-pillar operating system: Build, Track, Advertise, Convert",
      "Integrating AI into each station of your workflow as a teammate, not a toy",
      "Leading vs lagging indicators — and the three numbers that actually predict growth",
      "A weekly review ritual that turns measurement into improvement",
      "How to build a content-to-client pipeline that compounds while you sleep",
      "The anatomy of a high-converting offer and sales page",
      "Frameworks, checklists, and templates you can deploy this week",
    ],
    chapters: [
      { title: "The New Agency Model", pages: 18 },
      { title: "Build: The Delivery Engine", pages: 26 },
      { title: "Track: The Feedback Loop", pages: 22 },
      { title: "Advertise: The Demand Machine", pages: 28 },
      { title: "Convert: The Last Mile", pages: 20 },
      { title: "Wiring It All Together", pages: 10 },
    ],
    faq: [
      { q: "Is this for beginners or established agencies?", a: "Both. If you are starting, it gives you the operating system to build on. If you are established, it gives you the missing systems that are capping your growth. Every framework is explained from first principles." },
      { q: "Do I need technical skills to use the AI parts?", a: "No. The AI integration is workflow-level, not code-level. If you can use a chat tool and follow a checklist, you can run every system in the book." },
      { q: "What format is the book?", a: "A 124-page ebook plus a built-in premium reader with bookmarks, highlights, notes, dark mode, and progress tracking. You also get every template and checklist as downloadable resources." },
      { q: "How long until I see results?", a: "Most readers deploy the weekly review ritual and the offer framework in the first week. The full operating system is a 30–90 day build, depending on where you start." },
      { q: "Is there a guarantee?", a: "Yes. If the frameworks do not pay for themselves in 30 days, email me and I will refund you in full. No forms, no friction." },
    ],
    highlights: [
      "124 pages of frameworks, not fluff",
      "Built-in premium ebook reader",
      "Every template & checklist included",
      "30-day no-questions refund",
    ],
    content: JSON.stringify(featuredContent),
  },
  {
    title: "The Solo Scale Playbook",
    slug: "solo-scale-playbook",
    subtitle: "How to grow a one-person business past six figures without hiring a team.",
    description:
      "The exact playbook for staying solo and scaling anyway. Productize your offer, automate the busywork, and build a business that earns like a team but runs like a solopreneur.",
    price: 15,
    originalPrice: 29,
    pages: 96,
    category: "Freelance",
    accent: "#b45309",
    coverStyle: "duotone",
    badge: "Popular",
    featured: false,
    rating: 4.8,
    reviewsCount: 286,
    buyers: 1940,
    whatYouLearn: [
      "Productizing a service so it sells while you sleep",
      "Automation stacks that replace a junior hire",
      "Pricing for leverage instead of hours",
      "The 3-client model that replaces a full roster",
    ],
    chapters: [
      { title: "The Solo Advantage", pages: 14 },
      { title: "Productize or Perish", pages: 20 },
      { title: "The Automation Stack", pages: 22 },
      { title: "Pricing for Leverage", pages: 18 },
      { title: "The 3-Client Model", pages: 12 },
      { title: "Staying Sane at Scale", pages: 10 },
    ],
    faq: [
      { q: "I already have clients. Will this help?", a: "Yes — the playbook is built for working solopreneurs who want fewer clients, higher rates, and more leverage, not people starting from zero." },
      { q: "Do I need to know how to code to automate?", a: "No. Every automation uses no-code tools and clear recipes." },
    ],
    highlights: ["96 pages", "10 no-code automation recipes", "Pricing calculator included"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Content OS",
    slug: "content-os",
    subtitle: "The framework for turning content into a client pipeline that compounds.",
    description:
      "A complete content operating system. Define your pillars, build a repeatable production engine, and turn every post into a step in your sales funnel.",
    price: 17,
    pages: 88,
    category: "Marketing",
    accent: "#0f766e",
    coverStyle: "grid",
    badge: "New",
    featured: false,
    rating: 4.7,
    reviewsCount: 174,
    buyers: 1210,
    whatYouLearn: [
      "The 4 content pillars that feed a pipeline",
      "A production system that runs on schedule, not inspiration",
      "Repurposing one idea into ten assets",
      "The framework-first content strategy",
    ],
    chapters: [
      { title: "Content as a System", pages: 12 },
      { title: "The Four Pillars", pages: 18 },
      { title: "Production Engine", pages: 20 },
      { title: "Repurposing at Scale", pages: 16 },
      { title: "Framework-First Strategy", pages: 14 },
      { title: "Measuring What Matters", pages: 8 },
    ],
    faq: [
      { q: "I am not a writer. Will this work?", a: "The system is built around frameworks and templates, not prose talent. AI handles first drafts; you refine." },
    ],
    highlights: ["88 pages", "Content calendar template", "30-day content plan"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Deep Work for Builders",
    slug: "deep-work-for-builders",
    subtitle: "A focus system for makers who ship in a world built to distract them.",
    description:
      "The modern focus system for people who build for a living. Reclaim deep work, design your environment for attention, and ship the work that actually matters.",
    price: 12,
    pages: 72,
    category: "Productivity",
    accent: "#7c2d12",
    coverStyle: "mono",
    featured: false,
    rating: 4.8,
    reviewsCount: 321,
    buyers: 2480,
    whatYouLearn: [
      "Designing an environment for deep work",
      "The builder's daily architecture",
      "Killing the notifications that kill focus",
      "Shipping rituals that beat resistance",
    ],
    chapters: [
      { title: "The Attention Crisis", pages: 10 },
      { title: "Environment Design", pages: 14 },
      { title: "The Builder's Day", pages: 16 },
      { title: "Rituals Over Willpower", pages: 14 },
      { title: "Shipping as a Habit", pages: 10 },
      { title: "Protecting the Work", pages: 8 },
    ],
    faq: [{ q: "Is this just another productivity book?", a: "No. It is a system designed specifically for builders — people whose output is creative and whose enemy is fragmentation." }],
    highlights: ["72 pages", "Daily architecture template", "Focus environment checklist"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "The Prompt Engineering Bible",
    slug: "prompt-engineering-bible",
    subtitle: "From basics to production: the complete guide to making AI do real work.",
    description:
      "The definitive guide to prompt engineering for builders. From first principles to production-grade prompt systems, chains, and evaluation loops.",
    price: 24,
    originalPrice: 49,
    pages: 142,
    category: "AI",
    accent: "#1e3a8a",
    coverStyle: "stack",
    badge: "Bestseller",
    featured: false,
    rating: 4.9,
    reviewsCount: 508,
    buyers: 4100,
    whatYouLearn: [
      "The anatomy of a production-grade prompt",
      "Chaining prompts into reliable systems",
      "Evaluation loops that measure quality",
      "Building a personal prompt library",
    ],
    chapters: [
      { title: "First Principles", pages: 18 },
      { title: "Anatomy of a Prompt", pages: 24 },
      { title: "Chaining & Systems", pages: 30 },
      { title: "Evaluation Loops", pages: 26 },
      { title: "The Prompt Library", pages: 24 },
      { title: "Production Patterns", pages: 20 },
    ],
    faq: [{ q: "Which models does this cover?", a: "The principles are model-agnostic and work across all major LLMs. Examples use current frontier models." }],
    highlights: ["142 pages", "50+ production prompts", "Evaluation framework included"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Landing Pages That Convert",
    slug: "landing-pages-that-convert",
    subtitle: "The anatomy of pages that turn strangers into buyers.",
    description:
      "A teardown-driven guide to high-converting landing pages. Learn the architecture of pages that sell, with annotated examples and a copy-and-paste framework.",
    price: 14,
    pages: 64,
    category: "Marketing",
    accent: "#9d174d",
    coverStyle: "grid",
    featured: false,
    rating: 4.6,
    reviewsCount: 142,
    buyers: 980,
    whatYouLearn: [
      "The 7-block landing page architecture",
      "Writing headlines that stop the scroll",
      "Proof stacks that remove objections",
      "The single-ask principle",
    ],
    chapters: [
      { title: "The Conversion Brief", pages: 8 },
      { title: "The 7-Block Architecture", pages: 16 },
      { title: "Headlines That Stop", pages: 12 },
      { title: "Proof Stacks", pages: 12 },
      { title: "The Single Ask", pages: 8 },
      { title: "Testing What Matters", pages: 8 },
    ],
    faq: [{ q: "Do I need to know how to design?", a: "No. The framework works with any page builder and the principles are design-agnostic." }],
    highlights: ["64 pages", "Annotated teardowns", "7-block page template"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "The $10K Month System",
    slug: "10k-month-system",
    subtitle: "A 90-day plan to your first consistent five-figure month as a solo operator.",
    description:
      "A 90-day operating plan to reach and sustain a $10,000/month run rate. Week-by-week actions, the exact offers, and the math that makes it work.",
    price: 18,
    originalPrice: 35,
    pages: 110,
    category: "Freelance",
    accent: "#15803d",
    coverStyle: "editorial",
    badge: "Popular",
    featured: false,
    rating: 4.7,
    reviewsCount: 233,
    buyers: 1670,
    whatYouLearn: [
      "The math of a $10k month",
      "Offers priced to hit the number",
      "A 90-day demand plan",
      "The retention loop that locks it in",
    ],
    chapters: [
      { title: "The Math", pages: 14 },
      { title: "Offers That Hit", pages: 22 },
      { title: "The 90-Day Plan", pages: 30 },
      { title: "Demand Generation", pages: 20 },
      { title: "The Retention Loop", pages: 16 },
      { title: "Sustaining It", pages: 8 },
    ],
    faq: [{ q: "Is $10k realistic in 90 days?", a: "For an established skill, yes — the plan is aggressive but achievable. For a brand-new skill, expect 6 months using the same system." }],
    highlights: ["110 pages", "90-day week-by-week plan", "Pricing & offer calculator"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Systems Thinking for Founders",
    slug: "systems-thinking-for-founders",
    subtitle: "See the loops, leverage points, and bottlenecks that run your business.",
    description:
      "A founder's guide to systems thinking. Learn to see your business as a set of loops, find the leverage points, and make changes that compound instead of changes that fade.",
    price: 16,
    pages: 98,
    category: "Frameworks",
    accent: "#4c1d95",
    coverStyle: "stack",
    featured: false,
    rating: 4.8,
    reviewsCount: 167,
    buyers: 1120,
    whatYouLearn: [
      "Reading your business as a system of loops",
      "Finding leverage points that compound",
      "Distinguishing fixes from fundamentals",
      "Designing feedback into everything",
    ],
    chapters: [
      { title: "The Founder's Lens", pages: 14 },
      { title: "Loops & Stocks", pages: 22 },
      { title: "Leverage Points", pages: 24 },
      { title: "Fixes vs Fundamentals", pages: 18 },
      { title: "Designing Feedback", pages: 14 },
      { title: "The Compound Founder", pages: 6 },
    ],
    faq: [{ q: "Is this too abstract for a busy founder?", a: "No — every concept is tied to a concrete business decision you have probably already faced." }],
    highlights: ["98 pages", "System-mapping worksheets", "Leverage point checklist"],
    content: JSON.stringify(previewContent),
  },
];

// ---------- Resources ----------
const resources = [
  { title: "The Offer One-Pager", slug: "offer-one-pager", description: "A one-page template to sharpen any offer in under an hour. Used to price and position every book on this site.", type: "template", category: "Offers", accent: "#1a1a1a", downloads: 4210, pages: 2 },
  { title: "Weekly Review Checklist", slug: "weekly-review-checklist", description: "The exact 30-minute Monday ritual that turns numbers into actions. Print it, pin it, run it.", type: "checklist", category: "Tracking", accent: "#0f766e", downloads: 3380, pages: 1 },
  { title: "AI Agency Prompt Pack", slug: "ai-agency-prompt-pack", description: "24 production prompts for delivery, sales, and content — the ones I use every week.", type: "prompt-pack", category: "AI", accent: "#1e3a8a", downloads: 5620, pages: 18 },
  { title: "Landing Page Teardown Guide", slug: "landing-page-teardown-guide", description: "A step-by-step guide to auditing any landing page for conversion leaks.", type: "guide", category: "Marketing", accent: "#9d174d", downloads: 2190, pages: 12 },
  { title: "Pricing Calculator", slug: "pricing-calculator", description: "A simple spreadsheet that prices your work for leverage instead of hours.", type: "template", category: "Pricing", accent: "#b45309", downloads: 3870, pages: 1 },
  { title: "Content Calendar Framework", slug: "content-calendar-framework", description: "The 4-pillar content calendar that turns posting into a pipeline.", type: "template", category: "Content", accent: "#15803d", downloads: 2940, pages: 3 },
  { title: "The Solo Operator's Playbook", slug: "solo-operator-playbook", description: "A free 22-page PDF intro to productizing a service business.", type: "pdf", category: "Freelance", accent: "#7c2d12", downloads: 6810, pages: 22 },
  { title: "Focus Environment Checklist", slug: "focus-environment-checklist", description: "Audit your workspace for the friction that quietly kills deep work.", type: "checklist", category: "Productivity", accent: "#4c1d95", downloads: 1760, pages: 1 },
];

// ---------- Blog posts ----------
const blogPosts = [
  {
    title: "The Compounding Founder: Why Systems Beat Hustle Every Time",
    slug: "compounding-founder-systems-beat-hustle",
    excerpt: "Hustle is linear. Systems are exponential. The difference between a founder who burns out at year three and one who compounds for a decade is almost never talent — it is whether the business has an operating system.",
    category: "Frameworks",
    readTime: 8,
    cover: "/images/blog-systems.jpg",
    featured: true,
    content: `Hustle is linear. Systems are exponential.

The difference between a founder who burns out at year three and one who compounds for a decade is almost never talent. It is whether the business has an operating system underneath it — a set of repeatable processes that produce results whether the founder is inspired or exhausted.

## The trap of heroic effort

Most early businesses run on heroic effort. The founder is the sales team, the delivery team, the marketing team, and the cleanup crew. It works, for a while, because heroes can do impossible things in short bursts.

But heroic effort has a half-life. It degrades under stress, under sleep debt, under the thousand small decisions a week demands. A business built on heroics is a business one bad month away from collapse.

## What a system actually is

A system is not a Notion template. A system is a decision you make once, codify, and never have to make again. It is a default. Every default you set is a unit of attention you reclaim for the work that actually requires you.

The agencies that scale are not smarter. They have simply made more decisions into defaults. Their offer is a default. Their onboarding is a default. Their pricing is a default. Their content cadence is a default. The founder's job shrinks from "make every decision" to "decide which defaults to change this quarter."

## The compounding effect

Systems compound in a way heroics cannot. A process improved by ten percent this month is improved by ten percent forever. A habit installed once pays dividends daily. A framework documented once can be handed to someone else — which is the only way a business ever gets larger than its founder.

This is the real reason to build systems. Not because they are tidy, but because they are the only mechanism by which a business becomes worth more than the person running it.

If your business cannot run without you for two weeks, you do not have a business. You have a job with good branding. The work of the next year is to change that — one default at a time.`,
  },
  {
    title: "How I Built a Content Engine That Runs While I Sleep",
    slug: "content-engine-that-runs-while-i-sleep",
    excerpt: "Content is the cheapest advertising you will ever produce — if it is built as a system, not a side project. Here is the exact engine behind every post on this site.",
    category: "Marketing",
    readTime: 11,
    cover: "/images/blog-content.jpg",
    featured: false,
    content: `Content is the cheapest advertising you will ever produce.

A useful article compounds for years. A sharp framework earns you the right to be recommended. Paid ads amplify what works — they rarely rescue what does not.

But only if content is built as a system, not a side project. Here is the engine behind every post on this site.

## The four pillars

Every piece of content I publish does one of four jobs: it attracts a new audience, it nurtures an existing one, it converts a warm lead, or it compounds as a reference. If a piece does none of these, it is a hobby, not marketing.

Attraction content is the top of the funnel — ideas broad enough to reach strangers. Nurture content deepens the relationship with people who already know me. Conversion content makes the ask. Reference content — frameworks, teardowns, deep guides — is the library that earns search traffic and inbound trust for years.

## The production system

I do not write when I am inspired. I write on a schedule. Inspiration is unreliable; schedules ship.

The system is simple: one framework per week, two shorter pieces that repurpose it, and one deep reference post per month. Everything starts from a single idea and gets sliced into the formats that fit each platform.

The leverage is in the slicing. One framework becomes a long-form post, a thread, a carousel, a newsletter section, and a video script. Same idea, five assets. This is how a solo operator keeps up with teams.

## Why it compounds

The magic is that content never expires. An article I wrote two years ago still sends clients every month. A framework still gets quoted in conversations I am not in. The work I did once keeps paying — and the more I add, the larger the surface area that catches attention.

This is the real argument for consistency over brilliance. A hundred decent posts, shipped on schedule, will outperform ten perfect posts shipped whenever you felt ready. The library is the asset. Build the library.`,
  },
  {
    title: "Scaling Past Six Figures Without Hiring a Team",
    slug: "scaling-past-six-figures-without-hiring",
    excerpt: "You do not need a team to scale. You need leverage. Here is how to grow a one-person business past six figures using productization, automation, and pricing — not payroll.",
    category: "Freelance",
    readTime: 9,
    cover: "/images/blog-scale.jpg",
    featured: false,
    content: `You do not need a team to scale. You need leverage.

The dream of "scaling" has been quietly rewritten as "hiring." But hiring is one form of leverage, and it is the most expensive, most fragile form there is. Before you add payroll, exhaust the other three.

## Leverage one: productize

A custom service cannot be systematized. The first leverage move is to standardize the eighty percent of your work that repeats, and charge a premium for the twenty percent that requires judgment.

Productization is not rigidity. It is defaults. You define what always happens, and leave room for craft. The defaults become your assembly line. The craft becomes your margin.

## Leverage two: automate

Every repetitive task in your business is a candidate for automation. Invoices, onboarding, scheduling, follow-ups, reporting — each one is a junior hire you do not have to make.

The test is simple: if you do it more than once a week and it follows a pattern, a no-code tool can probably do it for you. Build the automation once, and it works for free forever.

## Leverage three: price

This is the most overlooked leverage of all. Doubling your prices is equivalent to doubling your output, but it takes an afternoon instead of a year.

Most solopreneurs underprice out of fear, not math. Run the numbers: how many clients do you actually need at your current price to hit your target? Now halve the client count and double the price. Same revenue, half the delivery load, twice the focus per client. That is leverage.

## The order matters

Do them in this order: productize first (so you have something scalable), automate second (so it runs without you), price third (so each unit is worth more). Only after all three are exhausted does hiring begin to make sense.

Most businesses hire to solve problems that productization, automation, and pricing would have solved cheaper. Don't be most businesses. Get your leverage in order first, and you may find you never need the team at all.`,
  },
];

// ---------- Testimonials ----------
const testimonials = [
  { name: "Marcus Lee", role: "Founder, Northwind Studio", quote: "I read a lot of business books. Most are 90% filler. This one is the opposite — I had to slow down because every page had something I wanted to implement. The Build pillar alone changed how my agency delivers.", rating: 5, bookSlug: "ai-agency-operating-system" },
  { name: "Priya Nair", role: "Solo Consultant", quote: "The weekly review ritual is the single highest-leverage habit I have ever adopted. Three months in, I can actually see my business instead of just feeling it. Worth ten times the price.", rating: 5, bookSlug: "ai-agency-operating-system" },
  { name: "David Okafor", role: "Agency Owner", quote: "I have bought dozens of courses. This book replaced most of them. It is a complete operating system, not a teaser for a $2,000 program. Refreshing and genuinely useful.", rating: 5, bookSlug: "ai-agency-operating-system" },
  { name: "Sarah Chen", role: "Freelance Designer", quote: "The pricing section paid for the book in the first week. I raised my rates using the framework, lost zero clients, and now work fewer hours for more money. I wish I had read this two years ago.", rating: 5, bookSlug: "solo-scale-playbook" },
  { name: "James Whitfield", role: "Content Strategist", quote: "Content OS is the first content framework that actually felt built for a pipeline, not for vanity metrics. My posts now do a job, and I can see which job each one is doing.", rating: 5, bookSlug: "content-os" },
  { name: "Amara Diallo", role: "Indie Maker", quote: "Deep Work for Builders is short, sharp, and shockingly effective. I redesigned my environment in a weekend and my output the following week was visibly different.", rating: 5, bookSlug: "deep-work-for-builders" },
];

async function main() {
  // Wipe & reseed
  await db.contactMessage.deleteMany();
  await db.newsletterSub.deleteMany();
  await db.testimonial.deleteMany();
  await db.blogPost.deleteMany();
  await db.resource.deleteMany();
  await db.book.deleteMany();

  for (const b of books) {
    await db.book.create({
      data: {
        ...b,
        whatYouLearn: JSON.stringify(b.whatYouLearn),
        chapters: JSON.stringify(b.chapters),
        faq: JSON.stringify(b.faq),
        highlights: JSON.stringify(b.highlights),
      },
    });
  }

  for (const r of resources) {
    await db.resource.create({ data: r });
  }

  for (const p of blogPosts) {
    await db.blogPost.create({ data: p });
  }

  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  console.log(`Seeded: ${books.length} books, ${resources.length} resources, ${blogPosts.length} posts, ${testimonials.length} testimonials`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
