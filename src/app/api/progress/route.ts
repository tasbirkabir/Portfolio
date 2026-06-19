import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Login required." }, { status: 401 });
  const { bookSlug, chapterIndex, progress } = await req.json();
  if (!bookSlug) return NextResponse.json({ error: "bookSlug required" }, { status: 400 });

  await db.readingProgress.upsert({
    where: { userId_bookSlug: { userId: user.id, bookSlug } },
    update: { chapterIndex: Number(chapterIndex) || 0, progress: Number(progress) || 0 },
    create: { userId: user.id, bookSlug, chapterIndex: Number(chapterIndex) || 0, progress: Number(progress) || 0 },
  });
  void bookSlug;
  if ((Number(progress) || 0) >= 100) {
    await db.analyticsEvent.create({ data: { type: "reading_complete", refSlug: bookSlug, meta: "{}" } });
  }
  return NextResponse.json({ ok: true });
}
