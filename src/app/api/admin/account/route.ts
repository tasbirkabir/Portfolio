import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse, emailSchema, nameSchema } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";

export async function GET() {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  return NextResponse.json({
    account: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      profileImage: user.profileImage, twoFactorEnabled: user.twoFactorEnabled,
      lastLoginAt: user.lastLoginAt, lastLoginIp: user.lastLoginIp,
      passwordChangedAt: user.passwordChangedAt, createdAt: user.createdAt,
    },
  });
}

export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid body.", 400); }

  const data: any = {};
  if (body.name !== undefined) { const n = nameSchema.safeParse(body.name); if (!n.success) return errorResponse("Invalid name.", 400); data.name = n.data; }
  if (body.email !== undefined) { const e = emailSchema.safeParse(body.email); if (!e.success) return errorResponse("Invalid email.", 400); if (e.data !== user.email) { const t = await db.user.findUnique({ where: { email: e.data } }); if (t) return errorResponse("That email is already in use.", 409); } data.email = e.data; }
  if (body.profileImage !== undefined) data.profileImage = typeof body.profileImage === "string" && body.profileImage.length <= 2048 ? body.profileImage : null;

  const updated = await db.user.update({ where: { id: user.id }, data });
  await logAudit({ userId: user.id, userEmail: user.email, action: "account_update", targetType: "user", targetId: user.id, meta: { fields: Object.keys(data) } });
  return NextResponse.json({
    account: { id: updated.id, email: updated.email, name: updated.name, role: updated.role, profileImage: updated.profileImage, twoFactorEnabled: updated.twoFactorEnabled, lastLoginAt: updated.lastLoginAt, lastLoginIp: updated.lastLoginIp, passwordChangedAt: updated.passwordChangedAt, createdAt: updated.createdAt },
  });
}
