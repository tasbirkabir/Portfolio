// Lightweight session helper for the sandbox. Uses a signed cookie.
// In production this would be Supabase Auth / JWT — the interface is identical.
import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { db } from "@/lib/db";

const SESSION_COOKIE = "tk_session";
const SECRET = "tasbir-kabir-digital-hq-secret";

function encode(s: string): string {
  return Buffer.from(s).toString("base64url");
}
function decode(s: string): string {
  return Buffer.from(s, "base64url").toString("utf8");
}

function sign(payload: string): string {
  let h = 0;
  const str = payload + SECRET;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return payload + "." + Math.abs(h).toString(36);
}

function verify(token: string): string | null {
  const idx = token.lastIndexOf(".");
  if (idx === -1) return null;
  const payload = token.slice(0, idx);
  if (sign(payload) !== token) return null;
  return payload;
}

/** Build the session token + attach it to a NextResponse (for login/register). */
export function withSession(res: NextResponse, userId: string, email: string, role: string): NextResponse {
  const payload = encode(JSON.stringify({ userId, email, role }));
  const token = sign(payload);
  res.cookies.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
  return res;
}

export function clearSessionRes(res: NextResponse): NextResponse {
  res.cookies.delete(SESSION_COOKIE);
  return res;
}

export async function getSession(): Promise<{ userId: string; email: string; role: string } | null> {
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const payload = verify(token);
  if (!payload) return null;
  try {
    return JSON.parse(decode(payload));
  } catch {
    return null;
  }
}

export async function getCurrentUser() {
  const session = await getSession();
  if (!session) return null;
  const user = await db.user.findUnique({ where: { id: session.userId } });
  if (!user || user.banned) return null;
  return user;
}

export async function requireAdmin() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return null;
  return user;
}
