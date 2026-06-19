import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

/**
 * Mock UddoktaPay-style checkout.
 * Accepts: { items: [{ slug, type, price, title }], method: "bkash"|"nagad"|"rocket"|"card", customer: {name,email} }
 * Creates a paid order + grants library access for each item + tracks analytics.
 * In production this would redirect to UddoktaPay's checkout URL and verify the IPN.
 */
export async function POST(req: NextRequest) {
  try {
    const { items, method, customer } = await req.json();
    if (!Array.isArray(items) || items.length === 0 || !method) {
      return NextResponse.json({ error: "Items and method are required." }, { status: 400 });
    }
    const user = await getCurrentUser();
    const userEmail = (customer?.email || user?.email || "").toLowerCase().trim();
    const userName = customer?.name || user?.name || null;
    if (!userEmail) {
      return NextResponse.json({ error: "An email is required to complete the purchase." }, { status: 400 });
    }

    const total = items.reduce((a: number, i: any) => a + Number(i.price || 0), 0);
    const txnId = `${method.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        userEmail,
        userName,
        items: JSON.stringify(items),
        total,
        method,
        status: "paid",
        txnId,
      },
    });

    // Grant library access for each item
    for (const it of items) {
      await db.libraryAccess.upsert({
        where: { userEmail_itemType_itemSlug: { userEmail, itemType: it.type, itemSlug: it.slug } },
        update: {},
        create: {
          userId: user?.id || "guest",
          userEmail,
          itemType: it.type,
          itemSlug: it.slug,
        },
      });
      // bump buyers / downloads
      if (it.type === "book") {
        await db.book.update({ where: { slug: it.slug }, data: { buyers: { increment: 1 } } });
      } else if (it.type === "resource") {
        await db.resource.update({ where: { slug: it.slug }, data: { downloads: { increment: 1 } } });
      }
      await db.analyticsEvent.create({ data: { type: "sale", refSlug: it.slug, value: Number(it.price || 0), meta: "{}" } });
    }

    return NextResponse.json({ ok: true, orderId: order.id, txnId });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || "Checkout failed." }, { status: 500 });
  }
}
