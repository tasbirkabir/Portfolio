import { createHmac, timingSafeEqual } from "crypto";

const PENDING_TTL_MS = 5 * 60 * 1000;

function getSecret(): string {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    if (process.env.NODE_ENV === "production") {
      throw new Error("SESSION_SECRET environment variable is required in production.");
    }
    return "dev-only-secret-not-for-production";
  }
  return secret;
}

function b64url(s: string): string {
  return Buffer.from(s, "utf8").toString("base64url");
}

export function signPendingToken(userId: string): string {
  const payload = b64url(JSON.stringify({ uid: userId, iat: Date.now(), exp: Date.now() + PENDING_TTL_MS, nonce: createHmac("sha256", getSecret()).update(`${userId}:${Date.now()}:${Math.random()}`).digest("hex").slice(0, 16) }));
  const sig = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${sig}`;
}

export function verifyPendingToken(token: string): { userId: string } | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const sig = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (!decoded.exp || Date.now() > decoded.exp) return null;
    return { userId: decoded.uid };
  } catch {
    return null;
  }
}
