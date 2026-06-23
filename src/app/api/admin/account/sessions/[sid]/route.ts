import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, revokeSession, getSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ sid: string }> }) {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  const session = await getSession();
  const { sid } = await params;
  if (session?.sid === sid) return errorResponse("Use sign out to end your current session.", 400);
  const ok = await revokeSession(sid, user.id);
  if (!ok) return errorResponse("Session not found or already ended.", 404);
  const row = await db.session.findUnique({ where: { sid } });
  await logAudit({ userId: user.id, userEmail: user.email, action: "session_revoke", targetType: "session", targetId: sid, meta: { device: row?.deviceName } });
  return NextResponse.json({ ok: true });
}
