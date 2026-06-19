import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth/session";

export async function GET() {
  const user = await getCurrentUser();
  if (!user || user.role !== "admin") return NextResponse.json({ error: "Admin only" }, { status: 403 });
  const users = await db.user.findMany({ orderBy: { createdAt: "desc" } });
  const orders = await db.order.findMany();
  const access = await db.libraryAccess.findMany();

  const usersWithStats = users.map((u: any) => {
    const userOrders = orders.filter((o) => o.userEmail === u.email);
    const spent = userOrders.reduce((a, o) => a + o.total, 0);
    const items = access.filter((a) => a.userEmail === u.email).length;
    return {
      id: u.id,
      email: u.email,
      name: u.name,
      role: u.role,
      banned: u.banned,
      createdAt: u.createdAt,
      orders: userOrders.length,
      spent: Number(spent.toFixed(2)),
      items,
    };
  });
  return NextResponse.json({ users: usersWithStats });
}
