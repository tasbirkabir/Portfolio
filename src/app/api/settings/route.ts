import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { parseSettings } from "@/lib/settings-defaults";

export async function GET() {
  const s = await db.siteSettings.findUnique({ where: { id: "singleton" } });
  const settings = parseSettings(s);
  if (!settings) return NextResponse.json({ settings: null });
  return NextResponse.json({ settings });
}
