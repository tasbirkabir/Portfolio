import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, ipFromRequest } from "@/lib/auth/session";
import { verifyPendingToken } from "@/lib/auth/pending-token";
import { verifyTotp } from "@/lib/auth/totp";
import { errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 10 * 60 * 1000, maxRequests: 20, keyPrefix: "verify2fa" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const ip = ipFromRequest(req);
  const ua = req.headers.get("user-agent");

  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid body.", 400); }
  const { pendingToken, code } = body || {};
  if (typeof pendingToken !== "string" || typeof code !== "string") return errorResponse("Token and code are required.", 400);

  const pending = verifyPendingToken(pendingToken);
  if (!pending) return errorResponse("Your session expired. Please sign in again.", 401);

  const user = await db.user.findUnique({ where: { id: pending.userId } });
  if (!user || user.banned) return errorResponse("Account not available.", 401);
  if (!user.twoFactorEnabled || !user.twoFactorSecret) return errorResponse("Two-factor authentication is not enabled.", 400);

  if (!verifyTotp(code, user.twoFactorSecret)) {
    await logSecurityEvent({ type: "failed_2fa", ip, email: user.email, meta: { reason: "wrong_code" } });
    return errorResponse("That code didn't match. Try again.", 401);
  }

  const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
  return createSession(res, { userId: user.id, email: user.email, role: user.role, userAgent: ua, ip });
}
