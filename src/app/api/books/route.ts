import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  const category = req.nextUrl.searchParams.get("category");
  const featuredOnly = req.nextUrl.searchParams.get("featured") === "1";
  const where: any = {};
  if (category && category !== "All") where.category = category;
  if (featuredOnly) where.featured = true;

  const books = await db.book.findMany({
    where,
    orderBy: [{ featured: "desc" }, { buyers: "desc" }],
  });

  const light = books.map((b: any) => ({
    id: b.id,
    title: b.title,
    slug: b.slug,
    subtitle: b.subtitle,
    description: b.description,
    price: Number(b.price),
    originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    pages: b.pages,
    category: b.category,
    accent: b.accent,
    coverStyle: b.coverStyle,
    badge: b.badge,
    featured: b.featured,
    rating: Number(b.rating),
    reviewsCount: b.reviewsCount,
    buyers: b.buyers,
  }));

  return NextResponse.json({ books: light });
}
