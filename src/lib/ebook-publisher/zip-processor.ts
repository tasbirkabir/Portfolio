import AdmZip from "adm-zip";
import { writeFile, mkdir, readFile, stat } from "fs/promises";
import path from "path";
import { db } from "@/lib/db";

export type ProcessedBook = {
  book: any;
  chaptersParsed: number;
  assetsImported: number;
  warnings: string[];
};

export type ZipChapter = {
  id: string;
  title: string;
  sections: { heading: string; body: string[] }[];
};

/**
 * Process a ZIP ebook package.
 *
 * Expected structure:
 *   book.zip
 *   ├── metadata.json (optional but recommended)
 *   ├── cover.jpg (optional)
 *   ├── chapter-*.html or index.html (required — at least 1)
 *   ├── assets/ (optional — images, illustrations, icons, media)
 *   └── styles/ (optional — CSS)
 */
export async function processZipEbook(
  zipBuffer: Buffer,
  bookId: string,
  slug: string
): Promise<ProcessedBook> {
  const warnings: string[] = [];

  // Extract the ZIP
  const zip = new AdmZip(zipBuffer);
  const entries = zip.getEntries();

  // Build a simple file map: path → entry
  const fileMap = new Map<string, any>();
  for (const entry of entries) {
    if (!entry.isDirectory) {
      fileMap.set(entry.entryName, entry);
    }
  }

  // Helper to find a file by pattern
  const findFile = (pattern: RegExp): any | null => {
    for (const [path, entry] of fileMap) {
      if (pattern.test(path)) return entry;
    }
    return null;
  };

  // Helper to get all files matching a pattern
  const findFiles = (pattern: RegExp): any[] => {
    const result: any[] = [];
    for (const [path, entry] of fileMap) {
      if (pattern.test(path)) result.push(entry);
    }
    return result;
  };

  // --- 1. Find and parse metadata.json ---
  let metadata: any = {};
  const metaEntry = findFile(/metadata\.json$/);
  if (metaEntry) {
    try {
      metadata = JSON.parse(metaEntry.getData().toString("utf-8"));
    } catch {
      warnings.push("metadata.json found but could not be parsed.");
    }
  } else {
    warnings.push("No metadata.json found. Using defaults.");
  }

  // --- 2. Find and import cover image ---
  let coverPath: string | null = null;
  const coverEntry = findFile(/cover\.(jpg|jpeg|png|webp)$/i) || findFile(/index\.(jpg|jpeg|png|webp)$/i);
  if (coverEntry) {
    const ext = coverEntry.entryName.split(".").pop()?.toLowerCase() || "jpg";
    const coverFilename = `${slug}-cover.${ext}`;
    const coverDest = path.join(process.cwd(), "public", "covers", coverFilename);
    await mkdir(path.dirname(coverDest), { recursive: true });
    await writeFile(coverDest, coverEntry.getData());
    coverPath = `/covers/${coverFilename}`;
  }

  // --- 3. Import assets (images, illustrations, icons, media) ---
  let assetsImported = 0;
  const assetPathMap = new Map<string, string>();
  const assetEntries = findFiles(/\.(jpg|jpeg|png|webp|svg|gif|css)$/i).filter(
    (e) => e.entryName.includes("assets/") || e.entryName.includes("images/")
  );

  if (assetEntries.length > 0) {
    const assetsDir = path.join(process.cwd(), "public", "ebook-assets", slug);
    await mkdir(assetsDir, { recursive: true });

    for (const entry of assetEntries) {
      const filename = path.basename(entry.entryName);
      const dest = path.join(assetsDir, filename);
      await writeFile(dest, entry.getData());
      const publicPath = `/ebook-assets/${slug}/${filename}`;
      assetPathMap.set(entry.entryName, publicPath);
      assetPathMap.set(filename, publicPath);
      assetsImported++;
    }
  }

  // --- 4. Find and parse HTML chapter files ---
  const htmlEntries = findFiles(/\.html$/i).filter(
    (e) => !e.entryName.endsWith("metadata.html")
  ).sort((a, b) => {
    const aName = a.entryName;
    const bName = b.entryName;
    if (aName.includes("index") && !bName.includes("index")) return -1;
    if (!aName.includes("index") && bName.includes("index")) return 1;
    const aNum = parseInt(aName.match(/chapter-(\d+)/i)?.[1] || "999");
    const bNum = parseInt(bName.match(/chapter-(\d+)/i)?.[1] || "999");
    if (aNum !== bNum) return aNum - bNum;
    return aName.localeCompare(bName);
  });

  if (htmlEntries.length === 0) {
    throw new Error("No HTML files found in the ZIP package.");
  }

  const chapters: ZipChapter[] = [];

  for (let i = 0; i < htmlEntries.length; i++) {
    const entry = htmlEntries[i];
    const html = entry.getData().toString("utf-8");
    const chapter = parseHtmlToChapter(html, i, assetPathMap);
    chapters.push(chapter);
  }

  // --- 5. Build the book data ---
  const title = metadata.title || slug.replace(/-/g, " ").replace(/\b\w/g, (c: string) => c.toUpperCase());
  const description = metadata.description || "";
  const category = metadata.category || "AI Business";
  const price = Number(metadata.price) || 19;
  const tags = Array.isArray(metadata.tags) ? metadata.tags : [];

  // Build chapter metadata list (for TOC display)
  const chapterList = chapters.map((c) => ({
    title: c.title,
    pages: Math.max(
      3,
      Math.round(
        c.sections.reduce((a, s) => a + s.body.join(" ").split(/\s+/).length, 0) / 220
      )
    ),
  }));

  const totalPages = chapterList.reduce((a, c) => a + c.pages, 0);

  // --- 6. Update the book record in the database ---
  await db.book.update({
    where: { id: bookId },
    data: {
      title,
      subtitle: metadata.subtitle || metadata.description?.slice(0, 120) || "",
      description,
      price,
      pages: totalPages,
      category,
      content: JSON.stringify(chapters),
      chapters: JSON.stringify(chapterList),
      whatYouLearn: JSON.stringify(tags.map((t: string) => t)),
      highlights: JSON.stringify([
        `${totalPages} pages across ${chapters.length} chapters`,
        "Built-in premium ebook reader",
        "Imported from ZIP package",
      ]),
    },
  });

  return {
    book: { title, chapters: chapters.length, pages: totalPages, coverPath },
    chaptersParsed: chapters.length,
    assetsImported,
    warnings,
  };
}

/**
 * Parse an HTML file into a reader chapter.
 * Extracts H1 as chapter title, H2/H3 as section headings,
 * and all text content as body paragraphs.
 * Rewrites asset paths to point to the public directory.
 */
function parseHtmlToChapter(
  html: string,
  index: number,
  assetPathMap: Map<string, string>
): ZipChapter {
  // Rewrite asset paths
  let processedHtml = html;
  for (const [originalPath, publicPath] of assetPathMap) {
    // Handle src="assets/images/foo.jpg", src="images/foo.jpg", etc.
    const escaped = originalPath.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    processedHtml = processedHtml.replace(
      new RegExp(`src=["']?[^"']*${escaped}["']?`, "gi"),
      `src="${publicPath}"`
    );
    // Also handle url() in inline styles
    processedHtml = processedHtml.replace(
      new RegExp(`url\\(["']?[^"')]*${escaped}["']?\\)`, "gi"),
      `url("${publicPath}")`
    );
  }

  // Strip scripts and styles
  processedHtml = processedHtml.replace(/<script[^>]*>[\s\S]*?<\/script>/gi, "");
  processedHtml = processedHtml.replace(/<style[^>]*>[\s\S]*?<\/style>/gi, "");
  processedHtml = processedHtml.replace(/<!--[\s\S]*?-->/g, "");

  // Extract H1 as chapter title
  const h1Match = processedHtml.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  const title = h1Match
    ? stripTags(h1Match[1]).trim().replace(/\s+/g, " ") || `Chapter ${index + 1}`
    : `Chapter ${index + 1}`;

  // Remove the H1 from the body (it's the chapter title, not body content)
  processedHtml = processedHtml.replace(/<h1[^>]*>[\s\S]*?<\/h1>/i, "");

  // Split by H2 headings to create sections
  const sections: { heading: string; body: string[] }[] = [];

  // Split on H2 tags
  const h2Split = processedHtml.split(/<h2[^>]*>/i);
  if (h2Split.length > 1) {
    // First part is content before the first H2
    const intro = h2Split[0];
    const introLines = extractTextBlocks(intro, assetPathMap);
    if (introLines.length > 0) {
      sections.push({ heading: "Overview", body: introLines });
    }

    // Each subsequent part starts with an H2
    for (let i = 1; i < h2Split.length; i++) {
      const part = h2Split[i];
      const h2End = part.indexOf("</h2>");
      const heading = h2End >= 0 ? stripTags(part.slice(0, h2End)).trim() : `Section ${i}`;
      const body = h2End >= 0 ? part.slice(h2End + 5) : part;
      const lines = extractTextBlocks(body, assetPathMap);
      if (lines.length > 0) {
        sections.push({ heading, body: lines });
      }
    }
  } else {
    // No H2s — try H3
    const h3Split = processedHtml.split(/<h3[^>]*>/i);
    if (h3Split.length > 1) {
      const intro = h3Split[0];
      const introLines = extractTextBlocks(intro, assetPathMap);
      if (introLines.length > 0) {
        sections.push({ heading: "Overview", body: introLines });
      }
      for (let i = 1; i < h3Split.length; i++) {
        const part = h3Split[i];
        const h3End = part.indexOf("</h3>");
        const heading = h3End >= 0 ? stripTags(part.slice(0, h3End)).trim() : `Section ${i}`;
        const body = h3End >= 0 ? part.slice(h3End + 5) : part;
        const lines = extractTextBlocks(body, assetPathMap);
        if (lines.length > 0) {
          sections.push({ heading, body: lines });
        }
      }
    } else {
      // No headings at all — single section
      const lines = extractTextBlocks(processedHtml, assetPathMap);
      if (lines.length > 0) {
        sections.push({ heading: "Content", body: lines });
      }
    }
  }

  if (sections.length === 0) {
    sections.push({ heading: "Content", body: ["No content could be extracted from this chapter."] });
  }

  return { id: `ch-${index}`, title, sections };
}

/**
 * Extract text blocks from HTML.
 * Captures: <p>, <li>, <blockquote>, <td>, callout text, image references, and raw text.
 * Preserves image tags as <img> elements for the reader to render.
 */
function extractTextBlocks(html: string, assetPathMap: Map<string, string>): string[] {
  const lines: string[] = [];

  // 1. <img> tags — preserve as HTML for the reader to render
  const imgRe = /<img[^>]*src=["']([^"']+)["'][^>]*>/gi;
  let imgMatch: RegExpExecArray | null;
  while ((imgMatch = imgRe.exec(html))) {
    let src = imgMatch[1];
    // Rewrite path if it's a local asset
    const filename = path.basename(src);
    if (assetPathMap.has(filename)) src = assetPathMap.get(filename)!;
    else if (assetPathMap.has(src)) src = assetPathMap.get(src)!;
    const alt = imgMatch[0].match(/alt=["']([^"']*)["']/i)?.[1] || "";
    lines.push(`<img src="${src}" alt="${alt}" />`);
  }

  // 2. <p> tags
  const pRe = /<p(\s[^>]*)?>([\s\S]*?)<\/p>/gi;
  let pm: RegExpExecArray | null;
  while ((pm = pRe.exec(html))) {
    const t = stripTagsButKeepImg(pm[2]).trim();
    if (t) lines.push(t);
  }

  // 3. <li> tags (list items)
  const liRe = /<li(\s[^>]*)?>([\s\S]*?)<\/li>/gi;
  let lim: RegExpExecArray | null;
  while ((lim = liRe.exec(html))) {
    const t = stripTagsButKeepImg(lim[2]).trim();
    if (t) lines.push("• " + t);
  }

  // 4. <blockquote> tags
  const bqRe = /<blockquote(\s[^>]*)?>([\s\S]*?)<\/blockquote>/gi;
  let bqm: RegExpExecArray | null;
  while ((bqm = bqRe.exec(html))) {
    const t = stripTagsButKeepImg(bqm[2]).trim().replace(/\n+/g, " ");
    if (t) lines.push("> " + t);
  }

  // 5. <td> tags (table cells)
  const tdRe = /<td(\s[^>]*)?>([\s\S]*?)<\/td>/gi;
  let tdm: RegExpExecArray | null;
  while ((tdm = tdRe.exec(html))) {
    const t = stripTagsButKeepImg(tdm[2]).trim().replace(/\n+/g, " ");
    if (t && t.length > 2) lines.push("| " + t);
  }

  // 6. <h3> tags (sub-headings within sections)
  const h3Re = /<h3(\s[^>]*)?>([\s\S]*?)<\/h3>/gi;
  let h3m: RegExpExecArray | null;
  while ((h3m = h3Re.exec(html))) {
    const t = stripTags(h3m[2]).trim();
    if (t) lines.push("**" + t + "**");
  }

  // 7. Any remaining substantial text (catch-all for text not in tags)
  const remaining = stripTags(html).trim();
  if (remaining && remaining.length > 20) {
    const remainingLines = remaining.split(/\n+/).map((l) => l.trim()).filter((l) => l.length > 10);
    for (const rl of remainingLines) {
      if (!lines.some((l) => l.includes(rl.slice(0, 25)) || rl.includes(l.slice(0, 25)))) {
        lines.push(rl);
      }
    }
  }

  return lines;
}

function stripTags(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li|strong|em|span|td|tr|table)>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/** Strip tags but preserve <img> tags (for inline images in paragraphs) */
function stripTagsButKeepImg(s: string): string {
  return s
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/(p|div|h\d|li|strong|em|span|td|tr|table)>/gi, "\n")
    .replace(/<(?!img)[^>]+>/g, "") // remove all tags except <img>
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ")
    .replace(/[ \t]+/g, " ")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}
