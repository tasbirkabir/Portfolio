import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { withSession } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/passwords";
import { registerSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 registrations per hour per IP
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "register" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const body = await req.json();
    const parsed = registerSchema.safeParse(body);
    if (!parsed.success) {
      const firstError = parsed.error.errors[0];
      return errorResponse(firstError?.message || "Invalid input.", 400);
    }
    const { name, email, password } = parsed.data;

    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return errorResponse("An account with this email already exists.", 409);
    }

    // Hash password with bcrypt before storing
    const hashedPassword = await hashPassword(password);
    const user = await db.user.create({
      data: { email, name, password: hashedPassword, role: "user" },
    });

    const res = NextResponse.json({
      user: { id: user.id, email: user.email, name: user.name, role: user.role },
    });
    return withSession(res, user.id, user.email, user.role);
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
