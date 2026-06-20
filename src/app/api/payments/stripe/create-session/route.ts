import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/payments/config";

/**
 * Stripe Checkout Session creation.
 * Creates a Stripe Checkout Session and returns the URL for redirect.
 *
 * Required env vars:
 *   STRIPE_SECRET_KEY=sk_live_xxx (or sk_test_xxx)
 *
 * Docs: https://stripe.com/docs/api/checkout/sessions
 *
 * NOTE: Install the Stripe SDK with: bun add stripe
 * If stripe is not installed, this route returns an instructive error.
 */
export async function POST(req: NextRequest) {
  try {
    const stripeKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeKey) {
      return NextResponse.json({ error: "Stripe is not configured. Set STRIPE_SECRET_KEY in .env" }, { status: 503 });
    }

    // Dynamically import stripe (so it's only required when configured)
    let Stripe: any;
    try {
      Stripe = (await import("stripe")).default;
    } catch {
      return NextResponse.json({
        error: "Stripe SDK not installed. Run: bun add stripe",
      }, { status: 503 });
    }

    const stripe = new Stripe(stripeKey);
    const { items, customer } = await req.json();
    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json({ error: "Items required." }, { status: 400 });
    }

    const user = await getCurrentUser();
    const userEmail = (customer?.email || user?.email || "").toLowerCase().trim();
    const userName = customer?.name || user?.name || "Customer";
    if (!userEmail) return NextResponse.json({ error: "Email required." }, { status: 400 });

    // SECURITY: Verify prices from DB — never trust client prices
    const { verifyItemPrices } = await import("@/lib/payments/verify");
    const verifiedItems = await verifyItemPrices(items);
    if (!verifiedItems) return NextResponse.json({ error: "One or more items not found." }, { status: 404 });
    const total = verifiedItems.reduce((a, i) => a + i.price, 0);
    const tranId = `TK_STRIPE_${Date.now().toString(36).toUpperCase()}`;

    // Create order in DB (pending)
    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        userEmail,
        userName,
        items: JSON.stringify(items),
        total,
        method: "card",
        status: "pending",
        txnId: tranId,
      },
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      mode: "payment",
      customer_email: userEmail,
      line_items: verifiedItems.map((it: any) => ({
        price_data: {
          currency: "usd",
          product_data: { name: it.title },
          unit_amount: Math.round(Number(it.price) * 100), // cents
        },
        quantity: 1,
      })),
      metadata: {
        orderId: order.id,
        tranId,
        items: JSON.stringify(items.map((it: any) => `${it.type}:${it.slug}`)),
      },
      success_url: `${SITE_URL}/api/payments/stripe/webhook?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${SITE_URL}/?v=library&status=cancelled`,
    });

    return NextResponse.json({
      redirectUrl: session.url,
      sessionId: session.id,
      tranId,
      orderId: order.id,
    });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Stripe session creation failed." }, { status: 500 });
  }
}
