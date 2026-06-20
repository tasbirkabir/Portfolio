import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { createHmac, timingSafeEqual } from "crypto";
import { db } from "@/lib/db";

/**
 * Secure session management using HMAC-signed tokens.
 *
 * Security features:
 * - HMAC-SHA256 signing with env-based secret (never hardcoded)
 * - Session expiration (7 days)
 * - Secure cookie flags (httpOnly, sameSite, secure in production)
 * - Server-side user lookup on every request (banned users blocked)
 * - Timing-safe comparison to prevent timing attacks
 */

const SESSION_COOKIE = "tk_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7; // 7 days

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    // Fallback for dev only — production MUST set SESSION_SECRET
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production.");
    }
    return "dev-only-secret-not-for-production";
  }
  return secret;
}

function sign(payload: string): string {
  const hmac = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

function verify(token: string): { payload: string; issuedAt: number } | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");

  // Timing-safe comparison
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }

  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    // Check expiration
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return { payload: decoded, issuedAt: decoded.iat || 0 };
  } catch {
    return null;
  }
}

/** Create a session token for a user. */
function createToken(userId: string, email: string, role: string): string {
  const now = Date.now();
  const payload = Buffer.from(
    JSON.stringify({
      userId,
      email,
      role,
      iat: now,
      exp: now + SESSION_MAX_AGE * 1000,
    })
  ).toString("base64url");
  return sign(payload);
}

/** Attach a session cookie to a NextResponse. */
export function withSession(res: NextResponse, userId: string, email: string, role: string): NextResponse {
  const token = createToken(userId, email, role);
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  return res;
}

/** Clear the session cookie. */
export function clearSessionRes(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", maxAge: 0, path: "/" });
  return res;
}

/** Get the current session from the cookie. */
export async function getSession(): Promise<{ userId: string; email: string; role: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const result = verify(token);
  if (!result) return null;
  return result.payload;
}

/** Get the current user from the session, checking banned status. */
export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.banned) return null;
  // Verify role hasn't changed since session was issued
  if (user.role !== session.role) return null;
  return user;
}

/** Require an admin user — returns null if not admin (server-side check). */
export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

/** Require any authenticated user — returns null if not logged in. */
export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}
