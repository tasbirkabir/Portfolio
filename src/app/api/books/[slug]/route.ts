import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

function serializeBook(b: any) {
  return {
    ...b,
    price: Number(b.price),
    originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    rating: Number(b.rating),
    whatYouLearn: JSON.parse(b.whatYouLearn),
    chapters: JSON.parse(b.chapters),
    faq: JSON.parse(b.faq),
    highlights: JSON.parse(b.highlights),
    content: JSON.parse(b.content),
  };
}

export async function GET(_req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const book = await db.book.findUnique({ where: { slug } });
  if (!book) return NextResponse.json({ error: "Not found" }, { status: 404 });
  const testimonials = await db.testimonial.findMany({ where: { bookSlug: slug } });
  return NextResponse.json({ book: serializeBook(book), testimonials });
}
