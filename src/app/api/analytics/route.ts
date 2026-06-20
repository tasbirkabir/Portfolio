import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { errorResponse } from "@/lib/security/validation";

export async function GET() {
  // SECURITY: Analytics data (revenue, orders, users) is admin-only
  const admin = await requireAdmin();
  if (!admin) return errorResponse("Authentication required.", 401);


  // Aggregate last 30 days of events
  const since = new Date(Date.now() - 30 * 24 * 3600 * 1000);
  const events = await db.analyticsEvent.findMany({ where: { createdAt: { gte: since } } });

  const sales = events.filter((e) => e.type === "sale");
  const revenue = sales.reduce((a, e) => a + e.value, 0);
  const downloads = events.filter((e) => e.type === "download").length;
  const emailSignups = events.filter((e) => e.type === "email_signup").length;
  const bookViews = events.filter((e) => e.type === "book_view").length;
  const pageViews = events.filter((e) => e.type === "page_view").length;
  const completions = events.filter((e) => e.type === "reading_complete").length;

  const orders = await db.order.findMany({ orderBy: { createdAt: "desc" }, take: 100 });
  const users = await db.user.count();
  const subscribers = await db.newsletterSub.count();

  // top products by sales count
  const productCount = new Map<string, { count: number; revenue: number }>();
  for (const o of orders) {
    const items = JSON.parse(o.items) as any[];
    for (const it of items) {
      const key = it.slug;
      const prev = productCount.get(key) || { count: 0, revenue: 0 };
      productCount.set(key, { count: prev.count + 1, revenue: prev.revenue + Number(it.price || 0) });
    }
  }
  const topProducts = Array.from(productCount.entries())
    .map(([slug, v]) => ({ slug, ...v }))
    .sort((a, b) => b.revenue - a.revenue)
    .slice(0, 5);

  // daily revenue series (last 14 days)
  const days: { date: string; revenue: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = new Date(Date.now() - i * 24 * 3600 * 1000);
    const dayStart = new Date(day.getFullYear(), day.getMonth(), day.getDate());
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);
    const dayOrders = orders.filter((o) => o.createdAt >= dayStart && o.createdAt < dayEnd);
    const rev = dayOrders.reduce((a, o) => a + o.total, 0);
    days.push({
      date: dayStart.toISOString().slice(5, 10),
      revenue: Number(rev.toFixed(2)),
      orders: dayOrders.length,
    });
  }

  return NextResponse.json({
    user: admin,
    metrics: {
      revenue: Number(revenue.toFixed(2)),
      orders: orders.length,
      users,
      subscribers,
      downloads,
      bookViews,
      pageViews,
      emailSignups,
      completions,
    },
    topProducts,
    daily: days,
    recentOrders: orders.slice(0, 8).map((o: any) => ({ ...o, items: JSON.parse(o.items) })),
    recentEvents: events.slice(-12).reverse(),
  });
}
