import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!s) return NextResponse.json({ settings: null });
  return NextResponse.json({ settings: { ...s, navItems: JSON.parse(s.navItems || "[]") } });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const body = await req.json();
  const data: any = { ...body };
  if (Array.isArray(body.navItems)) data.navItems = JSON.stringify(body.navItems);
  const s = await db.siteSettings.upsert({
    where: { id: "singleton" },
    update: data,
    create: { id: "singleton", ...data, navItems: JSON.stringify(body.navItems || []) },
  });
  return NextResponse.json({ settings: { ...s, navItems: JSON.parse(s.navItems || "[]") } });
}
