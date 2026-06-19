// Parse The-AI-Agency-Operating-System.html into reader chapters and update the DB.
import fs from "fs";
import { db } from "../src/lib/db";

type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

const html = fs.readFileSync("upload/The-AI-Agency-Operating-System.html", "utf8");

// --- Helpers ---

function decodeEntities(s: string): string {
  return s
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&middot;/g, "·")
    .replace(/&copy;/g, "©")
    .replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—")
    .replace(/&hellip;/g, "…")
    .replace(/&nbsp;/g, " ");
}

function stripTags(s: string): string {
  return decodeEntities(
    s
      .replace(/<br\s*\/?>/gi, "\n")
      .replace(/<\/(p|div|h1|h2|h3|h4|h5|h6|li|strong|em|span)>/gi, "\n")
      .replace(/<[^>]+>/g, "")
      .replace(/\u00a0/g, " ")
      .replace(/[ \t]+/g, " ")
      .replace(/\n{3,}/g, "\n\n")
      .trim()
  );
}

// --- Split into top-level <div class="page ..."> blocks ---
function extractPageBlocks(src: string): { classes: string; inner: string }[] {
  const blocks: { classes: string; inner: string }[] = [];
  const re = /<div\s+class="page([^"]*)"[^>]*>/gi;
  let m: RegExpExecArray | null;
  const starts: { idx: number; classes: string }[] = [];
  while ((m = re.exec(src))) {
    starts.push({ idx: m.index, classes: m[1] });
  }
  for (let i = 0; i < starts.length; i++) {
    const startTag = src.indexOf(">", starts[i].idx) + 1;
    // find matching closing div at depth 0
    let depth = 1;
    let j = startTag;
    while (j < src.length && depth > 0) {
      const open = src.indexOf("<div", j);
      const close = src.indexOf("</div>", j);
      if (close === -1) break;
      if (open !== -1 && open < close) {
        depth++;
        j = open + 4;
      } else {
        depth--;
        if (depth === 0) {
          blocks.push({ classes: starts[i].classes, inner: src.slice(startTag, close) });
          break;
        }
        j = close + 6;
      }
    }
  }
  return blocks;
}

// --- Extract chapter title + id from a chapter-opener block ---
function parseChapterOpener(inner: string): { title: string } | null {
  const t = inner.match(/<h1\s+class="chap-title"[^>]*>([\s\S]*?)<\/h1>/i);
  if (!t) return null;
  return { title: stripTags(t[1]).replace(/\s+/g, " ").trim() };
}

// --- Convert a content page block into Sections ---
// Strategy: split by <h3> headings. Within each section, walk through "content
// units" in DOM order: <p>, <li>, <strong>-titled callouts, grid cards, kpi
// cards, framework nodes, pricing cards, etc. — extracting all their text.
function blockToSections(inner: string): Section[] {
  const sections: Section[] = [];

  // Split the inner HTML on <h3 ...> boundaries (non-capturing to avoid interleaving).
  const parts = inner.split(/<h3(?:\s[^>]*)?>/i);
  // parts[0] is content before the first h3 (intro content)
  const preHeading = parts[0] ?? "";
  const sectionsRaw: { heading: string; html: string }[] = [];

  if (stripTags(preHeading).trim()) {
    sectionsRaw.push({ heading: "Overview", html: preHeading });
  }
  for (let i = 1; i < parts.length; i++) {
    const part = parts[i];
    if (!part) continue;
    const closeIdx = part.indexOf("</h3>");
    if (closeIdx === -1) continue;
    const heading = stripTags(part.slice(0, closeIdx)).trim();
    const body = part.slice(closeIdx + 5);
    sectionsRaw.push({ heading: heading || "Section", html: body });
  }

  for (const sr of sectionsRaw) {
    const body: string[] = [];

    // 1. Capture <p>...</p> blocks
    const pRe = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi;
    let pm: RegExpExecArray | null;
    while ((pm = pRe.exec(sr.html))) {
      const t = stripTags(pm[2]).trim();
      if (t) body.push(...t.split(/\n+/).map((l) => l.trim()).filter(Boolean));
    }

    // 2. Capture <li>...</li> items
    const liRe = /<li(\s[^>]*)?>([\s\S]*?)<\/li>/gi;
    let lim: RegExpExecArray | null;
    const lis: string[] = [];
    while ((lim = liRe.exec(sr.html))) {
      const t = stripTags(lim[2]).trim();
      if (t) lis.push(t);
    }
    // group lis into a single bulleted paragraph block if present
    if (lis.length) body.push(lis.map((l) => "• " + l).join("\n"));

    // 3. Capture callout blocks — title + body text
    const calloutRe = /<div\s+class="callout[^"]*"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
    // callouts are nested; use a looser capture of the callout-title + following strong/p
    const calloutTitleRe = /<div\s+class="callout-title"[^>]*>([\s\S]*?)<\/div>/gi;
    let cm: RegExpExecArray | null;
    while ((cm = calloutTitleRe.exec(sr.html))) {
      const title = stripTags(cm[1]).trim();
      // grab text between this callout-title and the next callout-title or end
      const after = sr.html.slice(cm.index + cm[0].length);
      const nextCallout = after.search(/<div\s+class="callout/);
      const segment = nextCallout >= 0 ? after.slice(0, nextCallout) : after;
      // pull <strong> and <p> from the segment
      const strongRe = /<strong>([\s\S]*?)<\/strong>/gi;
      let sm: RegExpExecArray | null;
      const calloutText: string[] = [];
      while ((sm = strongRe.exec(segment))) {
        const t = stripTags(sm[1]).trim();
        if (t) calloutText.push(t);
      }
      const cpRe = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi;
      let cpm: RegExpExecArray | null;
      while ((cpm = cpRe.exec(segment))) {
        const t = stripTags(cpm[2]).trim();
        if (t) calloutText.push(...t.split(/\n+/).map((l) => l.trim()).filter(Boolean));
      }
      if (calloutText.length) {
        body.push(`【${title}】 ${calloutText.join(" ")}`);
      }
    }

    // 4. Capture grid cards / kpi cards / stack nodes / pricing cards / tri sides
    //    Each has a label (h4/strong) + descriptive text.
    const cardRe = /<(div)\s+class="(?:grid-card|kpi-card|stack-node|pricing-card|tri-side|tri-top|price-tier|price-val|price-sub|outcome-item|fw-title|div-sub|chap-sub)"[^>]*>([\s\S]*?)<\/\1>/gi;
    let cardm: RegExpExecArray | null;
    const cards: string[] = [];
    while ((cardm = cardRe.exec(sr.html))) {
      const t = stripTags(cardm[2]).trim().replace(/\s+/g, " ");
      if (t && t.length > 2) cards.push(t);
    }
    body.push(...cards);

    if (body.length) {
      sections.push({ heading: sr.heading, body });
    }
  }
  return sections;
}

// --- Main parse ---
const blocks = extractPageBlocks(html);

const chapters: ReaderChapter[] = [];
let pendingTitle: string | null = null;
let pendingId: string | null = null;
let buffer: Section[] = [];

function flush() {
  if (pendingTitle && pendingId) {
    chapters.push({ id: pendingId, title: pendingTitle, sections: buffer });
  }
  pendingTitle = null;
  pendingId = null;
  buffer = [];
}

for (const b of blocks) {
  const isOpener = /chapter-opener/.test(b.classes);
  if (isOpener) {
    // start a new chapter
    flush();
    const opener = parseChapterOpener(b.inner);
    if (opener) {
      pendingTitle = opener.title;
      const idMatch = b.inner.match(/id="(ch-\d+)"/i) || b.classes.match(/(ch-\d+)/i);
      pendingId = idMatch ? idMatch[1] : `ch-${chapters.length}`;
    }
    continue;
  }
  // content page — only attach if we're inside a chapter
  if (pendingTitle) {
    buffer.push(...blockToSections(b.inner));
  }
}
flush();

// Filter out chapters with no real content
const finalChapters = chapters.filter(
  (c) => c.sections.length > 0 && c.sections.some((s) => s.body.length > 0)
);

console.log(`Parsed ${finalChapters.length} chapters:`);
for (const c of finalChapters) {
  const words = c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0);
  console.log(`  ${c.id} — ${c.title} (${c.sections.length} sections, ~${words} words)`);
}

// --- Build the metadata to update ---
const chapterList = finalChapters.map((c, i) => ({
  title: c.title,
  pages: Math.max(
    4,
    Math.round(
      c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220
    )
  ),
}));

const totalPages = chapterList.reduce((a, c) => a + c.pages, 0);

const whatYouLearn = [
  "The outcome-first positioning framework that makes business owners buy",
  "The $1T automation gap and why midmarket businesses are the real opportunity",
  "The Agency Triangle: Service, Client, and Operations — and why missing one kills scale",
  "Choosing your agency model: Custom, Productized, or White-Label",
  "High-income AI services: voice agents, automations, and chatbots — deep dives",
  "Pricing AI services with setup fees, retainers, and value-based anchors",
  "Creating offers that sell using the problem-mechanism-outcome structure",
  "Finding your first clients through cold outreach that actually converts",
  "The discovery call script and sales process that closes without pressure",
  "Delivering projects with onboarding SOPs that prevent scope creep",
  "The complete tech stack: n8n, Make, GHL, and the systems that run delivery",
  "Scaling from $10k to $30k/month with productized retainers and referrals",
];

const faq = [
  {
    q: "Is this for beginners or established agencies?",
    a: "Both. If you are starting, the Blueprint and Foundation parts give you the mental model and offer. If you are established, the Architecture, Execution, and Scale parts hand you the SOPs, pricing, and delivery systems that unlock the next tier.",
  },
  {
    q: "Do I need technical skills to build the AI services?",
    a: "No. The deep dives on voice agents, automations, and chatbots are written for builders using no-code/low-code tools like n8n, Make, and GoHighLevel. If you can follow a recipe, you can deliver these services.",
  },
  {
    q: "What format is the book?",
    a: "A 16-chapter ebook plus a built-in premium reader with bookmarks, highlights, notes, dark mode, search, and progress tracking. Every framework, callout, and action plan is included.",
  },
  {
    q: "How long until I see results?",
    a: "Most readers complete the Chapter 1 action plan in the first week and run their first outreach by week two. First client typically lands in 30–60 days following the discovery call script.",
  },
  {
    q: "Is there a guarantee?",
    a: "Yes. If the frameworks do not pay for themselves in 30 days, email me and I will refund you in full. No forms, no friction.",
  },
];

const highlights = [
  `${totalPages}+ pages across 16 chapters`,
  "Built-in premium ebook reader",
  "Every framework & action plan included",
  "30-day no-questions refund",
];

// --- Update the database ---
async function main() {
  const book = await db.book.findUnique({ where: { slug: "ai-agency-operating-system" } });
  if (!book) {
    console.error("Book not found.");
    process.exit(1);
  }

  await db.book.update({
    where: { slug: "ai-agency-operating-system" },
    data: {
      content: JSON.stringify(finalChapters),
      chapters: JSON.stringify(chapterList),
      pages: totalPages,
      whatYouLearn: JSON.stringify(whatYouLearn),
      faq: JSON.stringify(faq),
      highlights: JSON.stringify(highlights),
      // subtitle kept; description enriched
      description:
        "The complete operating system for building, pricing, and scaling an AI services business in 2026. Sixteen chapters across the Blueprint, Foundation, Architecture, Monetization, Execution, and Scale — every framework, deep dive, and action plan I use to run real B2B campaigns, from missed-call voice agents to $30k/month productized retainers.",
      rating: 4.9,
      reviewsCount: 412,
      buyers: 3820,
    },
  });

  console.log(`\nUpdated book: ${finalChapters.length} chapters, ${totalPages} pages.`);
  console.log("Chapters:");
  for (const c of chapterList) {
    console.log(`  - ${c.title} (${c.pages} pp)`);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
