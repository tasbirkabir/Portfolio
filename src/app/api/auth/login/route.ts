import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/passwords";
import { loginSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 login attempts per 15 minutes per IP
  const rl = rateLimit(req, { windowMs: 15 * 60 * 1000, maxRequests: 10, keyPrefix: "login" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const body = await req.json();
    const parsed = loginSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Invalid email or password.", 400);
    }
    const { email, password } = parsed.data;

    const user = await db.user.findUnique({ where: { email } });
    if (!user) {
      await logSecurityEvent({ type: "failed_login", ip: req.headers.get("x-forwarded-for") || undefined, email, meta: { reason: "user_not_found" } });
      return errorResponse("Invalid email or password.", 401);
    }

    if (user.banned) {
      return errorResponse("This account has been suspended.", 403);
    }

    // Verify password against bcrypt hash
    const valid = await verifyPassword(password, user.password);
    if (!valid) {
      await logSecurityEvent({ type: "failed_login", ip: req.headers.get("x-forwarded-for") || undefined, email, meta: { reason: "wrong_password" } });
      return errorResponse("Invalid email or password.", 401);
    }

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    return withSession(res, user.id, user.email, user.role);
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
