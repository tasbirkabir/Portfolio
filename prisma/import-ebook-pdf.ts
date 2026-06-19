// Parse The-AI-Agency-Operating-System.pdf into reader chapters and update the DB.
// Chapter page ranges are hardcoded from the known PDF structure (85 pages, 16 chapters).
import { execSync } from "child_process";
import { db } from "../src/lib/db";

type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

// --- Extract per-page text from the PDF via Python/pymupdf ---
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

// --- Hardcoded chapter structure (0-indexed page numbers) ---
type ChapDef = { title: string; contentPages: number[] };

const CHAPTERS: ChapDef[] = [
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

const CALLOUT_LABELS = ["Key Concept", "Tasbir's Note", "Action Step", "Common Mistake", "Pro Tip"];
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

/** A line is decorative all-caps noise if, after removing spaces/apostrophes/hyphens,
 * it is all uppercase A-Z (len >= 6) AND has >= 4 space-separated tokens. These are
 * visual framework titles rendered with letter-spacing in the PDF; skip them as the
 * real content follows. */
function isDecorativeCaps(line: string): boolean {
  const compact = line.replace(/[\s'\-.,&()/]/g, "");
  if (compact.length < 6 || !/^[A-Z]+$/.test(compact)) return false;
  const tokens = line.split(" ").filter(Boolean);
  return tokens.length >= 4;
}

function isPageNumber(line: string): boolean {
  return /^\d{1,2}(\s\d)?$/.test(clean(line));
}

function isListOrSymbol(line: string): boolean {
  const c = clean(line);
  return (
    /^[•✓✗▸▶▪]\s/.test(c) ||
    /^\d+[.)\-]\s/.test(c) ||
    /^\d{1,2}:\d{2}/.test(c) ||
    /^[\$\d\-,+×]+$/.test(c) ||
    /^[↳→←↑↓\s]+$/.test(c) ||
    c === ""
  );
}

/** Conservative heading detection: short, no ending punctuation, not a fragment. */
function isHeading(line: string): boolean {
  const c = clean(line);
  if (c.length < 6 || c.length > 70) return false;
  if (/[.,;:!?]$/.test(c)) return false;
  if (isPageNumber(c) || isListOrSymbol(c) || isDecorativeCaps(c)) return false;
  if (detectCallout(c)) return false;
  // Reject hyphenated continuations (wrapped lines)
  if (/[\-—]$/.test(c)) return false;
  // Reject if the last token is a number (wrapped data line)
  const tokens = c.split(" ");
  const last = tokens[tokens.length - 1];
  if (/^\d+([.,]\d+)?$/.test(last)) return false;
  // Reject if the last word is a continuation preposition/conjunction
  if (/^(of|the|a|an|in|on|with|for|and|or|to|by|from|at|as|per|out|up|into|via)$/i.test(last)) return false;
  return true;
}

// --- Parse a chapter's content pages into sections ---
// Two-phase approach to avoid losing text:
//   Phase 1: collect flat blocks (heading / para / callout / list) with paragraph
//            reconstruction (join wrapped lines until sentence-ending punctuation).
//   Phase 2: demote "headings" not followed by body content to paragraphs, then
//            group blocks into sections.
type Block =
  | { type: "heading"; text: string }
  | { type: "para"; text: string }
  | { type: "callout"; label: string; text: string }
  | { type: "list"; items: string[] };

function parseChapter(idx: number, def: ChapDef): ReaderChapter {
  const blocks: Block[] = [];
  let paraBuf: string[] = [];
  let lastEndedSentence = true;
  let pendingCallout: string | null = null;
  let calloutBuf: string[] = [];
  let listBuf: string[] = [];

  function flushPara() {
    if (paraBuf.length) {
      const text = paraBuf.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "para", text });
      lastEndedSentence = /[.!?]["')\]]?$/.test(text);
      paraBuf = [];
    }
  }
  function flushList() {
    if (listBuf.length) {
      blocks.push({ type: "list", items: [...listBuf] });
      listBuf = [];
      lastEndedSentence = true;
    }
  }
  function flushCallout() {
    if (pendingCallout && calloutBuf.length) {
      const text = calloutBuf.join(" ").replace(/\s+/g, " ").trim();
      if (text) blocks.push({ type: "callout", label: pendingCallout, text });
      pendingCallout = null;
      calloutBuf = [];
      lastEndedSentence = true;
    }
  }
  function flushAll() {
    flushList();
    flushPara();
    flushCallout();
  }

  for (const pno of def.contentPages) {
    const raw = pagesText[pno];
    const lines = raw.split("\n");
    let start = 0;
    if (lines.length && isPageNumber(lines[0])) start = 1;

    for (let li = start; li < lines.length; li++) {
      const line = clean(lines[li]);
      if (!line) {
        flushAll();
        continue;
      }
      if (isDecorativeCaps(line)) continue;

      const callout = detectCallout(line);
      if (callout) {
        flushAll();
        pendingCallout = callout;
        // Strip the emoji + spaced/normal label echo from the marker line.
        // Build a spaced-tolerant regex for the label (e.g. "K\s*e\s*y..." matches "K E Y CONCE P T").
        const labelSpaced = callout.split("").join("\\s*");
        const rest = line
          .replace(/🎯|✅|⚠️|💡/g, "")
          .replace(new RegExp(labelSpaced, "gi"), "")
          .replace(/^[—\-\s:]+/, "")
          .replace(/\s+/g, " ")
          .trim();
        // Discard a pure label echo (e.g. "K E Y CONCE P T" compacted == "KEYCONCEPT")
        if (rest) {
          const restCompact = rest.replace(/[\s'\-.,:]/g, "").toLowerCase();
          const labelCompact = callout.replace(/[\s'\-.,:]/g, "").toLowerCase();
          if (restCompact !== labelCompact && restCompact.length > 0) {
            // Normalize decorative caps in the rest so titles are readable
            calloutBuf.push(isDecorativeCaps(rest) ? rest.replace(/\s+/g, " ") : rest);
          }
        }
        continue;
      }
      if (pendingCallout) {
        calloutBuf.push(line);
        continue;
      }

      // List item?
      if (/^[•✓✗▸▶▪]\s+/.test(line) || /^\d+[.)\-]\s+/.test(line)) {
        flushPara();
        const item = line.replace(/^[•✓✗▸▶▪]\s+/, "").replace(/^(\d+[.)\-])\s+/, "$1 ");
        listBuf.push(item);
        continue;
      }
      if (listBuf.length) flushList();

      // Heading? Only when the previous block ended a sentence.
      if (lastEndedSentence && isHeading(line)) {
        flushPara();
        blocks.push({ type: "heading", text: line });
        lastEndedSentence = true;
        continue;
      }

      // Body — accumulate into paragraph buffer
      paraBuf.push(line);
      if (/[.!?]["')\]]?$/.test(line)) flushPara();
    }
    flushAll();
  }
  flushAll();

  // Phase 2: demote headings with no following body content to paragraphs.
  // A heading is "real" if it's followed (before the next heading) by at least
  // one para/callout/list block. Otherwise it's a table cell or label → para.
  const demoted: Block[] = [];
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (b.type !== "heading") {
      demoted.push(b);
      continue;
    }
    // look ahead for body content before the next heading
    let hasBody = false;
    for (let j = i + 1; j < blocks.length; j++) {
      if (blocks[j].type === "heading") break;
      hasBody = true;
      break;
    }
    if (hasBody) {
      demoted.push(b);
    } else {
      // demote to paragraph
      demoted.push({ type: "para", text: b.text });
    }
  }

  // Phase 3: group into sections.
  const sections: Section[] = [];
  let current: Section = { heading: "Overview", body: [] };
  for (const b of demoted) {
    if (b.type === "heading") {
      if (current.body.length > 0) sections.push(current);
      else if (sections.length === 0) {
        // first heading with no prior body — just rename current
      }
      current = { heading: b.text, body: [] };
    } else if (b.type === "para") {
      current.body.push(b.text);
    } else if (b.type === "callout") {
      current.body.push(`【${b.label}】 ${b.text}`);
    } else if (b.type === "list") {
      current.body.push(b.items.map((it) => "• " + it).join("\n"));
    }
  }
  if (current.body.length > 0 || sections.length === 0) sections.push(current);

  return { id: `ch-${idx}`, title: def.title, sections };
}

const readerChapters: ReaderChapter[] = CHAPTERS.map((def, i) => parseChapter(i, def));

// --- Log results ---
let totalWords = 0;
console.log(`Parsed ${readerChapters.length} chapters:`);
for (const c of readerChapters) {
  const words = c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0);
  totalWords += words;
  console.log(`  ${c.id} — ${c.title} (${c.sections.length} sections, ~${words} words)`);
}
console.log(`Total: ~${totalWords} words`);

// --- Build DB update ---
const chapterList = readerChapters.map((c) => ({
  title: c.title,
  pages: Math.max(3, Math.round(c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220)),
}));
const totalPages = 85;

const whatYouLearn = [
  "The outcome-first positioning framework that makes business owners buy",
  "The $1T automation gap and why midmarket businesses are the real opportunity",
  "The Agency Triangle: Service, Client, and Operations — and why missing one kills scale",
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
  { q: "What format is the book?", a: `An ${totalPages}-page ebook plus a built-in premium reader with bookmarks, highlights, notes, dark mode, search, and progress tracking. Every framework, callout, and action plan is included.` },
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
      content: JSON.stringify(readerChapters),
      chapters: JSON.stringify(chapterList),
      pages: totalPages,
      whatYouLearn: JSON.stringify(whatYouLearn),
      faq: JSON.stringify(faq),
      highlights: JSON.stringify(highlights),
      description:
        "The complete operating system for building, pricing, and scaling an AI services business in 2026. Sixteen chapters across the Blueprint, Foundation, Architecture, Monetization, Execution, and Scale — every framework, deep dive, rate card, and action plan I use to run real B2B campaigns, from missed-call voice agents to $30k/month productized retainers. Includes 5 real-world case studies and a 3-month execution timeline.",
    },
  });

  console.log(`\n✓ Updated book: ${readerChapters.length} chapters, ${totalPages} pages, ~${totalWords} words.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await db.$disconnect();
  });
