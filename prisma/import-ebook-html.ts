// Import the AI Agency OS from the HTML source — captures 100% of text.
// Uses a simple, robust approach: extract all text blocks (p, li, h3, callouts)
// from each chapter's page divs.
import fs from "fs";
import { db } from "../src/lib/db";

type Section = { heading: string; body: string[] };
type ReaderChapter = { id: string; title: string; sections: Section[] };

const html = fs.readFileSync("upload/The-AI-Agency-Operating-System.html", "utf8");

// --- Strip scripts/styles ---
const clean = html
  .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "")
  .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "")
  .replace(/<!--[\s\S]*?-->/g, "");

// --- Extract top-level <div class="page ..."> blocks ---
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

// --- Decode HTML entities ---
function decode(s: string): string {
  return s
    .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&apos;/g, "'")
    .replace(/&middot;/g, "·").replace(/&copy;/g, "©").replace(/&ndash;/g, "–")
    .replace(/&mdash;/g, "—").replace(/&hellip;/g, "…").replace(/&nbsp;/g, " ");
}

// --- Strip tags and clean ---
function stripTags(s: string): string {
  return decode(s.replace(/<br\s*\/?>/gi, "\n").replace(/<\/(p|div|h\d|li|strong|em|span)>/gi, "\n").replace(/<[^>]+>/g, "").replace(/\u00a0/g, " ").replace(/[ \t]+/g, " ").replace(/\n{3,}/g, "\n\n").trim());
}

// --- Extract chapter title from a chapter-opener block ---
function getChapterTitle(inner: string): string | null {
  const m = inner.match(/<h1\s+class="chap-title"[^>]*>([\s\S]*?)<\/h1>/i);
  if (!m) return null;
  return stripTags(m[1]).replace(/\s+/g, " ").trim();
}

// --- Extract all text from a content page block ---
// Collects: <p>, <li>, <h3>, <h4>, callout titles, card text, KPI values, etc.
function extractAllText(inner: string): string[] {
  const lines: string[] = [];

  // 1. All <p> blocks
  const pRe = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi;
  let pm: RegExpExecArray | null;
  while ((pm = pRe.exec(inner))) {
    const t = stripTags(pm[2]).trim();
    if (t) t.split(/\n+/).forEach(l => l.trim() && lines.push(l.trim()));
  }

  // 2. All <li> blocks
  const liRe = /<li(\s[^>]*)?>([\s\S]*?)<\/li>/gi;
  let lim: RegExpExecArray | null;
  while ((lim = liRe.exec(inner))) {
    const t = stripTags(lim[2]).trim();
    if (t) lines.push("• " + t);
  }

  // 3. All <h3> blocks (section headings)
  const h3Re = /<h3(\s[^>]*)?>([\s\S]*?)<\/h3>/gi;
  let h3m: RegExpExecArray | null;
  while ((h3m = h3Re.exec(inner))) {
    const t = stripTags(h3m[2]).trim();
    if (t) lines.push("## " + t);
  }

  // 4. All <h4> blocks (labels)
  const h4Re = /<h4(\s[^>]*)?>([\s\S]*?)<\/h4>/gi;
  let h4m: RegExpExecArray | null;
  while ((h4m = h4Re.exec(inner))) {
    const t = stripTags(h4m[2]).trim();
    if (t) lines.push("**" + t + "**");
  }

  // 5. Callout titles
  const ctRe = /<div\s+class="callout-title"[^>]*>([\s\S]*?)<\/div>/gi;
  let ctm: RegExpExecArray | null;
  while ((ctm = ctRe.exec(inner))) {
    const t = stripTags(ctm[1]).trim();
    if (t) lines.push("▶ " + t);
  }

  // 6. Grid cards (case studies, models, etc.)
  const cardRe = /<div\s+class="grid-card"[^>]*>([\s\S]*?)<\/div>\s*<\/div>/gi;
  let cm: RegExpExecArray | null;
  while ((cm = cardRe.exec(inner))) {
    const t = stripTags(cm[1]).trim().replace(/\n+/g, " ");
    if (t && t.length > 5) lines.push("◆ " + t);
  }

  // 7. KPI cards
  const kpiRe = /<div\s+class="kpi-card"[^>]*>([\s\S]*?)<\/div>/gi;
  let km: RegExpExecArray | null;
  while ((km = kpiRe.exec(inner))) {
    const t = stripTags(km[1]).trim().replace(/\n+/g, " ");
    if (t) lines.push("📊 " + t);
  }

  // 8. Stack nodes (framework steps)
  const snRe = /<div\s+class="stack-node"[^>]*>([\s\S]*?)<\/div>/gi;
  let snm: RegExpExecArray | null;
  while ((snm = snRe.exec(inner))) {
    const t = stripTags(snm[1]).trim().replace(/\n+/g, " ");
    if (t) lines.push("→ " + t);
  }

  // 9. Pricing card features
  const pcRe = /<div\s+class="pricing-card"[^>]*>([\s\S]*?)<\/div>/gi;
  let pcm: RegExpExecArray | null;
  while ((pcm = pcRe.exec(inner))) {
    const t = stripTags(pcm[1]).trim().replace(/\n+/g, " ");
    if (t && t.length > 5) lines.push("💰 " + t);
  }

  // 10. Triangle sides
  const tsRe = /<div\s+class="tri-side[^"]*"[^>]*>([\s\S]*?)<\/div>/gi;
  let tsm: RegExpExecArray | null;
  while ((tsm = tsRe.exec(inner))) {
    const t = stripTags(tsm[1]).trim().replace(/\n+/g, " ");
    if (t && t.length > 5) lines.push("▲ " + t);
  }

  // 11. Price tier/sub values
  const ptRe = /<div\s+class="price-(?:tier|val|sub)"[^>]*>([\s\S]*?)<\/div>/gi;
  let ptm: RegExpExecArray | null;
  while ((ptm = ptRe.exec(inner))) {
    const t = stripTags(ptm[1]).trim();
    if (t) lines.push("| " + t);
  }

  // 12. Outcome items (chapter learning outcomes — 63 occurrences!)
  const oiRe = /<div\s+class="outcome-item"[^>]*>([\s\S]*?)<\/div>/gi;
  let oim: RegExpExecArray | null;
  while ((oim = oiRe.exec(inner))) {
    const t = stripTags(oim[1]).trim();
    if (t) lines.push("✓ " + t);
  }

  // 13. Chapter subtitles/descriptions
  const csRe = /<div\s+class="chap-sub"[^>]*>([\s\S]*?)<\/div>/gi;
  let csm: RegExpExecArray | null;
  while ((csm = csRe.exec(inner))) {
    const t = stripTags(csm[1]).trim().replace(/\n+/g, " ");
    if (t && t.length > 5) lines.push(t);
  }

  // 14. Framework titles
  const fwRe = /<div\s+class="fw-title"[^>]*>([\s\S]*?)<\/div>/gi;
  let fwm: RegExpExecArray | null;
  while ((fwm = fwRe.exec(inner))) {
    const t = stripTags(fwm[1]).trim().replace(/\n+/g, " ");
    if (t) lines.push("🔑 " + t);
  }

  // 15. OS layers (operating system architecture)
  const osRe = /<div\s+class="os-layer"[^>]*>([\s\S]*?)<\/div>/gi;
  let osm: RegExpExecArray | null;
  while ((osm = osRe.exec(inner))) {
    const t = stripTags(osm[1]).trim().replace(/\n+/g, " ");
    if (t && t.length > 3) lines.push("⬡ " + t);
  }

  // 16. Time labels (scheduling system)
  const tlRe = /<span\s+class="time-label"[^>]*>([\s\S]*?)<\/span>/gi;
  let tlm: RegExpExecArray | null;
  while ((tlm = tlRe.exec(inner))) {
    const t = stripTags(tlm[1]).trim();
    if (t) lines.push("⏰ " + t);
  }

  // 17. Division subtitles
  const dsRe = /<p\s+class="div-sub"[^>]*>([\s\S]*?)<\/p>/gi;
  let dsm: RegExpExecArray | null;
  while ((dsm = dsRe.exec(inner))) {
    const t = stripTags(dsm[1]).trim();
    if (t && t.length > 5) lines.push(t);
  }

  // 18. KPI labels
  const klRe = /<span\s+class="kpi-label"[^>]*>([\s\S]*?)<\/span>/gi;
  let klm: RegExpExecArray | null;
  while ((klm = klRe.exec(inner))) {
    const t = stripTags(klm[1]).trim();
    if (t) lines.push("📊 " + t);
  }

  // 19. KPI values
  const kvRe = /<span\s+class="kpi-val"[^>]*>([\s\S]*?)<\/span>/gi;
  let kvm: RegExpExecArray | null;
  while ((kvm = kvRe.exec(inner))) {
    const t = stripTags(kvm[1]).trim();
    if (t) lines.push("📊 " + t);
  }

  // 20. Strong/bold text (important emphasis)
  const stRe = /<strong>([\s\S]*?)<\/strong>/gi;
  let stm: RegExpExecArray | null;
  while ((stm = stRe.exec(inner))) {
    const t = stripTags(stm[1]).trim();
    if (t && t.length > 10 && !lines.some(l => l.includes(t))) lines.push("⚡ " + t);
  }

  // 21. Price features list items in pricing cards
  const pfRe = /<li\s+class="price-features"[^>]*>([\s\S]*?)<\/li>/gi;
  let pfm: RegExpExecArray | null;
  while ((pfm = pfRe.exec(inner))) {
    const t = stripTags(pfm[1]).trim();
    if (t) lines.push("✓ " + t);
  }

  // 22. Worksheet lines and action templates
  const wlRe = /<div\s+class="worksheet-line"[^>]*>[\s\S]*?<\/div>/gi;
  // These are visual lines — skip

  // 23. Catch-all: extract ALL remaining text nodes from the entire block
  // This is the nuclear option — strip ALL tags and capture every text chunk
  const allText = stripTags(inner);
  const textLines = allText.split(/\n+/).map(l => l.trim()).filter(l => l && l.length > 3);
  for (const tl of textLines) {
    // Only add if not already captured (avoid duplicates)
    if (!lines.some(l => l.includes(tl.slice(0, 25)) || tl.includes(l.slice(0, 25)))) {
      lines.push(tl);
    }
  }

  return lines;
}

// --- Main parse ---
const blocks = extractPageBlocks(clean);

const chapters: ReaderChapter[] = [];
let pendingTitle: string | null = null;
let pendingId: string | null = null;
let allBodyLines: string[] = [];

function flushChapter() {
  if (pendingTitle && pendingId) {
    // Group lines into sections by ## headings
    const sections: Section[] = [];
    let current: Section = { heading: "Overview", body: [] };
    for (const line of allBodyLines) {
      if (line.startsWith("## ")) {
        if (current.body.length > 0) sections.push(current);
        current = { heading: line.replace(/^## /, ""), body: [] };
      } else {
        current.body.push(line);
      }
    }
    if (current.body.length > 0) sections.push(current);
    chapters.push({ id: pendingId, title: pendingTitle, sections });
  }
  pendingTitle = null;
  pendingId = null;
  allBodyLines = [];
}

for (const b of blocks) {
  const isOpener = /chapter-opener/.test(b.classes);
  if (isOpener) {
    flushChapter();
    const title = getChapterTitle(b.inner);
    if (title) {
      pendingTitle = title;
      const idMatch = b.inner.match(/id="(ch-\d+)"/i) || b.classes.match(/(ch-\d+)/i);
      pendingId = idMatch ? idMatch[1] : `ch-${chapters.length}`;
    }
    continue;
  }
  // Content page — extract all text
  if (pendingTitle) {
    allBodyLines.push(...extractAllText(b.inner));
  }
}
flushChapter();

// Also handle the introduction (ch-00) which may not have a chapter-opener class
// Check for "Introduction" / "LETTER FROM TASBIR" content before ch-01
const introBlocks = blocks.filter(b => {
  const title = getChapterTitle(b.inner);
  return title && /LETTER FROM TASBIR|Introduction/i.test(title);
});
if (introBlocks.length > 0 && chapters.length > 0 && chapters[0].title !== "LETTER FROM TASBIR") {
  const introLines: string[] = [];
  // Find content pages before ch-01 opener
  const ch01Idx = blocks.findIndex(b => /chapter-opener/.test(b.classes) && /ch-01/i.test(b.inner));
  if (ch01Idx > 0) {
    for (let i = 0; i < ch01Idx; i++) {
      const b = blocks[i];
      if (!/chapter-opener|section-divider|cover|copyright|toc-page|author-page/.test(b.classes)) {
        introLines.push(...extractAllText(b.inner));
      }
    }
    if (introLines.length > 0) {
      const sections: Section[] = [];
      let current: Section = { heading: "Overview", body: [] };
      for (const line of introLines) {
        if (line.startsWith("## ")) {
          if (current.body.length > 0) sections.push(current);
          current = { heading: line.replace(/^## /, ""), body: [] };
        } else {
          current.body.push(line);
        }
      }
      if (current.body.length > 0) sections.push(current);
      chapters.unshift({ id: "ch-0", title: "Letter from Tasbir", sections });
    }
  }
}

// Log results
let totalWords = 0;
console.log(`Parsed ${chapters.length} chapters:`);
for (const c of chapters) {
  const words = c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0);
  totalWords += words;
  console.log(`  ${c.id} — ${c.title} (${c.sections.length} sections, ~${words} words)`);
}
console.log(`Total: ~${totalWords} words (HTML has ~5810)`);

// --- Update the database ---
const chapterList = chapters.map((c) => ({
  title: c.title,
  pages: Math.max(3, Math.round(c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220)),
}));

async function main() {
  await db.book.update({
    where: { slug: "ai-agency-operating-system" },
    data: {
      content: JSON.stringify(chapters),
      chapters: JSON.stringify(chapterList),
      pages: 85,
    },
  });
  console.log(`\n✓ Updated: ${chapters.length} chapters, ~${totalWords} words.`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
