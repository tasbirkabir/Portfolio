import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin, getSession, revokeAllSessions, ipFromRequest } from "@/lib/auth/session";
import { verifyPassword, hashPassword, validatePasswordPolicy } from "@/lib/auth/passwords";
import { errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logAudit, logSecurityEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 12, keyPrefix: "pwchange" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);
  const session = await getSession();
  if (!session) return errorResponse("Session expired.", 401);

  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid body.", 400); }
  const { currentPassword, newPassword, confirmPassword } = body || {};
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || typeof confirmPassword !== "string") return errorResponse("All fields are required.", 400);
  if (newPassword !== confirmPassword) return errorResponse("New password and confirmation don't match.", 400);

  const okCurrent = await verifyPassword(currentPassword, user.password);
  if (!okCurrent) {
    await logSecurityEvent({ type: "failed_password_change", ip: ipFromRequest(req), email: user.email, meta: { reason: "wrong_current" } });
    return errorResponse("Your current password is incorrect.", 401);
  }
  if (currentPassword === newPassword) return errorResponse("New password must be different from the current one.", 400);

  const policy = validatePasswordPolicy(newPassword);
  if (!policy.valid) return errorResponse(policy.errors.join(" "), 400);

  const hashed = await hashPassword(newPassword);
  await db.user.update({ where: { id: user.id }, data: { password: hashed, passwordChangedAt: new Date() } });
  await revokeAllSessions(user.id, session.sid);
  await logAudit({ userId: user.id, userEmail: user.email, action: "password_change", targetType: "user", targetId: user.id });
  await logSecurityEvent({ type: "password_change", ip: ipFromRequest(req), email: user.email });
  return NextResponse.json({ ok: true });
}
