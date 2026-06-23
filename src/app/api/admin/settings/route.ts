import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { parseSettings, serializeSettingsForDb } from "@/lib/settings-defaults";
import { logAudit } from "@/lib/security/audit";

export async function GET() {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  return NextResponse.json({ settings: parseSettings(s) });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const data = serializeSettingsForDb(body);
  const s = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data },
  });
  await logAudit({ userId: user.id, userEmail: user.email, action: "settings_update", targetType: "siteSettings", targetId: "singleton" });
  return NextResponse.json({ settings: parseSettings(s) });
}
