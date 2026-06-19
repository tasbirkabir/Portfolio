import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ items: [], progress: [] });

  const [access, progress] = await Promise.all([
    db.libraryAccess.findMany({ where: { userEmail: user.email } }),
    db.readingProgress.findMany({ where: { userId: user.id } }),
  ]);

  const bookSlugs = access.filter((a) => a.itemType === "book").map((a) => a.itemSlug);
  const resourceSlugs = access.filter((a) => a.itemType === "resource").map((a) => a.itemSlug);

  const [books, resources] = await Promise.all([
    bookSlugs.length ? db.book.findMany({ where: { slug: { in: bookSlugs } } }) : Promise.resolve([]),
    resourceSlugs.length ? db.resource.findMany({ where: { slug: { in: resourceSlugs } } }) : Promise.resolve([]),
  ]);

  return NextResponse.json({
    items: [
      ...books.map((b: any) => ({ type: "book", slug: b.slug, title: b.title, accent: b.accent, coverStyle: b.coverStyle, category: b.category, badge: b.badge, subtitle: b.subtitle })),
      ...resources.map((r: any) => ({ type: "resource", slug: r.slug, title: r.title, accent: r.accent, type_label: r.type, category: r.category, description: r.description })),
    ],
    progress: progress.map((p: any) => ({ bookSlug: p.bookSlug, chapterIndex: p.chapterIndex, progress: p.progress })),
  });
}
