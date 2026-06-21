import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { emailSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";
import { sendPasswordResetEmail } from "@/lib/email/resend";
import { randomBytes } from "crypto";

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

      // Send the reset email via Resend
      await sendPasswordResetEmail(user.email, token);
    }

    return NextResponse.json({
      ok: true,
      message: "If an account exists for that email, a reset link has been sent.",
    });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
