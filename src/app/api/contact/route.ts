import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { contactSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";

export async function POST(req: NextRequest) {
  // Rate limit: 5 messages per hour per IP
  const rl = rateLimit(req, { windowMs: 60 * 60 * 1000, maxRequests: 5, keyPrefix: "contact" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const body = await req.json();
    const parsed = contactSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || "Invalid input.", 400);
    }
    const { name, email, topic, message } = parsed.data;

    await db.contactMessage.create({
      data: { name, email, topic, message },
    });
    return NextResponse.json({ ok: true });
  } catch {
    return errorResponse("Something went wrong.", 500);
  }
}
