import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getSession } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  const session = await getSession();
  const now = new Date();
  const rows = await db.session.findMany({
    where: { userId: user.id, revokedAt: null, expiresAt: { gt: now } },
    orderBy: { lastActiveAt: "desc" },
    take: 50,
  });
  return NextResponse.json({
    sessions: rows.map((r) => ({
      id: r.id, sid: r.sid, deviceName: r.deviceName || "Unknown device",
      ip: r.ip || "unknown", userAgent: r.userAgent,
      createdAt: r.createdAt, lastActiveAt: r.lastActiveAt, expiresAt: r.expiresAt,
      current: session?.sid === r.sid,
    })),
  });
}
