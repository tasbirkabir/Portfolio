import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logAudit } from "@/lib/security/audit";
import { generateSecret, buildOtpauthUri, generateQrDataUrl, verifyTotp } from "@/lib/auth/totp";

const ISSUER = "Tasbir Kabir HQ";

export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 10 * 60 * 1000, maxRequests: 20, keyPrefix: "2fa" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);
  const user = await requireAdmin();
  if (!user) return errorResponse("Admin only", 403);

  let body: any;
  try { body = await req.json(); } catch { return errorResponse("Invalid body.", 400); }
  const action = body?.action;

  if (action === "setup") {
    const secret = generateSecret();
    await db.user.update({ where: { id: user.id }, data: { twoFactorSecret: secret } });
    const otpauthUri = buildOtpauthUri({ accountName: user.email, issuer: ISSUER, secret });
    const qrDataUrl = await generateQrDataUrl(otpauthUri);
    return NextResponse.json({ secret, otpauthUri, qrDataUrl });
  }
  if (action === "enable") {
    const code = String(body?.code || "");
    if (!user.twoFactorSecret) return errorResponse("Start setup first.", 400);
    if (!verifyTotp(code, user.twoFactorSecret)) return errorResponse("That code didn't match. Try again.", 400);
    await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: true } });
    await logAudit({ userId: user.id, userEmail: user.email, action: "2fa_enable", targetType: "user", targetId: user.id });
    return NextResponse.json({ ok: true, enabled: true });
  }
  if (action === "disable") {
    const code = String(body?.code || "");
    if (!user.twoFactorEnabled || !user.twoFactorSecret) return errorResponse("Two-factor authentication is not enabled.", 400);
    if (!verifyTotp(code, user.twoFactorSecret)) return errorResponse("That code didn't match. Try again.", 400);
    await db.user.update({ where: { id: user.id }, data: { twoFactorEnabled: false, twoFactorSecret: null } });
    await logAudit({ userId: user.id, userEmail: user.email, action: "2fa_disable", targetType: "user", targetId: user.id });
    return NextResponse.json({ ok: true, enabled: false });
  }
  return errorResponse("Unknown action.", 400);
}
