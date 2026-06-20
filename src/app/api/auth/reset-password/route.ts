import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";
import { randomBytes } from "crypto";

/**
 * Request a password reset.
 * Generates a secure token and stores it (hashed) in the DB.
 * In production, an email would be sent via Resend.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "pw_reset" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const { email } = await req.json();
    const parsed = emailSchema.safeParse(email);
    if (!parsed.success) return errorResponse("Invalid email.", 400);

    const user = await db.user.findUnique({ where: { email: parsed.data } });

    // Always return success (don't leak whether email exists)
    if (user) {
      const token = randomBytes(32).toString("hex");
      const expiry = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
      await db.user.update({
        where: { id: user.id },
        data: { passwordResetToken: token, passwordResetExpiry: expiry },
      });

      // In production: send email with reset link
      // await sendResetEmail(user.email, token);
      console.log(`[Password reset] Token for ${user.email}: ${token}`);
      // For the sandbox, the token is logged. In production, email it via Resend.
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
