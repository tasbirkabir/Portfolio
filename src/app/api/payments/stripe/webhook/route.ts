import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * Stripe webhook / success handler.
 * Verifies the Stripe session and unlocks library access.
 *
 * For production webhooks, also set up:
 *   STRIPE_WEBHOOK_SECRET=whsec_xxx
 * And register this URL in your Stripe Dashboard → Webhooks.
 *
 * NOTE: Install the Stripe SDK with: bun add stripe
 */
export async function GET(req: NextRequest) {
  return POST(req);
}

export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=error`);
    }

    let Stripe: any;
    try {
      Stripe = (await import("stripe")).default;
    } catch {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=error`);
    }

    const stripe = new Stripe(stripeKey);
    const sessionId = req.nextUrl.searchParams.get("session_id");
    if (!sessionId) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=error`);
    }

    // Retrieve and verify the session
    const session = await stripe.checkout.sessions.retrieve(sessionId);
    if (session.payment_status !== "paid") {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=failed`);
    }

    const orderId = session.metadata?.orderId;
    const tranId = session.metadata?.tranId;
    const itemsSlugs = session.metadata?.items; // "book:slug1,resource:slug2"

    const order = await db.order.findFirst({ where: { id: orderId || "", txnId: tranId || "" } });
    if (!order) {
      return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=error`);
    }

    // Update order to paid
    await db.order.update({ where: { id: order.id }, data: { status: "paid" } });

    // Unlock library access
    const items = JSON.parse(order.items) as any[];
    for (const it of items) {
      await db.libraryAccess.upsert({
        where: { userEmail_itemType_itemSlug: { userEmail: order.userEmail, itemType: it.type, itemSlug: it.slug } },
        update: {},
        create: { userId: order.userId || "guest", userEmail: order.userEmail, itemType: it.type, itemSlug: it.slug },
      });
      if (it.type === "book") await db.book.update({ where: { slug: it.slug }, data: { buyers: { increment: 1 } } });
      else if (it.type === "resource") await db.resource.update({ where: { slug: it.slug }, data: { downloads: { increment: 1 } } });
      await db.analyticsEvent.create({ data: { type: "sale", refSlug: it.slug, value: Number(it.price || 0), meta: "{}" } });
    }

    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=success`);
  } catch (e: any) {
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=error`);
  }
}
