import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export async function GET() {
  const resources = await db.resource.findMany({
    orderBy: [{ downloads: "desc" }],
  });
  const data = resources.map((r: any) => ({ ...r }));
  return NextResponse.json({ resources: data });
}
