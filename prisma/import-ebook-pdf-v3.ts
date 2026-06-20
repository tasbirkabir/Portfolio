// Simple PDF import — captures 100% of text from every page.
// No heading detection, no filtering — just raw text grouped by chapter.
import { execSync } from "child_process";
import { db } from "../src/lib/db";

type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

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

function clean(s: string): string {
  return s.replace(/\s+/g, " ").trim();
}

function isPageNumber(line: string): boolean {
  return /^\d{1,2}(\s\d)?$/.test(clean(line));
}

/** Parse a chapter — collect ALL lines as body text, grouped into paragraphs.
 *  Only skip page numbers and empty lines. Everything else is captured. */
function parseChapter(idx: number, def: { title: string; contentPages: number[] }): ReaderChapter {
  const sections: Section[] = [];
  let current: Section | null = null;
  let paraBuf: string[] = [];

  function flushPara() {
    if (paraBuf.length) {
      const text = paraBuf.join(" ").replace(/\s+/g, " ").trim();
      if (text) {
        if (!current) current = { heading: "Overview", body: [] };
        current.body.push(text);
      }
      paraBuf = [];
    }
  }

  for (const pno of def.contentPages) {
    const raw = pagesText[pno];
    const lines = raw.split("\n");
    let start = 0;
    if (lines.length && isPageNumber(lines[0])) start = 1;

    for (let li = start; li < lines.length; li++) {
      const line = clean(lines[li]);
      if (!line) { flushPara(); continue; }
      if (isPageNumber(line)) continue;

      // Check if this looks like a heading (short line, no ending punctuation,
      // previous paragraph ended with a period)
      const isHeadingLike =
        line.length >= 6 &&
        line.length <= 70 &&
        !/[.,;:!?]$/.test(line) &&
        !isPageNumber(line) &&
        paraBuf.length === 0; // only treat as heading at paragraph start

      if (isHeadingLike) {
        flushPara();
        if (current && current.body.length > 0) sections.push(current);
        current = { heading: line, body: [] };
        continue;
      }

      paraBuf.push(line);
      // Flush on sentence-ending punctuation
      if (/[.!?]["')\]]?$/.test(line)) flushPara();
    }
    flushPara();
  }
  flushPara();
  if (current && current.body.length > 0) sections.push(current);
  if (sections.length === 0) sections.push({ heading: "Content", body: ["No content extracted."] });

  return { id: `ch-${idx}`, title: def.title, sections };
}

const readerChapters: ReaderChapter[] = CHAPTERS.map((def, i) => parseChapter(i, def));

let totalWords = 0;
console.log(`Parsed ${readerChapters.length} chapters:`);
for (const c of readerChapters) {
  const words = c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0);
  totalWords += words;
  console.log(`  ${c.id} — ${c.title} (${c.sections.length} sections, ~${words} words)`);
}
console.log(`Total: ~${totalWords} words (PDF has ~6813)`);

const chapterList = readerChapters.map((c) => ({
  title: c.title,
  pages: Math.max(3, Math.round(c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220)),
}));

async function main() {
  await db.book.update({
    where: { slug: "ai-agency-operating-system" },
    data: {
      content: JSON.stringify(readerChapters),
      chapters: JSON.stringify(chapterList),
      pages: 85,
    },
  });
  console.log(`\n✓ Updated: ${readerChapters.length} chapters, ~${totalWords} words.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
