import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";
import { sendBroadcastEmail } from "@/lib/email/resend";

export async function GET() {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("Admin only", 403);
  const subs = await db.newsletterSub.findMany({ orderBy: { createdAt: "desc" } });
  const broadcasts = await db.broadcast.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({
    subscribers: subs,
    broadcasts: broadcasts.map((b: any) => ({ ...b })),
  });
}

export async function POST(req: NextRequest) {
  const admin = await requireAdmin();
  if (!admin) return errorResponse("Admin only", 403);

  const { subject, body, segment } = await req.json();
  if (!subject || !body) return errorResponse("Subject and body are required.", 400);

  // Get all subscribers in the segment
  const where = segment && segment !== "all" ? { segment } : {};
  const subs = await db.newsletterSub.findMany({ where, select: { email: true } });
  const emails = subs.map((s) => s.email);

  // Send the broadcast via Resend
  const result = await sendBroadcastEmail(emails, subject, body);

  // Record the broadcast
  const broadcast = await db.broadcast.create({
    data: {
      subject,
      body,
      segment: segment || "all",
      status: "sent",
      sentAt: new Date(),
    },
  });

  return NextResponse.json({
    broadcast,
    deliveredTo: result.sent || emails.length,
    emailResult: result,
  });
}
