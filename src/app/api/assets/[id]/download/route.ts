import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";
import { readFile, stat } from "fs/promises";
import path from "path";

/**
 * Secure asset download endpoint.
 *
 * Security:
 * - User must be authenticated
 * - User must have purchased the book (LibraryAccess verified server-side)
 * - Admins can download any asset
 * - File served from outside public/ (no public URLs)
 * - Download activity tracked
 * - Original filename preserved in Content-Disposition
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const user = await getCurrentUser();
    if (!user) return errorResponse("Authentication required.", 401);

    // Find the asset
    const asset = await db.asset.findUnique({
      where: { id },
      include: { book: { select: { slug: true, title: true, accessType: true } } },
    });
    if (!asset) return errorResponse("Asset not found.", 404);

    // Access check: admin OR purchased
    const isAdmin = user.role === "admin";
    const isFree = asset.book.accessType === "public" || asset.book.accessType === "free";

    if (!isAdmin && !isFree) {
      const access = await db.libraryAccess.findFirst({
        where: { userEmail: user.email, itemType: "book", itemSlug: asset.book.slug },
      });
      if (!access) {
        return errorResponse("You don't have access to this product. Purchase it first.", 403);
      }
    }

    // Resolve file path (outside public/)
    const filePath = path.join(process.cwd(), "storage", "assets", asset.storagePath);

    // Verify file exists
    try {
      await stat(filePath);
    } catch {
      return errorResponse("File not found on server.", 404);
    }

    // Read the file
    const buffer = await readFile(filePath);

    // Increment download counter
    await db.asset.update({
      where: { id: asset.id },
      data: { downloads: { increment: 1 } },
    });

    // Log the download
    await db.analyticsEvent.create({
      data: {
        type: "download",
        refSlug: asset.book.slug,
        value: 0,
        meta: JSON.stringify({
          userId: user.id,
          userEmail: user.email,
          assetId: asset.id,
          assetType: asset.type,
          filename: asset.filename,
          timestamp: new Date().toISOString(),
        }),
      },
    });

    // Serve the file with the original filename
    return new NextResponse(buffer, {
      headers: {
        "Content-Type": asset.fileType || "application/octet-stream",
        "Content-Disposition": `attachment; filename="${asset.filename.replace(/"/g, "'")}"`,
        "Content-Length": String(buffer.length),
        "Cache-Control": "private, no-store",
      },
    });
  } catch (e: any) {
    return errorResponse(e?.message || "Download failed.", 500);
  }
}
