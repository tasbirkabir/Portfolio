import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { hashPassword } from "@/lib/auth/passwords";
import { passwordSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";

/**
 * Confirm a password reset with the token + new password.
 * Verifies the token is valid and not expired, then updates the password.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: "pw_reset_confirm" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const { token, password } = await req.json();
    if (!token || !password) return errorResponse("Token and password are required.", 400);

    const parsed = passwordSchema.safeParse(password);
    if (!parsed.success) {
      return errorResponse("Password must be at least 8 characters.", 400);
    }

    const user = await db.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      await logSecurityEvent({ type: "invalid_reset_token", ip: req.headers.get("x-forwarded-for") || undefined });
      return errorResponse("Invalid or expired reset token.", 400);
    }

    const hashedPassword = await hashPassword(password);
    await db.user.update({
      where: { id: user.id },
      data: {
        password: hashedPassword,
        passwordResetToken: null,
        passwordResetExpiry: null,
      },
    });

    await logSecurityEvent({ type: "password_reset_success", email: user.email });

    return NextResponse.json({ ok: true, message: "Password updated. Please sign in." });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
