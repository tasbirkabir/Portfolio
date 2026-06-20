import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { newsletterSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 10 signups per hour per IP
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 10, keyPrefix: "newsletter" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const body = await req.json();
    const parsed = newsletterSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse("Please enter a valid email.", 400);
    }
    const { email, name } = parsed.data;

    await db.newsletterSub.upsert({
      where: { email },
      update: {},
      create: { email, name },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
