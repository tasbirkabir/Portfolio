import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const subs = await db.newsletterSub.findMany({ orderBy: { createdAt: "desc" } });
  const broadcasts = await db.broadcast.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    subscribers: subs,
    broadcasts: broadcasts.map((b: any) => ({ ...b })),
  });
}

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { subject, body, segment } = await req.json();
  // In production: send via Resend to all subs in segment.
  // Here: mark as sent and log.
  const count = await db.newsletterSub.count({ where: segment && segment !== "all" ? { segment } : {} });
  const broadcast = await db.broadcast.create({
    data: { subject, body, segment: segment || "all", status: "sent", sentAt: new Date() },
  });
  return NextResponse.json({ broadcast, deliveredTo: count });
}
