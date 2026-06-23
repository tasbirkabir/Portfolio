import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { createSession, ipFromRequest } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
import { registerSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "register" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  const ip = ipFromRequest(req);
  const ua = req.headers.get("user-agent");

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || "Invalid input.", 400);
    }
    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) return errorResponse("An account with this email already exists.", 409);

    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({ data: { email, name, password: hashedPassword, role: "user" } });

    await db.loginHistory.create({ data: { userId: user.id, email, ip, userAgent: ua, success: true, reason: "register" } });
    await db.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date(), lastLoginIp: ip } });

    const res = NextResponse.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    return createSession(res, { userId: user.id, email: user.email, role: user.role, userAgent: ua, ip });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
