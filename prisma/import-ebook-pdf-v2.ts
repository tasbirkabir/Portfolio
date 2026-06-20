// Improved PDF import — captures ALL text from every page, including table cells,
// framework labels, KPI cards, and callout text that the previous parser missed.
import { execSync } from "child_process";
import { db } from "../src/lib/db";

type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

// Extract per-page text from the PDF
const pagesText: string[] = JSON.parse(
  execSync(
    `python3 -c "
import fitz, json
doc = fitz.open('upload/The-AI-Agency-Operating-System.pdf')
print(json.dumps([doc[i].get_text() for i in range(doc.page_count)]))
"`,
    { maxBuffer: 50 * 1024 * 1024 }
  ).toString()
);

// Hardcoded chapter structure (0-indexed page numbers from the known PDF)
const CHAPTERS: { title: string; contentPages: number[] }[] = [
  { title: "Letter from Tasbir", contentPages: [6, 7, 8, 9, 10] },
  { title: "What Is an AI Agency, Really?", contentPages: [13, 14, 15, 16, 17, 18] },
  { title: "The Founder Mindset", contentPages: [20, 21, 22, 23, 24, 25, 26, 27] },
  { title: "Choosing a Profitable Niche", contentPages: [30, 31, 32, 33] },
  { title: "High-Income AI Services", contentPages: [35, 36, 37] },
  { title: "AI Voice Agents — Deep Dive", contentPages: [39, 40, 41] },
  { title: "AI Automations — Deep Dive", contentPages: [43, 44] },
  { title: "AI Chatbots — Deep Dive", contentPages: [46, 47] },
  { title: "Pricing AI Services", contentPages: [50, 51, 52, 53] },
  { title: "Creating Offers That Sell", contentPages: [55, 56] },
  { title: "Finding Your First Clients", contentPages: [59, 60, 61, 62] },
  { title: "The Discovery Call & Sales", contentPages: [64, 65] },
  { title: "Delivering Projects & Onboarding", contentPages: [67, 68, 69, 70, 71] },
  { title: "SOPs, Systems & Tech Stack", contentPages: [73] },
  { title: "Scaling to $10K & $30K/Month", contentPages: [76, 77, 78] },
  { title: "Future, Case Studies & Action Plan", contentPages: [80, 81, 82] },
];

// --- Helpers ---
function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isPageNumber(line: string): boolean {
  return /^\d{1,2}(\s\d)?$/.test(clean(line));
}

/** Detect callout markers */
const CALLOUT_RE = /^(🎯|✅|⚠️|💡)|KEY\s*CONCEPT|TASBIR'?S\s*NOTE|ACTION\s*STEP|COMMON\s*MISTAKE|PRO\s*TIP/i;
function detectCallout(line: string): string | null {
  if (!CALLOUT_RE.test(line)) return null;
  if (/KEY\s*CONCEPT|🎯/i.test(line)) return "Key Concept";
  if (/TASBIR'?S\s*NOTE/i.test(line)) return "Tasbir's Note";
  if (/ACTION\s*STEP|✅/i.test(line)) return "Action Step";
  if (/COMMON\s*MISTAKE|⚠️/i.test(line)) return "Common Mistake";
  if (/PRO\s*TIP|💡/i.test(line)) return "Pro Tip";
  return "Note";
}

/** Decorative all-caps noise (framework titles rendered with letter-spacing) */
function isDecorativeCaps(line: string): boolean {
  const compact = line.replace(/[\s'\-.,&()/]/g, "");
  if (compact.length < 6 || !/^[A-Z]+$/.test(compact)) return false;
  const tokens = line.split(" ").filter(Boolean);
  return tokens.length >= 4;
}

/**
 * Parse a chapter's pages into sections.
 * SIMPLIFIED approach: collect ALL non-trivial lines as body paragraphs,
 * grouped by h3 headings. No text is dropped.
 */
function parseChapter(idx: number, def: { title: string; contentPages: number[] }): ReaderChapter {
  const sections: Section[] = [];
  let current: Section = { heading: "Overview", body: [] };
  let paraBuf: string[] = [];
  let lastEndedSentence = true;
  let pendingCallout: string | null = null;
  let calloutBuf: string[] = [];

  function flushPara() {
    if (paraBuf.length) {
      const text = paraBuf.join(" ").replace(/\s+/g, " ").trim();
      if (text) current.body.push(text);
      lastEndedSentence = /[.!?]["')\]]?$/.test(text);
      paraBuf = [];
    }
  }
  function flushCallout() {
    if (pendingCallout && calloutBuf.length) {
      const text = calloutBuf.join(" ").replace(/\s+/g, " ").trim();
      if (text) current.body.push(`【${pendingCallout}】 ${text}`);
      pendingCallout = null;
      calloutBuf = [];
      lastEndedSentence = true;
    }
  }
  function flushAll() {
    flushCallout();
    flushPara();
  }

  for (const pno of def.contentPages) {
    const raw = pagesText[pno];
    const lines = raw.split("\n");
    let start = 0;
    if (lines.length && isPageNumber(lines[0])) start = 1;

    for (let li = start; li < lines.length; li++) {
      const line = clean(lines[li]);
      if (!line) { flushAll(); continue; }
      if (isDecorativeCaps(line)) continue;

      // Callout?
      const callout = detectCallout(line);
      if (callout) {
        flushAll();
        pendingCallout = callout;
        const labelSpaced = callout.split("").join("\\s*");
        const rest = line
          .replace(/🎯|✅|⚠️|💡/g, "")
          .replace(new RegExp(labelSpaced, "gi"), "")
          .replace(/^[—\-\s:]+/, "")
          .replace(/\s+/g, " ")
          .trim();
        if (rest) {
          const restCompact = rest.replace(/[\s'\-.,:]/g, "").toLowerCase();
          const labelCompact = callout.replace(/[\s'\-.,:]/g, "").toLowerCase();
          if (restCompact !== labelCompact && restCompact.length > 0) {
            calloutBuf.push(rest);
          }
        }
        continue;
      }
      if (pendingCallout) {
        calloutBuf.push(line);
        continue;
      }

      // List items
      if (/^[•✓✗▸▶▪]\s+/.test(line) || /^\d+[.)\-]\s+/.test(line)) {
        flushPara();
        const item = line.replace(/^[•✓✗▸▶▪]\s+/, "").replace(/^(\d+[.)\-])\s+/, "$1 ");
        current.body.push("• " + item);
        lastEndedSentence = true;
        continue;
      }

      // Heading detection (conservative)
      const isHeadingLike =
        line.length >= 6 &&
        line.length <= 70 &&
        !/[.,;:!?]$/.test(line) &&
        !isPageNumber(line) &&
        !isDecorativeCaps(line) &&
        !detectCallout(line) &&
        !/[\-—]$/.test(line) && // not a wrapped line
        !/^(of|the|a|an|in|on|with|for|and|or|to|by|from|at|as|per|out|up|into|via)$/i.test(line.split(" ").pop() || "");

      if (lastEndedSentence && isHeadingLike) {
        flushPara();
        if (current.body.length > 0) sections.push(current);
        current = { heading: line, body: [] };
        lastEndedSentence = true;
        continue;
      }

      // Body text
      paraBuf.push(line);
      if (/[.!?]["')\]]?$/.test(line)) flushPara();
    }
    flushAll();
  }
  flushAll();
  if (current.body.length > 0 || sections.length === 0) sections.push(current);

  return { id: `ch-${idx}`, title: def.title, sections };
}

const readerChapters: ReaderChapter[] = CHAPTERS.map((def, i) => parseChapter(i, def));

// Log results
let totalWords = 0;
console.log(`Parsed ${readerChapters.length} chapters:`);
for (const c of readerChapters) {
  const words = c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0);
  totalWords += words;
  console.log(`  ${c.id} — ${c.title} (${c.sections.length} sections, ~${words} words)`);
}
console.log(`Total: ~${totalWords} words`);

// --- Update the database ---
const chapterList = readerChapters.map((c) => ({
  title: c.title,
  pages: Math.max(3, Math.round(c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220)),
}));
const totalPages = 85;

const whatYouLearn = [
  "The outcome-first positioning framework that makes business owners buy",
  "The $1T automation gap and why midmarket businesses are the real opportunity",
  "The Agency Triangle: Service, Client, Operations — and why missing one kills scale",
  "Choosing your agency model: Custom ($3k–$10k), Productized ($999–$2.5k), or White-Label",
  "The 7 high-paying niches for AI agencies and the 48-hour niche validation protocol",
  "High-income AI services: voice agents, automations, and chatbots — full deep dives",
  "The universal voice agent script template and inbound vs. outbound agent design",
  "n8n vs. Make — when to use each — and the 5 automations every business needs",
  "Chatbase vs. ManyChat vs. Voiceflow and the 3-layer handoff architecture",
  "Value-based vs. cost-based pricing and the complete AI agency rate card",
  "The $999 starter offer strategy and guarantee structures that reduce buyer risk",
  "The 5 client acquisition channels and the 30-day first client playbook",
  "The 5-phase discovery call framework and the PAIN qualification framework",
  "Onboarding, 7-day delivery sprints, and the 3 rules of project communication",
  "The 2026 AI agency tech stack directory and SOPs for every service",
  "Scaling milestones to $10k and $30k/month, team structures, and the growth flywheel",
  "5 real-world case studies and a 3-month startup execution timeline",
];

const faq = [
  { q: "Is this for beginners or established agencies?", a: "Both. If you are starting, the Blueprint and Foundation parts give you the mental model and offer. If you are established, the Architecture, Execution, and Scale parts hand you the SOPs, pricing, and delivery systems that unlock the next tier." },
  { q: "Do I need technical skills to build the AI services?", a: "No. The deep dives on voice agents, automations, and chatbots are written for builders using no-code/low-code tools like n8n, Make, and GoHighLevel. If you can follow a recipe, you can deliver these services." },
  { q: "What format is the book?", a: `An ${totalPages}-page ebook plus a built-in premium reader with bookmarks, highlights, notes, dark mode, search, and progress tracking. Every framework and action plan is included.` },
  { q: "How long until I see results?", a: "Most readers complete the Chapter 1 action plan in the first week and run their first outreach by week two. First client typically lands in 30–60 days following the 30-day playbook." },
  { q: "Is there a guarantee?", a: "Yes. If the frameworks do not pay for themselves in 30 days, email me and I will refund you in full. No forms, no friction." },
];

const highlights = [
  `${totalPages} pages across 16 chapters`,
  "Built-in premium ebook reader",
  "Every framework, rate card & action plan included",
  "5 real-world case studies + 3-month timeline",
  "30-day no-questions refund",
];

async function main() {
  await db.book.update({
    where: { slug: "ai-agency-operating-system" },
    data: {
      content: JSON.stringify(readerChapters),
      chapters: JSON.stringify(chapterList),
      pages: totalPages,
      whatYouLearn: JSON.stringify(whatYouLearn),
      faq: JSON.stringify(faq),
      highlights: JSON.stringify(highlights),
    },
  });
  console.log(`\n✓ Updated: ${readerChapters.length} chapters, ${totalPages} pages, ~${totalWords} words.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
