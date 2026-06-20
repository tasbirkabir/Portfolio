import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/payments/config";

/**
 * SSL Commerz payment initiation.
 * Creates an SSL Commerz session and returns the GatewayPageURL for redirect.
 *
 * Required env vars:
 *   SSLCOMMERZ_STORE_ID
 *   SSLCOMMERZ_STORE_PASSWD
 *   SSLCOMMERZ_SANDBOX (true/false)
 *
 * Docs: https://developer.sslcommerz.com/
 */
export async function POST(req: NextRequest) {
  try {
    const storeId = process.env.SSLCOMMERZ_STORE_ID;
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWD;
    const isSandbox = process.env.SSLCOMMERZ_SANDBOX !== "false";

    if (!storeId || !storePasswd) {
      return NextResponse.json({ error: "SSL Commerz is not configured. Set SSLCOMMERZ_STORE_ID and SSLCOMMERZ_STORE_PASSWD in .env" }, { status: 503 });
    }

    const { items, customer, method } = await req.json();
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
    const totalBDT = Math.round(total * 117); // USD to BDT approx; adjust as needed
    const tranId = `TK${Date.now().toString(36).toUpperCase()}`;

    // Create order in DB (pending)
    const order = await db.order.create({
      data: {
        userId: user?.id || null,
        userEmail,
        userName,
        items: JSON.stringify(items),
        total,
        method: method || "sslcommerz",
        status: "pending",
        txnId: tranId,
      },
    });

    // Build SSL Commerz session request
    const baseUrl = isSandbox
      ? "https://sandbox.sslcommerz.com/gwprocess/v4/api.php"
      : "https://securepay.sslcommerz.com/gwprocess/v4/api.php";

    const formData = new URLSearchParams();
    formData.append("store_id", storeId);
    formData.append("store_passwd", storePasswd);
    formData.append("total_amount", String(totalBDT));
    formData.append("currency", "BDT");
    formData.append("tran_id", tranId);
    formData.append("success_url", `${SITE_URL}/api/payments/sslcommerz/callback`);
    formData.append("fail_url", `${SITE_URL}/api/payments/sslcommerz/callback`);
    formData.append("cancel_url", `${SITE_URL}/api/payments/sslcommerz/callback`);
    formData.append("ipn_url", `${SITE_URL}/api/payments/sslcommerz/callback`);
    formData.append("cus_name", userName);
    formData.append("cus_email", userEmail);
    formData.append("cus_phone", customer?.phone || "00000000000");
    formData.append("cus_add1", "N/A");
    formData.append("cus_city", "Dhaka");
    formData.append("cus_country", "Bangladesh");
    formData.append("shipping_method", "NO");
    formData.append("product_name", items.map((i: any) => i.title).join(", "));
    formData.append("product_category", "Digital");
    formData.append("product_profile", "non-physical-goods");

    const response = await fetch(baseUrl, {
      method: "POST",
      body: formData,
    });
    const data = await response.json();

    if (data.status === "SUCCESS" && data.GatewayPageURL) {
      return NextResponse.json({
        redirectUrl: data.GatewayPageURL,
        tranId,
        orderId: order.id,
      });
    } else {
      await db.order.update({ where: { id: order.id }, data: { status: "failed" } });
      return NextResponse.json({ error: data.failedreason || "SSL Commerz session creation failed." }, { status: 400 });
    }
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Payment initiation failed." }, { status: 500 });
  }
}
