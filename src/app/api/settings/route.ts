import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  if (!s) return NextResponse.json({ settings: null });
  return NextResponse.json({
    settings: {
      ...s,
      navItems: JSON.parse(s.navItems || "[]"),
    },
  });
}
