import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { checkoutSchema, errorResponse } from "@/lib/security/validation";
import { rateLimit, rateLimitResponse } from "@/lib/security/rate-limit";
import { logSecurityEvent } from "@/lib/security/audit";

/**
 * Mock/UddoktaPay checkout flow.
 *
 * SECURITY: Prices are looked up from the database — NEVER trusted from the client.
 * This prevents price manipulation attacks.
 */
export async function POST(req: NextRequest) {
  const rl = rateLimit(req, { windowMs: 60 * 1000, maxRequests: 5, keyPrefix: "checkout" });
  if (!rl.ok) return rateLimitResponse(rl.remaining, rl.resetAt);

  try {
    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0]?.message || "Invalid input.", 400);
    }
    const { items, method, customer } = parsed.data;

    const user = await getCurrentUser();
    const userEmail = (customer?.email || user?.email || "").toLowerCase().trim();
    const userName = customer?.name || user?.name || null;
    if (!userEmail) {
      return errorResponse("An email is required to complete the purchase.", 400);
    }

    // SECURITY: Look up actual prices from the database — never trust client prices
    const verifiedItems: { slug: string; title: string; type: string; price: number }[] = [];
    for (const it of items) {
      const dbItem = it.type === "book"
        ? await db.book.findUnique({ where: { slug: it.slug }, select: { slug: true, title: true, price: true, accessType: true } })
        : await db.resource.findUnique({ where: { slug: it.slug }, select: { slug: true, title: true, price: true, accessType: true } });

      if (!dbItem) {
        return errorResponse(`Item not found: ${it.slug}`, 404);
      }

      // Use the DB price, not the client-sent price
      verifiedItems.push({
        slug: dbItem.slug,
        title: dbItem.title,
        type: it.type,
        price: Number(dbItem.price),
      });
    }

    const total = verifiedItems.reduce((a, i) => a + i.price, 0);
    const txnId = `${method.toUpperCase()}_${Date.now().toString(36).toUpperCase()}`;

    // Prevent duplicate purchases — check if already owned
    for (const it of verifiedItems) {
      const existing = await db.libraryAccess.findFirst({
        where: { userEmail, itemType: it.type, itemSlug: it.slug },
      });
      if (existing) {
        // Already owned — skip this item (don't charge again)
        return NextResponse.json({
          ok: true,
          txnId,
          message: "You already own this item.",
          alreadyOwned: true,
        });
      }
    }

    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        userEmail,
        userName,
        items: JSON.stringify(verifiedItems),
        total,
        method,
        status: "paid",
        txnId,
      },
    });

    // Grant library access for each verified item
    for (const it of verifiedItems) {
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
      if (it.type === "book") {
        await db.book.update({ where: { slug: it.slug }, data: { buyers: { increment: 1 } } });
      } else if (it.type === "resource") {
        await db.resource.update({ where: { slug: it.slug }, data: { downloads: { increment: 1 } } });
      }
      await db.analyticsEvent.create({ data: { type: "sale", refSlug: it.slug, value: it.price, meta: "{}" } });
    }

    return NextResponse.json({ ok: true, orderId: order.id, txnId });
  } catch (e: any) {
    return errorResponse(e?.message || "Checkout failed.", 500);
  }
}
