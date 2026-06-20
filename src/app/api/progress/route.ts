import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function POST(req: NextRequest) {
  // Silently ignore if not logged in — progress is saved locally in the reader too
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ ok: true }); // silent success, no error

  try {
    const { bookSlug, chapterIndex, progress } = await req.json();
    if (!bookSlug) return NextResponse.json({ ok: true });

    await db.readingProgress.upsert({
      where: { userId_bookSlug: { userId: user.id, bookSlug } },
      update: { chapterIndex: Number(chapterIndex) || 0, progress: Number(progress) || 0 },
      create: { userId: user.id, bookSlug, chapterIndex: Number(chapterIndex) || 0, progress: Number(progress) || 0 },
    });

    if ((Number(progress) || 0) >= 100) {
      await db.analyticsEvent.create({ data: { type: "reading_complete", refSlug: bookSlug, meta: "{}" } });
    }
  } catch {
    // Silent failure — progress sync is non-critical
  }
  return NextResponse.json({ ok: true });
}
