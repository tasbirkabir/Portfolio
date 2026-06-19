import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  const [books, posts, resources] = await Promise.all([
    db.book.findMany({ where: { status: "published" } }),
    db.blogPost.findMany({ where: { status: "published" } }),
    db.resource.findMany({ where: { status: "published" } }),
  ]);

  const base = "https://tasbirkabir.site";
  const urls = [
    { loc: `${base}/`, priority: "1.0" },
    { loc: `${base}/?v=about`, priority: "0.7" },
    { loc: `${base}/?v=books`, priority: "0.9" },
    { loc: `${base}/?v=resources`, priority: "0.8" },
    { loc: `${base}/?v=blog`, priority: "0.8" },
    { loc: `${base}/?v=contact`, priority: "0.5" },
    ...books.map((b) => ({ loc: `${base}/?v=book&slug=${b.slug}`, priority: "0.8" })),
    ...posts.map((p) => ({ loc: `${base}/?v=post&slug=${p.slug}`, priority: "0.7" })),
    ...resources.map((r) => ({ loc: `${base}/?v=resources&slug=${r.slug}`, priority: "0.6" })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url><loc>${u.loc}</loc><priority>${u.priority}</priority><changefreq>weekly</changefreq></url>`
  )
  .join("\n")}
</urlset>`;

  return new Response(xml, {
    headers: { "Content-Type": "application/xml; charset=utf-8" },
  });
}
