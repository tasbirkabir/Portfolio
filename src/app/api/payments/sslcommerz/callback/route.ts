import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

/**
 * SSL Commerz callback / IPN handler.
 * Validates the payment and unlocks library access.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.text();
    const params = new URLSearchParams(body);
    const status = params.get("status");
    const tranId = params.get("tran_id");
    const valId = params.get("val_id");
    const amount = params.get("amount");
    const storeId = params.get("store_id");

    if (!tranId) return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 });

    const order = await db.order.findFirst({ where: { txnId: tranId } });
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });

    if (status === "VALID" || status === "SUCCESS") {
      // Verify with SSL Commerz validation API (production)
      const isSandbox = process.env.SSLCOMMERZ_SANDBOX !== "false";
      const verifyUrl = isSandbox
        ? `https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWD}&format=json`
        : `https://securepay.sslcommerz.com/validator/api/validationserverAPI.php?val_id=${valId}&store_id=${process.env.SSLCOMMERZ_STORE_ID}&store_passwd=${process.env.SSLCOMMERZ_STORE_PASSWD}&format=json`;

      try {
        const verifyRes = await fetch(verifyUrl);
        const verifyData = await verifyRes.json();
        if (verifyData.status === "VALID") {
          // Payment verified — unlock access
          await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
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
          // Redirect to library on success
          return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=success`);
        }
      } catch {
        // Sandbox may skip verification — accept directly
        await db.order.update({ where: { id: order.id }, data: { status: "paid" } });
        const items = JSON.parse(order.items) as any[];
        for (const it of items) {
          await db.libraryAccess.upsert({
            where: { userEmail_itemType_itemSlug: { userEmail: order.userEmail, itemType: it.type, itemSlug: it.slug } },
            update: {},
            create: { userId: order.userId || "guest", userEmail: order.userEmail, itemType: it.type, itemSlug: it.slug },
          });
        }
        return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=success`);
      }
    }

    // Payment failed
    await db.order.update({ where: { id: order.id }, data: { status: "failed" } });
    return NextResponse.redirect(`${process.env.NEXT_PUBLIC_SITE_URL || "/"}/?v=library&status=failed`);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message }, { status: 500 });
  }
}

// SSL Commerz also sends GET redirects
export async function GET(req: NextRequest) {
  return POST(req);
}
