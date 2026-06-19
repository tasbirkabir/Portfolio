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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  const body = await req.json();
  const existing = await db.book.findUnique({ where: { slug } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const data: any = {
    title: body.title,
    slug: body.slug || slug,
    subtitle: body.subtitle,
    description: body.description,
    price: Number(body.price),
    originalPrice: body.originalPrice ? Number(body.originalPrice) : null,
    pages: Number(body.pages),
    category: body.category,
    accent: body.accent,
    coverStyle: body.coverStyle,
    badge: body.badge || null,
    featured: !!body.featured,
    accessType: body.accessType,
    status: body.status,
    whatYouLearn: JSON.stringify(body.whatYouLearn || []),
    chapters: JSON.stringify(body.chapters || []),
    faq: JSON.stringify(body.faq || []),
    highlights: JSON.stringify(body.highlights || []),
    content: JSON.stringify(body.content || []),
    seoTitle: body.seoTitle || null,
    seoDesc: body.seoDesc || null,
  };
  const book = await db.book.update({ where: { slug }, data });
  return NextResponse.json({ book: ser(book) });
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { slug } = await params;
  await db.book.delete({ where: { slug } });
  return NextResponse.json({ ok: true });
}
