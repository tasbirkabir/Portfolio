// Platform seed: admin user, site settings, demo orders, and re-seed content.
import { db } from "../src/lib/db";

// ---------- Reader content for the featured book ----------
const featuredContent = [
  {
    id: "ch-0",
    title: "Letter from Tasbir",
    sections: [
      { heading: "Overview", body: ["Dear Reader, If you've spent more than five minutes on social media recently, you've seen the promises.", "I built this book to be the exact opposite of that hype — a blueprint based on real campaigns, real setups, real client calls, and real software delivery.", "The AI agency opportunity is the most significant B2B leverage point of this decade. But it is only an opportunity for those who build real systems, sell real business outcomes, and deliver professional services."] },
      { heading: "The B2B Proof Manifesto", body: ["This operational blueprint has been stress-tested across numerous global B2B integrations. By treating automation as infrastructure rather than an administrative expense, we have consistently unlocked high-value, auditable outcomes.", "Medical Clinic Booking — AI voice receptionist: 38 patient bookings in 30 days, freeing 8 receptionist hours/week.", "Recruitment Agency — multi-model CV extraction: reduced screening times by 60%.", "High-Ticket Lead Gen — cold email automation: signed 3 accounts in 2.5 months, generating $12,000/mo MRR.", "Shopify E-Commerce — RAG support bot: resolved 78% of tickets automatically, saving $3,000/month."] },
      { heading: "My Origin Story — The First Client", body: ["When I started in AI automation, I fell into the same traps most beginners do. I spent days designing a logo, setting up a website, and perfecting my email signature. I felt like an agency owner, but I had zero revenue.", "My shift happened when I stopped looking at tools like n8n and Make as technical toys, and started looking at them as problem-solving engines. I found a local clinic owner who was losing patients because their receptionist couldn't answer calls.", "I offered to build a missed-call auto-SMS loop for free for one week. It captured four patients who would have gone to competitors. The owner signed the check, set up a maintenance retainer, and referred me to two colleagues.", "That first client taught me that business owners do not care about n8n nodes, API keys, or AI reasoning loops. They care about appointments, hours saved, and revenue. That is the outcome-first philosophy this book is built on."] },
    ],
  },
  {
    id: "ch-1",
    title: "What Is an AI Agency, Really?",
    sections: [
      { heading: "Dismantling the Myths", body: ["Everyone seems to be talking about 'starting an AI agency' in 2026. The result? Most people start with a completely wrong mental model — and they fail within 60 days, not because they lack intelligence or work ethic, but because they were building on a broken foundation.", "The biggest misconception is confusing an AI services business (an agency) with an AI software business (a SaaS product). An AI agency does not sell software. An AI agency sells outcomes. You are a service provider who uses AI as your tool to solve specific, expensive operational bottlenecks.", "Business owners are not technical. When you explain n8n, they hear complexity. Complexity represents risk. Risk prevents them from signing. When you explain '5 hours of staff time saved weekly' or 'missed calls answered instantly', they hear efficiency and revenue. These are outcomes they gladly pay for."] },
      { heading: "The $1T Automation Gap", body: ["There is a massive divide in the economy today. Enterprise companies have large budgets to hire consultant firms to build AI integrations. Small-to-midmarket local businesses have no such budgets, yet they suffer from the exact same operational inefficiencies: 62% of calls go unanswered, leads decay 10x after 5 minutes, and 10+ hours a week are lost to manual data entry.", "This is the $1T automation gap — the opportunity sitting between enterprise AI and the local businesses that desperately need it but cannot access it. Your agency fills that gap."] },
      { heading: "The Agency Triangle Framework", body: ["If any pillar is missing, the agency fails to scale. The three pillars are: 1) The Service — building automations, chatbots, or voice agents using SOPs. 2) The Client — finding leads, running outreach, closing sales, onboarding. 3) The Operations — SOPs, VAs, project tracking, billing, and reporting.", "Choose your model: Model A (Custom, $3k–$10k setup, 70% margin), Model B (Productized, $999–$2.5k, 90% margin — recommended for beginners), or Model C (White-Label, rev split, 80% margin).", "Start with Model B. Do not build custom systems. Choose one primary service, package it into a single productized offer at a fixed price. Once you have closed 3 clients, you will have the SOPs, confidence, and capital to expand."] },
    ],
  },
  {
    id: "ch-2",
    title: "The Founder Mindset",
    sections: [
      { heading: "Freelancer Brain vs. Founder Brain", body: ["The most common reason AI agencies fail is a mindset that was built for employment — never updated for ownership. A freelancer waits to be told what to work on, trades time for money, and sees marketing as an expense. A founder decides what matters, prices for leverage, and sees marketing as the engine.", "The shift feels uncomfortable. You will catch yourself doing busywork because it feels productive. The test: if the task does not lead to a client, a deliverable, or a system, it is not founder work."] },
      { heading: "The 5 Mental Traps that Stall Agency Growth", body: ["1. The Learning Loop — consuming tutorials instead of collecting clients. 2. The Perfectionism Trap — refining the brand instead of running outreach. 3. The Tool Addiction — chasing every new AI tool instead of mastering one stack. 4. The Discount Reflex — lowering prices to avoid rejection. 5. The Solo Trap — refusing to delegate because 'it's faster to do it myself.'", "Each trap feels productive in the moment and costs you months. The antidote is the same for all five: ship to real clients and let their feedback rewire your priorities."] },
      { heading: "High-Performance Scheduling System", body: ["08:00–10:00 Outbound Prospecting — scrape and qualify 50 niche contacts, add leads to CRM. 10:00–12:00 Custom Video Audits — record and dispatch 10 personalized Loom audits. 13:00–15:00 Core System Delivery — configure n8n/Make blueprints, build Vapi voice sandbox. 15:00–16:30 Follow-ups & CRM Hygiene — call warm replies, book discovery calls. 16:30–17:30 EOD Review & Prep — verify metrics, build next-day list.", "The schedule is the system. Protect the morning for acquisition; the afternoon can absorb delivery. Never let delivery crowd out prospecting — that is how agencies starve in 90 days."] },
    ],
  },
];

const previewContent = [
  { id: "preview", title: "Introduction", sections: [{ heading: "A note before you begin", body: ["This is a preview of the opening of the book. The full version includes every chapter, every framework, and every template referenced inside.", "Grab a notebook. The frameworks inside are meant to be used, not just read."] }] },
];

// ---------- Books ----------
const books = [
  {
    title: "The AI Agency Operating System", slug: "ai-agency-operating-system",
    subtitle: "Build, Track, Advertise, Convert — the complete framework for a productized, AI-native agency.",
    description: "The complete operating system for building, pricing, and scaling an AI services business in 2026. Sixteen chapters across the Blueprint, Foundation, Architecture, Monetization, Execution, and Scale — every framework, deep dive, rate card, and action plan I use to run real B2B campaigns, from missed-call voice agents to $30k/month productized retainers. Includes 5 real-world case studies and a 3-month execution timeline.",
    price: 19, originalPrice: 39, pages: 85, category: "AI Business", accent: "#1a1a1a", coverStyle: "editorial", badge: "Bestseller", featured: true,
    rating: 4.9, reviewsCount: 412, buyers: 3820, accessType: "paid",
    whatYouLearn: ["The outcome-first positioning framework that makes business owners buy", "The $1T automation gap and why midmarket businesses are the real opportunity", "The Agency Triangle: Service, Client, Operations — and why missing one kills scale", "Choosing your agency model: Custom, Productized, or White-Label", "High-income AI services: voice agents, automations, and chatbots — deep dives", "Pricing AI services with setup fees, retainers, and value-based anchors", "The 30-day first client playbook and the 5-phase discovery call", "Scaling from $10k to $30k/month with productized retainers and referrals"],
    chapters: [{ title: "Letter from Tasbir", pages: 6 }, { title: "What Is an AI Agency, Really?", pages: 6 }, { title: "The Founder Mindset", pages: 8 }, { title: "Choosing a Profitable Niche", pages: 4 }, { title: "High-Income AI Services", pages: 3 }, { title: "AI Voice Agents — Deep Dive", pages: 3 }, { title: "AI Automations — Deep Dive", pages: 2 }, { title: "AI Chatbots — Deep Dive", pages: 2 }, { title: "Pricing AI Services", pages: 4 }, { title: "Creating Offers That Sell", pages: 2 }, { title: "Finding Your First Clients", pages: 4 }, { title: "The Discovery Call & Sales", pages: 2 }, { title: "Delivering Projects & Onboarding", pages: 5 }, { title: "SOPs, Systems & Tech Stack", pages: 1 }, { title: "Scaling to $10K & $30K/Month", pages: 3 }, { title: "Future, Case Studies & Action Plan", pages: 3 }],
    faq: [{ q: "Is this for beginners or established agencies?", a: "Both. If you are starting, the Blueprint and Foundation parts give you the mental model and offer. If you are established, the Architecture, Execution, and Scale parts hand you the SOPs, pricing, and delivery systems that unlock the next tier." }, { q: "Do I need technical skills to build the AI services?", a: "No. The deep dives are written for builders using no-code/low-code tools like n8n, Make, and GoHighLevel. If you can follow a recipe, you can deliver these services." }, { q: "What format is the book?", a: "An 85-page ebook plus a built-in premium reader with bookmarks, highlights, notes, dark mode, search, and progress tracking. Every framework and action plan is included." }, { q: "How long until I see results?", a: "Most readers complete the Chapter 1 action plan in the first week and run their first outreach by week two. First client typically lands in 30–60 days." }, { q: "Is there a guarantee?", a: "Yes. If the frameworks do not pay for themselves in 30 days, email me and I will refund you in full. No forms, no friction." }],
    highlights: ["85 pages across 16 chapters", "Built-in premium ebook reader", "Every framework, rate card & action plan included", "5 real-world case studies + 3-month timeline", "30-day no-questions refund"],
    content: JSON.stringify(featuredContent),
  },
  {
    title: "The Solo Scale Playbook", slug: "solo-scale-playbook",
    subtitle: "How to grow a one-person business past six figures without hiring a team.",
    description: "The exact playbook for staying solo and scaling anyway. Productize your offer, automate the busywork, and build a business that earns like a team but runs like a solopreneur.",
    price: 15, originalPrice: 29, pages: 96, category: "Freelancing", accent: "#b45309", coverStyle: "duotone", badge: "Popular", featured: false,
    rating: 4.8, reviewsCount: 286, buyers: 1940, accessType: "paid",
    whatYouLearn: ["Productizing a service so it sells while you sleep", "Automation stacks that replace a junior hire", "Pricing for leverage instead of hours", "The 3-client model that replaces a full roster"],
    chapters: [{ title: "The Solo Advantage", pages: 14 }, { title: "Productize or Perish", pages: 20 }, { title: "The Automation Stack", pages: 22 }, { title: "Pricing for Leverage", pages: 18 }, { title: "The 3-Client Model", pages: 12 }, { title: "Staying Sane at Scale", pages: 10 }],
    faq: [{ q: "I already have clients. Will this help?", a: "Yes — the playbook is built for working solopreneurs who want fewer clients, higher rates, and more leverage." }, { q: "Do I need to know how to code to automate?", a: "No. Every automation uses no-code tools and clear recipes." }],
    highlights: ["96 pages", "10 no-code automation recipes", "Pricing calculator included"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Content OS", slug: "content-os",
    subtitle: "The framework for turning content into a client pipeline that compounds.",
    description: "A complete content operating system. Define your pillars, build a repeatable production engine, and turn every post into a step in your sales funnel.",
    price: 17, pages: 88, category: "Marketing", accent: "#0f766e", coverStyle: "grid", badge: "New", featured: false,
    rating: 4.7, reviewsCount: 174, buyers: 1210, accessType: "paid",
    whatYouLearn: ["The 4 content pillars that feed a pipeline", "A production system that runs on schedule, not inspiration", "Repurposing one idea into ten assets", "The framework-first content strategy"],
    chapters: [{ title: "Content as a System", pages: 12 }, { title: "The Four Pillars", pages: 18 }, { title: "Production Engine", pages: 20 }, { title: "Repurposing at Scale", pages: 16 }, { title: "Framework-First Strategy", pages: 14 }, { title: "Measuring What Matters", pages: 8 }],
    faq: [{ q: "I am not a writer. Will this work?", a: "The system is built around frameworks and templates, not prose talent. AI handles first drafts; you refine." }],
    highlights: ["88 pages", "Content calendar template", "30-day content plan"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Deep Work for Builders", slug: "deep-work-for-builders",
    subtitle: "A focus system for makers who ship in a world built to distract them.",
    description: "The modern focus system for people who build for a living. Reclaim deep work, design your environment for attention, and ship the work that actually matters.",
    price: 12, pages: 72, category: "Productivity", accent: "#7c2d12", coverStyle: "mono", featured: false,
    rating: 4.8, reviewsCount: 321, buyers: 2480, accessType: "paid",
    whatYouLearn: ["Designing an environment for deep work", "The builder's daily architecture", "Killing the notifications that kill focus", "Shipping rituals that beat resistance"],
    chapters: [{ title: "The Attention Crisis", pages: 10 }, { title: "Environment Design", pages: 14 }, { title: "The Builder's Day", pages: 16 }, { title: "Rituals Over Willpower", pages: 14 }, { title: "Shipping as a Habit", pages: 10 }, { title: "Protecting the Work", pages: 8 }],
    faq: [{ q: "Is this just another productivity book?", a: "No. It is a system designed specifically for builders — people whose output is creative and whose enemy is fragmentation." }],
    highlights: ["72 pages", "Daily architecture template", "Focus environment checklist"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "The Prompt Engineering Bible", slug: "prompt-engineering-bible",
    subtitle: "From basics to production: the complete guide to making AI do real work.",
    description: "The definitive guide to prompt engineering for builders. From first principles to production-grade prompt systems, chains, and evaluation loops.",
    price: 24, originalPrice: 49, pages: 142, category: "Automation", accent: "#1e3a8a", coverStyle: "stack", badge: "Bestseller", featured: false,
    rating: 4.9, reviewsCount: 508, buyers: 4100, accessType: "paid",
    whatYouLearn: ["The anatomy of a production-grade prompt", "Chaining prompts into reliable systems", "Evaluation loops that measure quality", "Building a personal prompt library"],
    chapters: [{ title: "First Principles", pages: 18 }, { title: "Anatomy of a Prompt", pages: 24 }, { title: "Chaining & Systems", pages: 30 }, { title: "Evaluation Loops", pages: 26 }, { title: "The Prompt Library", pages: 24 }, { title: "Production Patterns", pages: 20 }],
    faq: [{ q: "Which models does this cover?", a: "The principles are model-agnostic and work across all major LLMs." }],
    highlights: ["142 pages", "50+ production prompts", "Evaluation framework included"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Landing Pages That Convert", slug: "landing-pages-that-convert",
    subtitle: "The anatomy of pages that turn strangers into buyers.",
    description: "A teardown-driven guide to high-converting landing pages. Learn the architecture of pages that sell, with annotated examples and a copy-and-paste framework.",
    price: 14, pages: 64, category: "Marketing", accent: "#9d174d", coverStyle: "grid", featured: false,
    rating: 4.6, reviewsCount: 142, buyers: 980, accessType: "paid",
    whatYouLearn: ["The 7-block landing page architecture", "Writing headlines that stop the scroll", "Proof stacks that remove objections", "The single-ask principle"],
    chapters: [{ title: "The Conversion Brief", pages: 8 }, { title: "The 7-Block Architecture", pages: 16 }, { title: "Headlines That Stop", pages: 12 }, { title: "Proof Stacks", pages: 12 }, { title: "The Single Ask", pages: 8 }, { title: "Testing What Matters", pages: 8 }],
    faq: [{ q: "Do I need to know how to design?", a: "No. The framework works with any page builder." }],
    highlights: ["64 pages", "Annotated teardowns", "7-block page template"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "The $10K Month System", slug: "10k-month-system",
    subtitle: "A 90-day plan to your first consistent five-figure month as a solo operator.",
    description: "A 90-day operating plan to reach and sustain a $10,000/month run rate. Week-by-week actions, the exact offers, and the math that makes it work.",
    price: 18, originalPrice: 35, pages: 110, category: "Freelancing", accent: "#15803d", coverStyle: "editorial", badge: "Popular", featured: false,
    rating: 4.7, reviewsCount: 233, buyers: 1670, accessType: "paid",
    whatYouLearn: ["The math of a $10k month", "Offers priced to hit the number", "A 90-day demand plan", "The retention loop that locks it in"],
    chapters: [{ title: "The Math", pages: 14 }, { title: "Offers That Hit", pages: 22 }, { title: "The 90-Day Plan", pages: 30 }, { title: "Demand Generation", pages: 20 }, { title: "The Retention Loop", pages: 16 }, { title: "Sustaining It", pages: 8 }],
    faq: [{ q: "Is $10k realistic in 90 days?", a: "For an established skill, yes. For a brand-new skill, expect 6 months using the same system." }],
    highlights: ["110 pages", "90-day week-by-week plan", "Pricing & offer calculator"],
    content: JSON.stringify(previewContent),
  },
  {
    title: "Systems Thinking for Founders", slug: "systems-thinking-for-founders",
    subtitle: "See the loops, leverage points, and bottlenecks that run your business.",
    description: "A founder's guide to systems thinking. Learn to see your business as a set of loops, find the leverage points, and make changes that compound instead of changes that fade.",
    price: 16, pages: 98, category: "Systems", accent: "#4c1d95", coverStyle: "stack", featured: false,
    rating: 4.8, reviewsCount: 167, buyers: 1120, accessType: "paid",
    whatYouLearn: ["Reading your business as a system of loops", "Finding leverage points that compound", "Distinguishing fixes from fundamentals", "Designing feedback into everything"],
    chapters: [{ title: "The Founder's Lens", pages: 14 }, { title: "Loops & Stocks", pages: 22 }, { title: "Leverage Points", pages: 24 }, { title: "Fixes vs Fundamentals", pages: 18 }, { title: "Designing Feedback", pages: 14 }, { title: "The Compound Founder", pages: 6 }],
    faq: [{ q: "Is this too abstract for a busy founder?", a: "No — every concept is tied to a concrete business decision you have probably already faced." }],
    highlights: ["98 pages", "System-mapping worksheets", "Leverage point checklist"],
    content: JSON.stringify(previewContent),
  },
];

// ---------- Resources ----------
const resources = [
  { title: "The Offer One-Pager", slug: "offer-one-pager", description: "A one-page template to sharpen any offer in under an hour.", type: "template", category: "Offers", accent: "#1a1a1a", downloads: 4210, pages: 2, accessType: "free", price: 0 },
  { title: "Weekly Review Checklist", slug: "weekly-review-checklist", description: "The exact 30-minute Monday ritual that turns numbers into actions.", type: "checklist", category: "Tracking", accent: "#0f766e", downloads: 3380, pages: 1, accessType: "email-gate", price: 0 },
  { title: "AI Agency Prompt Pack", slug: "ai-agency-prompt-pack", description: "24 production prompts for delivery, sales, and content.", type: "prompt-pack", category: "AI", accent: "#1e3a8a", downloads: 5620, pages: 18, accessType: "email-gate", price: 0 },
  { title: "Landing Page Teardown Guide", slug: "landing-page-teardown-guide", description: "A step-by-step guide to auditing any landing page for conversion leaks.", type: "guide", category: "Marketing", accent: "#9d174d", downloads: 2190, pages: 12, accessType: "email-gate", price: 0 },
  { title: "Pricing Calculator", slug: "pricing-calculator", description: "A spreadsheet that prices your work for leverage instead of hours.", type: "template", category: "Pricing", accent: "#b45309", downloads: 3870, pages: 1, accessType: "free", price: 0 },
  { title: "Content Calendar Framework", slug: "content-calendar-framework", description: "The 4-pillar content calendar that turns posting into a pipeline.", type: "framework", category: "Content", accent: "#15803d", downloads: 2940, pages: 3, accessType: "free", price: 0 },
  { title: "The Solo Operator's Playbook", slug: "solo-operator-playbook", description: "A free 22-page PDF intro to productizing a service business.", type: "pdf", category: "Freelancing", accent: "#7c2d12", downloads: 6810, pages: 22, accessType: "free", price: 0 },
  { title: "Focus Environment Checklist", slug: "focus-environment-checklist", description: "Audit your workspace for the friction that quietly kills deep work.", type: "checklist", category: "Productivity", accent: "#4c1d95", downloads: 1760, pages: 1, accessType: "free", price: 0 },
  { title: "The Systems Swipe File", slug: "systems-swipe-file", description: "30 annotated systems, SOPs and workflows from real agencies.", type: "swipe-file", category: "Systems", accent: "#1a1a1a", downloads: 980, pages: 40, accessType: "paid", price: 9 },
  { title: "Automation Toolkit", slug: "automation-toolkit", description: "The complete n8n + Make blueprint pack for 12 agency workflows.", type: "toolkit", category: "Automation", accent: "#1e3a8a", downloads: 640, pages: 28, accessType: "paid", price: 12 },
];

// ---------- Blog posts ----------
const blogPosts = [
  { title: "The Compounding Founder: Why Systems Beat Hustle Every Time", slug: "compounding-founder-systems-beat-hustle", excerpt: "Hustle is linear. Systems are exponential. The difference between a founder who burns out at year three and one who compounds for a decade is almost never talent — it is whether the business has an operating system.", category: "Systems", readTime: 8, cover: "/images/blog-systems.jpg", featured: true, tags: '["systems","founder","compounding"]', content: "Hustle is linear. Systems are exponential.\n\nThe difference between a founder who burns out at year three and one who compounds for a decade is almost never talent. It is whether the business has an operating system underneath it — a set of repeatable processes that produce results whether the founder is inspired or exhausted.\n\n## The trap of heroic effort\n\nMost early businesses run on heroic effort. The founder is the sales team, the delivery team, the marketing team, and the cleanup crew. It works, for a while, because heroes can do impossible things in short bursts.\n\nBut heroic effort has a half-life. It degrades under stress, under sleep debt, under the thousand small decisions a week demands. A business built on heroics is a business one bad month away from collapse.\n\n## What a system actually is\n\nA system is not a Notion template. A system is a decision you make once, codify, and never have to make again. It is a default. Every default you set is a unit of attention you reclaim for the work that actually requires you.\n\nThe agencies that scale are not smarter. They have simply made more decisions into defaults. Their offer is a default. Their onboarding is a default. Their pricing is a default.\n\n## The compounding effect\n\nSystems compound in a way heroics cannot. A process improved by ten percent this month is improved by ten percent forever. A habit installed once pays dividends daily. A framework documented once can be handed to someone else — which is the only way a business ever gets larger than its founder.\n\nIf your business cannot run without you for two weeks, you do not have a business. You have a job with good branding. The work of the next year is to change that — one default at a time." },
  { title: "How I Built a Content Engine That Runs While I Sleep", slug: "content-engine-that-runs-while-i-sleep", excerpt: "Content is the cheapest advertising you will ever produce — if it is built as a system, not a side project. Here is the exact engine behind every post on this site.", category: "Marketing", readTime: 11, cover: "/images/blog-content.jpg", featured: false, tags: '["content","marketing","systems"]', content: "Content is the cheapest advertising you will ever produce.\n\nA useful article compounds for years. A sharp framework earns you the right to be recommended. Paid ads amplify what works — they rarely rescue what does not.\n\n## The four pillars\n\nEvery piece of content I publish does one of four jobs: it attracts a new audience, it nurtures an existing one, it converts a warm lead, or it compounds as a reference.\n\n## The production system\n\nI do not write when I am inspired. I write on a schedule. Inspiration is unreliable; schedules ship.\n\nThe system is simple: one framework per week, two shorter pieces that repurpose it, and one deep reference post per month. Everything starts from a single idea and gets sliced into the formats that fit each platform.\n\nThe leverage is in the slicing. One framework becomes a long-form post, a thread, a carousel, a newsletter section, and a video script. Same idea, five assets. This is how a solo operator keeps up with teams.\n\n## Why it compounds\n\nAn article I wrote two years ago still sends clients every month. A framework still gets quoted in conversations I am not in. The work I did once keeps paying — and the more I add, the larger the surface area that catches attention.\n\nThis is the real argument for consistency over brilliance. A hundred decent posts, shipped on schedule, will outperform ten perfect posts shipped whenever you felt ready. The library is the asset. Build the library." },
  { title: "Scaling Past Six Figures Without Hiring a Team", slug: "scaling-past-six-figures-without-hiring", excerpt: "You do not need a team to scale. You need leverage. Here is how to grow a one-person business past six figures using productization, automation, and pricing — not payroll.", category: "Freelancing", readTime: 9, cover: "/images/blog-scale.jpg", featured: false, tags: '["freelancing","scaling","leverage"]', content: "You do not need a team to scale. You need leverage.\n\nThe dream of 'scaling' has been quietly rewritten as 'hiring.' But hiring is one form of leverage, and it is the most expensive, most fragile form there is. Before you add payroll, exhaust the other three.\n\n## Leverage one: productize\n\nA custom service cannot be systematized. The first leverage move is to standardize the eighty percent of your work that repeats, and charge a premium for the twenty percent that requires judgment.\n\n## Leverage two: automate\n\nEvery repetitive task in your business is a candidate for automation. Invoices, onboarding, scheduling, follow-ups, reporting — each one is a junior hire you do not have to make.\n\n## Leverage three: price\n\nThis is the most overlooked leverage of all. Doubling your prices is equivalent to doubling your output, but it takes an afternoon instead of a year.\n\nMost solopreneurs underprice out of fear, not math. Run the numbers: how many clients do you actually need at your current price to hit your target? Now halve the client count and double the price. Same revenue, half the delivery load, twice the focus per client. That is leverage.\n\n## The order matters\n\nDo them in this order: productize first, automate second, price third. Only after all three are exhausted does hiring begin to make sense.\n\nMost businesses hire to solve problems that productization, automation, and pricing would have solved cheaper. Don't be most businesses. Get your leverage in order first, and you may find you never need the team at all." },
];

// ---------- Testimonials ----------
const testimonials = [
  { name: "Client 01", role: "Business Owner", quote: "Tasbir delivered exactly what we needed. The website was fast, professional, and helped us generate more inquiries than before.", rating: 5, bookSlug: null },
  { name: "Client 02", role: "Operations Manager", quote: "The automation system saved our team hours every week. Everything now runs much more efficiently.", rating: 5, bookSlug: null },
  { name: "Client 03", role: "Startup Founder", quote: "Working with Tasbir was smooth from start to finish. Communication was excellent and delivery exceeded expectations.", rating: 5, bookSlug: null },
  { name: "Client 04", role: "Company Director", quote: "Our new website looks modern, loads fast, and performs significantly better than our previous version.", rating: 5, bookSlug: null },
  { name: "Client 05", role: "Agency Owner", quote: "The AI integration helped automate repetitive tasks and improved our workflow immediately.", rating: 5, bookSlug: null },
  { name: "Marcus Lee", role: "Founder, Northwind Studio", quote: "I read a lot of business books. Most are 90% filler. This one is the opposite — every page had something I wanted to implement.", rating: 5, bookSlug: "ai-agency-operating-system" },
  { name: "Priya Nair", role: "Solo Consultant", quote: "The weekly review ritual is the single highest-leverage habit I have ever adopted. Three months in, I can actually see my business.", rating: 5, bookSlug: "ai-agency-operating-system" },
];

async function main() {
  // Wipe
  await db.contactMessage.deleteMany();
  await db.newsletterSub.deleteMany();
  await db.testimonial.deleteMany();
  await db.blogPost.deleteMany();
  await db.resource.deleteMany();
  await db.book.deleteMany();
  await db.analyticsEvent.deleteMany();
  await db.readingProgress.deleteMany();
  await db.libraryAccess.deleteMany();
  await db.order.deleteMany();
  await db.broadcast.deleteMany();
  await db.user.deleteMany();
  await db.siteSettings.deleteMany();

  // Books
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

  // Resources
  for (const r of resources) {
    await db.resource.create({ data: r });
  }

  // Blog
  for (const p of blogPosts) {
    await db.blogPost.create({ data: p });
  }

  // Testimonials
  for (const t of testimonials) {
    await db.testimonial.create({ data: t });
  }

  // NOTE: Admin account is NO LONGER created here.
  // The admin account is created via the website signup flow.
  // Set ADMIN_EMAIL in your env vars, then sign up with that email
  // — the account is automatically promoted to admin.
  // See VERCEL-DEPLOY.md for details.

  // Newsletter subs
  const subs = [
    { email: "sub1@example.com", segment: "all" },
    { email: "sub2@example.com", segment: "all" },
  ];
  for (const s of subs) await db.newsletterSub.create({ data: s });

  // Site settings singleton with nav items
  await db.siteSettings.create({
    data: {
      id: "singleton",
      navItems: JSON.stringify([
        { label: "Home", view: "home" },
        { label: "Books", view: "books" },
        { label: "Resources", view: "resources" },
        { label: "Blog", view: "blog" },
        { label: "About", view: "about" },
        { label: "Contact", view: "contact" },
      ]),
    },
  });

  // Seed analytics events
  const events = [
    { type: "page_view", path: "/" },
    { type: "page_view", path: "/books" },
    { type: "book_view", refSlug: "ai-agency-operating-system" },
    { type: "book_view", refSlug: "prompt-engineering-bible" },
    { type: "sale", refSlug: "ai-agency-operating-system", value: 19 },
    { type: "sale", refSlug: "prompt-engineering-bible", value: 24 },
    { type: "sale", refSlug: "deep-work-for-builders", value: 12 },
    { type: "download", refSlug: "offer-one-pager" },
    { type: "download", refSlug: "solo-operator-playbook" },
    { type: "email_signup", path: "/" },
    { type: "reading_complete", refSlug: "deep-work-for-builders" },
  ];
  for (let i = 0; i < events.length * 4; i++) {
    const e = events[i % events.length];
    await db.analyticsEvent.create({ data: { ...e, meta: "{}", createdAt: new Date(Date.now() - i * 3600 * 1000) } });
  }

  console.log("✓ Content seeded successfully (books, blog, resources, testimonials, settings).");
  console.log("⚠️  No admin user created — sign up on the website with your ADMIN_EMAIL to get admin access.");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
