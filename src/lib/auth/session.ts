import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { createHmac, timingSafeEqual, randomUUID } from "crypto";
import { db } from "@/lib/db";

const SESSION_COOKIE = "tk_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

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

function sign(payload: string): string {
  const hmac = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  return `${payload}.${hmac}`;
}

type SessionPayload = {
  userId: string;
  email: string;
  role: string;
  sid: string;
  iat: number;
  exp: number;
};

function verify(token: string): SessionPayload | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  const signature = token.slice(idx + 1);
  const expected = createHmac("sha256", getSecret()).update(payload).digest("base64url");
  try {
    const a = Buffer.from(signature);
    const b = Buffer.from(expected);
    if (a.length !== b.length) return null;
    if (!timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const decoded = JSON.parse(Buffer.from(payload, "base64url").toString("utf8")) as SessionPayload;
    if (decoded.exp && Date.now() > decoded.exp) return null;
    return decoded;
  } catch {
    return null;
  }
}

export function deviceLabelFromUA(ua: string | null): string {
  if (!ua) return "Unknown device";
  let os = "Unknown OS";
  if (/iPhone|iPad|iPod/i.test(ua)) os = "iOS";
  else if (/Android/i.test(ua)) os = "Android";
  else if (/Windows/i.test(ua)) os = "Windows";
  else if (/Mac OS/i.test(ua)) os = "macOS";
  else if (/Linux/i.test(ua)) os = "Linux";
  let browser = "Browser";
  if (/Edg/i.test(ua)) browser = "Edge";
  else if (/Chrome/i.test(ua)) browser = "Chrome";
  else if (/Safari/i.test(ua)) browser = "Safari";
  else if (/Firefox/i.test(ua)) browser = "Firefox";
  return `${browser} · ${os}`;
}

export function ipFromRequest(req: NextRequest): string {
  const xff = req.headers.get("x-forwarded-for");
  if (xff) return xff.split(",")[0].trim();
  return req.headers.get("x-real-ip") || "unknown";
}

function createToken(payload: SessionPayload): string {
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  return sign(encoded);
}

export async function createSession(
  res: NextResponse,
  opts: { userId: string; email: string; role: string; userAgent?: string | null; ip?: string | null }
): Promise<NextResponse> {
  const now = Date.now();
  const sid = randomUUID();
  const payload: SessionPayload = {
    userId: opts.userId,
    email: opts.email,
    role: opts.role,
    sid,
    iat: now,
    exp: now + SESSION_MAX_AGE * 1000,
  };
  const token = createToken(payload);
  const isProduction = process.env.NODE_ENV === "production";
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "strict",
    secure: isProduction,
    maxAge: SESSION_MAX_AGE,
    path: "/",
  });
  await db.session.create({
    data: {
      sid,
      userId: opts.userId,
      userAgent: opts.userAgent?.slice(0, 500) || null,
      ip: opts.ip || null,
      deviceName: deviceLabelFromUA(opts.userAgent || null),
      expiresAt: new Date(now + SESSION_MAX_AGE * 1000),
    },
  });
  return res;
}

export async function withSession(res: NextResponse, userId: string, email: string, role: string): Promise<NextResponse> {
  return createSession(res, { userId, email, role });
}

export function clearSessionRes(res: NextResponse): NextResponse {
  res.cookies.set(SESSION_COOKIE, "", { httpOnly: true, sameSite: "strict", maxAge: 0, path: "/" });
  return res;
}

export async function revokeCurrentSession(): Promise<void> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return;
  const payload = verify(token);
  if (!payload?.sid) return;
  try {
    await db.session.updateMany({ where: { sid: payload.sid, revokedAt: null }, data: { revokedAt: new Date() } });
  } catch {}
}

export async function revokeSession(sid: string, userId: string): Promise<boolean> {
  const r = await db.session.updateMany({ where: { sid, userId, revokedAt: null }, data: { revokedAt: new Date() } });
  return r.count > 0;
}

export async function revokeAllSessions(userId: string, exceptSid?: string): Promise<void> {
  await db.session.updateMany({
    where: { userId, revokedAt: null, ...(exceptSid ? { NOT: { sid: exceptSid } } : {}) },
    data: { revokedAt: new Date() },
  });
}

export async function getSession(): Promise<{ userId: string; email: string; role: string; sid: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload?.sid) return null;
  const row = await db.session.findUnique({ where: { sid: payload.sid } });
  if (!row) return null;
  if (row.revokedAt) return null;
  if (row.expiresAt && row.expiresAt.getTime() < Date.now()) return null;
  try {
    await db.session.update({ where: { id: row.id }, data: { lastActiveAt: new Date() } });
  } catch {}
  return { userId: payload.userId, email: payload.email, role: payload.role, sid: payload.sid };
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.banned) return null;
  if (user.role !== session.role) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) return null;
  return user;
}
