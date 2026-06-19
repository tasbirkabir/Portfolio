import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ orders: [] });
  const orders = await db.order.findMany({
    where: { userEmail: user.email },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({
    orders: orders.map((o: any) => ({
      ...o,
      items: JSON.parse(o.items),
    })),
  });
}
