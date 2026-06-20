const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const appPath = path.join(root, "src/app");
const outPath = path.join(root, "out");

// Directories to hide during Next.js static build
const targets = [
  { name: "api", original: path.join(appPath, "api"), backup: path.join(root, "api-backup-temp") },
  { name: "robots", original: path.join(appPath, "robots"), backup: path.join(root, "robots-backup-temp") },
  { name: "rss.xml", original: path.join(appPath, "rss.xml"), backup: path.join(root, "rss-backup-temp") },
  { name: "sitemap.xml", original: path.join(appPath, "sitemap.xml"), backup: path.join(root, "sitemap-backup-temp") }
];

try {
  // 1. Back up target folders by renaming them
  for (const target of targets) {
    if (fs.existsSync(target.original)) {
      console.log(`📦 Backing up ${target.name} routes...`);
      fs.renameSync(target.original, target.backup);
    }
  }

  // 2. Run next build
  console.log("🚀 Running Next.js build...");
  execSync("npx next build", { stdio: "inherit" });

  console.log("✅ Build successful!");

  // 3. Post-build generation of static SEO files
  if (fs.existsSync(outPath)) {
    console.log("⚡ Generating static SEO files (robots.txt, sitemap.xml, rss.xml)...");

    const base = "https://tasbirkabir.site";

    // A. Copy robots.txt
    const robotsSrc = path.join(root, "public/robots.txt");
    const robotsDest = path.join(outPath, "robots.txt");
    if (fs.existsSync(robotsSrc)) {
      fs.copyFileSync(robotsSrc, robotsDest);
      console.log("   ✓ Generated robots.txt");
    }

    // B. Read JSON data
    let books = [];
    let posts = [];
    let resources = [];

    try {
      const booksData = JSON.parse(fs.readFileSync(path.join(outPath, "data/books.json"), "utf8"));
      books = booksData.books || [];
    } catch {}

    try {
      const blogData = JSON.parse(fs.readFileSync(path.join(outPath, "data/blog.json"), "utf8"));
      posts = blogData.posts || [];
    } catch {}

    try {
      const resourcesData = JSON.parse(fs.readFileSync(path.join(outPath, "data/resources.json"), "utf8"));
      resources = resourcesData.resources || [];
    } catch {}

    // C. Generate sitemap.xml
    const urls = [
      { loc: `${base}/`, priority: "1.0" },
      { loc: `${base}/?v=about`, priority: "0.7" },
      { loc: `${base}/?v=books`, priority: "0.9" },
      { loc: `${base}/?v=resources`, priority: "0.8" },
      { loc: `${base}/?v=blog`, priority: "0.8" },
      { loc: `${base}/?v=contact`, priority: "0.5" },
      ...books.filter(b => b.status === "published" || !b.status).map((b) => ({ loc: `${base}/?v=book&slug=${b.slug}`, priority: "0.8" })),
      ...posts.filter(p => p.status === "published" || !p.status).map((p) => ({ loc: `${base}/?v=post&slug=${p.slug}`, priority: "0.7" })),
      ...resources.filter(r => r.status === "published" || !r.status).map((r) => ({ loc: `${base}/?v=resources&slug=${r.slug}`, priority: "0.6" })),
    ];

    const sitemapXml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority><changefreq>weekly</changefreq></url>`).join("\n")}
</urlset>`;

    fs.writeFileSync(path.join(outPath, "sitemap.xml"), sitemapXml);
    console.log("   ✓ Generated sitemap.xml");

    // D. Generate rss.xml
    const escapeXml = (s) => s.replace(/[<>&'"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", "'": "&apos;", '"': "&quot;" }[c]));
    const rssItems = posts
      .filter(p => p.status === "published" || !p.status)
      .slice(0, 20)
      .map((p) => `    <item>
      <title>${escapeXml(p.title)}</title>
      <link>${base}/?v=post&slug=${p.slug}</link>
      <guid isPermaLink="false">${p.slug}</guid>
      <pubDate>${p.publishedAt ? new Date(p.publishedAt).toUTCString() : new Date().toUTCString()}</pubDate>
      <description>${escapeXml(p.excerpt || "")}</description>
    </item>`)
      .join("\n");

    const rssXml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
  <channel>
    <title>Tasbir Kabir — Journal</title>
    <link>${base}/?v=blog</link>
    <description>Essays on building digital systems that scale.</description>
    <language>en</language>
${rssItems}
  </channel>
</rss>`;

    fs.writeFileSync(path.join(outPath, "rss.xml"), rssXml);
    console.log("   ✓ Generated rss.xml");
  }
} catch (error) {
  console.error("❌ Build failed:", error);
  process.exit(1);
} finally {
  // 4. Restore target folders
  for (const target of targets) {
    if (fs.existsSync(target.backup)) {
      console.log(`🔄 Restoring ${target.name} routes...`);
      if (fs.existsSync(target.original)) {
        fs.rmSync(target.original, { recursive: true, force: true });
      }
      fs.renameSync(target.backup, target.original);
    }
  }
}
