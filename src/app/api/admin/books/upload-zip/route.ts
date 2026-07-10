import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";
import { processZipEbook } from "@/lib/ebook-publisher/zip-processor";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

/**
 * ZIP ebook upload endpoint.
 * Admin uploads a ZIP package → system extracts, processes, and publishes the ebook.
 *
 * The ZIP must contain at least one HTML file (chapter-*.html or index.html).
 * Optional: metadata.json, cover.jpg, assets/ folder.
 *
 * Flow:
 * 1. Admin uploads ZIP (or provides a slug to update an existing book)
 * 2. Create a book record (or use existing)
 * 3. Process the ZIP: extract chapters, assets, metadata
 * 4. Update the book with parsed content
 * 5. Return the published book
 */
export async function POST(req: NextRequest) {
  // Rate limit: 3 uploads per 10 minutes
  const rl = rateLimit(req, { windowMs: 10 * 60 * 1000, maxRequests: 3, keyPrefix: "zip_upload" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const admin = await requireAdmin();
  if (!admin) return errorResponse("Admin access required.", 403);

  try {
    const formData = await req.formData();
    const file = formData.get("zip") as File | null;
    const slug = (formData.get("slug") as string) || "";
    const existingBookId = (formData.get("bookId") as string) || "";

    if (!file) {
      return errorResponse("ZIP file is required.", 400);
    }

    // Validate file type
    const filename = file.name.toLowerCase();
    if (!filename.endsWith(".zip")) {
      return errorResponse("File must be a .zip archive.", 400);
    }

    // Validate file size (100MB max for ZIP packages)
    if (file.size > 100 * 1024 * 1024) {
      return errorResponse("ZIP file too large. Maximum 100MB.", 413);
    }

    const zipBuffer = Buffer.from(await file.arrayBuffer());

    // Determine the book to update (or create a new one)
    let bookId = existingBookId;
    let bookSlug = slug;

    if (bookId) {
      // Updating an existing book
      const existing = await db.book.findUnique({ where: { id: bookId } });
      if (!existing) return errorResponse("Book not found.", 404);
      bookSlug = existing.slug;
    } else {
      // Create a new book with minimal data (will be updated by the processor)
      if (!bookSlug) {
        bookSlug = `ebook-${Date.now().toString(36)}`;
      }
      bookSlug = bookSlug.toLowerCase().replace(/[^a-z0-9-]/g, "-").replace(/-+/g, "-").replace(/^-|-$/g, "");

      const existing = await db.book.findUnique({ where: { slug: bookSlug } });
      if (existing) {
        bookId = existing.id;
      } else {
        const newBook = await db.book.create({
          data: {
            title: "Processing...",
            slug: bookSlug,
            subtitle: "",
            description: "",
            price: 19,
            pages: 0,
            category: "AI Business",
            accent: "#1a1a1a",
            coverStyle: "editorial",
            accessType: "paid",
            status: "draft",
            content: "[]",
            chapters: "[]",
          },
        });
        bookId = newBook.id;
      }
    }

    // Process the ZIP package
    const result = await processZipEbook(zipBuffer, bookId, bookSlug);

    // Mark as published
    await db.book.update({
      where: { id: bookId },
      data: { status: "published" },
    });

    await logAudit({
      userId: admin.id,
      userEmail: admin.email,
      action: "zip_ebook_publish",
      targetType: "book",
      targetId: bookId,
      meta: {
        slug: bookSlug,
        title: result.book.title,
        chapters: result.chaptersParsed,
        assets: result.assetsImported,
        filename: file.name,
      },
    });

    return NextResponse.json({
      ok: true,
      book: {
        id: bookId,
        slug: bookSlug,
        title: result.book.title,
        chapters: result.chaptersParsed,
        pages: result.book.pages,
        coverPath: result.book.coverPath,
      },
      assetsImported: result.assetsImported,
      warnings: result.warnings,
    });
  } catch (e: any) {
    console.error("[ZIP Upload Error]", e);
    return errorResponse(e?.message || "Failed to process ZIP package.", 500);
  }
}
