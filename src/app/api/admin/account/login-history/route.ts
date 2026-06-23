import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, deviceLabelFromUA } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  const rows = await db.loginHistory.findMany({
    where: { OR: [{ userId: user.id }, { email: user.email }] },
    orderBy: { createdAt: "desc" },
    take: 30,
  });
  return NextResponse.json({
    history: rows.map((r) => ({
      id: r.id, ip: r.ip || "unknown", deviceName: deviceLabelFromUA(r.userAgent),
      success: r.success, reason: r.reason, createdAt: r.createdAt,
    })),
  });
}
