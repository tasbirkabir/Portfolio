import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.toLowerCase().trim() || "";
  if (!q) return NextResponse.json({ books: [], posts: [], resources: [] });

  const [books, posts, resources] = await Promise.all([
    db.book.findMany({
      where: {
        OR: [{ title: { contains: q } }, { subtitle: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }],
      },
      take: 8,
    }),
    db.blogPost.findMany({
      where: {
        OR: [{ title: { contains: q } }, { excerpt: { contains: q } }, { category: { contains: q } }],
      },
      take: 8,
    }),
    db.resource.findMany({
      where: {
        OR: [{ title: { contains: q } }, { description: { contains: q } }, { category: { contains: q } }, { type: { contains: q } }],
      },
      take: 8,
    }),
  ]);

  return NextResponse.json({
    books: books.map((b: any) => ({ slug: b.slug, title: b.title, subtitle: b.subtitle, category: b.category, accent: b.accent, coverStyle: b.coverStyle, badge: b.badge, price: Number(b.price) })),
    posts: posts.map((p: any) => ({ slug: p.slug, title: p.title, excerpt: p.excerpt, category: p.category, cover: p.cover, readTime: p.readTime })),
    resources: resources.map((r: any) => ({ slug: r.slug, title: r.title, description: r.description, type: r.type, category: r.category, accent: r.accent, accessType: r.accessType })),
  });
}
