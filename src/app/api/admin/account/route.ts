import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse, emailSchema, nameSchema } from "@/lib/security/validation";
import { logAudit } from "@/lib/security/audit";

/** GET /api/admin/account — current admin profile. */
export async function GET() {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  const profile = await db.profile.findUnique({ where: { id: user.id } });
  return NextResponse.json({
    account: {
      id: user.id, email: user.email, name: user.name, role: user.role,
      profileImage: user.profileImage, twoFactorEnabled: false,
      lastLoginAt: profile?.lastLoginAt, lastLoginIp: profile?.lastLoginIp,
      passwordChangedAt: null, createdAt: profile?.createdAt,
    },
  });
}

/** PUT /api/admin/account — update name, email, profile image. */
export async function PUT(req: NextRequest) {
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid body.", 400); }

  const data: any = {};
  if (body.name !== undefined) { const n = nameSchema.safeParse(body.name); if (!n.success) return errorResponse("Invalid name.", 400); data.name = n.data; }
  if (body.profileImage !== undefined) data.profileImage = typeof body.profileImage === "string" && body.profileImage.length <= 2048 ? body.profileImage : null;

  const updated = await db.profile.update({ where: { id: user.id }, data });
  await logAudit({ userId: user.id, userEmail: user.email, action: "account_update", targetType: "profile", targetId: user.id, meta: { fields: Object.keys(data) } });
  return NextResponse.json({
    account: { id: updated.id, email: updated.email, name: updated.name, role: updated.role, profileImage: updated.profileImage, lastLoginAt: updated.lastLoginAt, lastLoginIp: updated.lastLoginIp, createdAt: updated.createdAt },
  });
}
