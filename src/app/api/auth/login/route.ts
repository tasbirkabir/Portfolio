import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, ipFromRequest } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/passwords";
import { loginSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";
import { signPendingToken } from "@/lib/auth/pending-token";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "login" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const ip = ipFromRequest(req);
  const ua = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) return errorResponse("Invalid email or password.", 400);
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      await logSecurityEvent({ type: "failed_login", ip, email, meta: { reason: "user_not_found" } });
      await db.loginHistory.create({ data: { email, ip, userAgent: ua, success: false, reason: "user_not_found" } });
      return errorResponse("Invalid email or password.", 401);
    }
    if (user.banned) {
      await db.loginHistory.create({ data: { userId: user.id, email, ip, userAgent: ua, success: false, reason: "banned" } });
      return errorResponse("This account has been suspended.", 403);
    }

    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      await logSecurityEvent({ type: "failed_login", ip, email, meta: { reason: "wrong_password" } });
      await db.loginHistory.create({ data: { userId: user.id, email, ip, userAgent: ua, success: false, reason: "wrong_password" } });
      return errorResponse("Invalid email or password.", 401);
    }

    await db.loginHistory.create({ data: { userId: user.id, email, ip, userAgent: ua, success: true } });
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), lastLoginIp: ip } });

    if (user.twoFactorEnabled) {
      return NextResponse.json({ twoFactorRequired: true, pendingToken: signPendingToken(user.id) });
    }

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    return createSession(res, { userId: user.id, email: user.email, role: user.role, userAgent: ua, ip });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
