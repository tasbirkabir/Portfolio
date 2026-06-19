// Export all DB content to static JSON files in /public/data/ for static hosting.
import fs from "fs";
import path from "path";
import { db } from "../src/lib/db";

const OUT = path.resolve("public/data");
fs.mkdirSync(OUT, { recursive: true });

function write(name: string, data: any) {
  fs.writeFileSync(path.join(OUT, name), JSON.stringify(data, null, 2));
  console.log(`  ✓ ${name} (${JSON.stringify(data).length} bytes)`);
}

function serBook(b: any, full = false) {
  const base = {
    id: b.id, title: b.title, slug: b.slug, subtitle: b.subtitle, description: b.description,
    price: Number(b.price), originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    pages: b.pages, category: b.category, accent: b.accent, coverStyle: b.coverStyle,
    badge: b.badge, featured: b.featured, rating: Number(b.rating), reviewsCount: b.reviewsCount,
    buyers: b.buyers, accessType: b.accessType, status: b.status,
    whatYouLearn: JSON.parse(b.whatYouLearn || "[]"),
    chapters: JSON.parse(b.chapters || "[]"),
    faq: JSON.parse(b.faq || "[]"),
    highlights: JSON.parse(b.highlights || "[]"),
    seoTitle: b.seoTitle, seoDesc: b.seoDesc,
  };
  if (full) {
    return { ...base, content: b.content ? JSON.parse(b.content) : [] };
  }
  return base;
}

async function main() {
  console.log("Exporting static data to public/data/ ...");

  // Books (list — light payload)
  const books = await db.book.findMany({ orderBy: [{ featured: "desc" }, { buyers: "desc" }] });
  write("books.json", { books: books.map((b) => serBook(b, false)) });

  // Books (full — one file per slug, includes reader content)
  for (const b of books) {
    const testimonials = await db.testimonial.findMany({ where: { bookSlug: b.slug } });
    write(`book-${b.slug}.json`, { book: serBook(b, true), testimonials });
  }

  // Resources
  const resources = await db.resource.findMany({ orderBy: [{ downloads: "desc" }] });
  write("resources.json", { resources });

  // Blog (list)
  const posts = await db.blogPost.findMany({ orderBy: [{ publishedAt: "desc" }] });
  write("blog.json", { posts: posts.map((p) => ({ ...p, tags: JSON.parse(p.tags || "[]") })) });

  // Blog (full — one file per slug)
  for (const p of posts) {
    write(`post-${p.slug}.json`, { post: { ...p, tags: JSON.parse(p.tags || "[]") } });
  }

  // Testimonials
  const testimonials = await db.testimonial.findMany({ orderBy: [{ rating: "desc" }] });
  write("testimonials.json", { testimonials });

  // Site settings
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (s) {
    write("settings.json", { settings: { ...s, navItems: JSON.parse(s.navItems || "[]") } });
  }

  // Manifest (for the reader to know which books exist)
  write("manifest.json", {
    books: books.map((b) => ({ slug: b.slug, title: b.title, accessType: b.accessType, price: Number(b.price) })),
    generatedAt: new Date().toISOString(),
  });

  console.log("\n✅ Static data export complete.");
  console.log(`   ${books.length} books, ${resources.length} resources, ${posts.length} posts, ${testimonials.length} testimonials`);
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await db.$disconnect(); });
