import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

function ser(b: any) {
  return {
    ...b,
    price: Number(b.price),
    originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    rating: Number(b.rating),
    whatYouLearn: JSON.parse(b.whatYouLearn || "[]"),
    chapters: JSON.parse(b.chapters || "[]"),
    faq: JSON.parse(b.faq || "[]"),
    highlights: JSON.parse(b.highlights || "[]"),
    content: b.content ? JSON.parse(b.content) : [],
  };
}

export async function GET() {
  const books = await db.book.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ books: books.map(ser) });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const data: any = {
    title: body.title,
    slug: body.slug || body.title.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
    subtitle: body.subtitle || "",
    description: body.description || "",
    price: Number(body.price) || 0,
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    pages: Number(body.pages) || 0,
    category: body.category || "AI Business",
    accent: body.accent || "#1a1a1a",
    coverStyle: body.coverStyle || "editorial",
    badge: body.badge || null,
    featured: !!body.featured,
    accessType: body.accessType || "paid",
    status: body.status || "published",
    whatYouLearn: JSON.stringify(body.whatYouLearn || []),
    chapters: JSON.stringify(body.chapters || []),
    faq: JSON.stringify(body.faq || []),
    highlights: JSON.stringify(body.highlights || []),
    content: JSON.stringify(body.content || []),
    seoTitle: body.seoTitle || null,
    seoDesc: body.seoDesc || null,
  };
  const book = await db.book.create({ data });
  return NextResponse.json({ book: ser(book) });
}
