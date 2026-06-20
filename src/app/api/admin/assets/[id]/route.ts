import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";
import { unlink } from "fs/promises";
import path from "path";

/** Delete an asset (admin only) — removes the file from storage + the DB record. */
export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("Admin access required.", 403);

  try {
    const { id } = await params;
    const asset = await db.asset.findUnique({ where: { id } });
    if (!asset) return errorResponse("Asset not found.", 404);

    // Delete the file from storage
    const filePath = path.join(process.cwd(), "storage", "assets", asset.storagePath);
    try { await unlink(filePath); } catch { /* file may already be gone */ }

    // Delete the DB record
    await db.asset.delete({ where: { id } });

    await logAudit({
      userId: admin.id,
      userEmail: admin.email,
      action: "asset_delete",
      targetType: "book",
      targetId: asset.bookId,
      meta: { assetId: id, type: asset.type, filename: asset.filename },
    });

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return errorResponse(e?.message || "Delete failed.", 500);
  }
}
