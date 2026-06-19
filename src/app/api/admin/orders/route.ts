import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" } });
  return NextResponse.json({ orders: orders.map((o: any) => ({ ...o, items: JSON.parse(o.items) })) });
}

export async function PUT(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const { id, status } = await req.json();
  const order = await db.order.update({ where: { id }, data: { status } });
  return NextResponse.json({ order });
}
