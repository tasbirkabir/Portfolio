import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { errorResponse } from "@/lib/security/validation";

function serializeBook(b: any, includeContent: boolean) {
  const base = {
    ...b,
    price: Number(b.price),
    originalPrice: b.originalPrice ? Number(b.originalPrice) : null,
    rating: Number(b.rating),
    whatYouLearn: JSON.parse(b.whatYouLearn),
    chapters: JSON.parse(b.chapters),
    faq: JSON.parse(b.faq),
    highlights: JSON.parse(b.highlights),
  };
  // Return ALL chapters with full content. The reader's preview gate
  // (previewLimitIndex) handles access control — it blocks navigation
  // past the free preview chapters and shows the paywall CTA.
  // This way the reader can show the full table of contents AND
  // the content is available immediately after purchase (no re-fetch needed).
  base.content = b.content ? JSON.parse(b.content) : [];
  return base;
}

export async function GET(req: NextRequest, { params }: { params: Promise<{ slug: string }> }) {
  // Rate limit: 60 requests per minute
  const rl = rateLimit(req, { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: "book_view" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const { slug } = await params;
  const book = await db.book.findUnique({ where: { slug } });
  if (!book) return errorResponse("Not found", 404);

  // Determine access level
  const user = await getCurrentUser();
  const accessType = book.accessType || "paid";
  let hasAccess = false;

  if (accessType === "public" || accessType === "free") {
    hasAccess = true;
  } else if (accessType === "email-gate") {
    hasAccess = !!user;
  } else if (accessType === "paid" || accessType === "members") {
    if (user) {
      const access = await db.libraryAccess.findFirst({
        where: { userEmail: user.email, itemType: "book", itemSlug: slug },
      });
      hasAccess = !!access || user.role === "admin";
    }
  }

  const testimonials = await db.testimonial.findMany({ where: { bookSlug: slug } });

  // Fetch downloadable assets — only return metadata (not storage paths) for users with access
  const assets = hasAccess
    ? await db.asset.findMany({
        where: { bookId: book.id },
        orderBy: { createdAt: "asc" },
        select: { id: true, type: true, label: true, filename: true, fileSize: true, downloads: true },
      })
    : [];

  // Only include premium content if the user has verified access
  return NextResponse.json({
    book: serializeBook(book, hasAccess),
    testimonials,
    assets,
    hasAccess,
  });
}
