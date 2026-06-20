import { NextRequest, NextResponse } from "next/server";

/**
 * In-memory rate limiter (production should use Redis).
 * Limits requests per IP address within a time window.
 */

type RateLimitEntry = { count: number; resetAt: number };
const store = new Map<string, RateLimitEntry>();

// Clean up expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (entry.resetAt < now) store.delete(key);
    }
  }, 5 * 60 * 1000).unref?.();
}

export function rateLimit(
  req: NextRequest,
  options: { windowMs: number; maxRequests: number; keyPrefix?: string }
): { ok: boolean; remaining: number; resetAt: number } {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
  const key = `${options.keyPrefix || "default"}:${ip}`;
  const now = Date.now();

  const entry = store.get(key);
  if (!entry || entry.resetAt < now) {
    store.set(key, { count: 1, resetAt: now + options.windowMs });
    return { ok: true, remaining: options.maxRequests - 1, resetAt: now + options.windowMs };
  }

  entry.count++;
  if (entry.count > options.maxRequests) {
    return { ok: false, remaining: 0, resetAt: entry.resetAt };
  }

  return { ok: true, remaining: options.maxRequests - entry.count, resetAt: entry.resetAt };
}

export function rateLimitResponse(remaining: number, resetAt: number): NextResponse {
  return NextResponse.json(
    { error: "Too many requests. Please try again later." },
    {
      status: 429,
      headers: {
        "X-RateLimit-Remaining": String(remaining),
        "X-RateLimit-Reset": String(Math.ceil(resetAt / 1000)),
        "Retry-After": String(Math.ceil((resetAt - Date.now()) / 1000)),
      },
    }
  );
}
