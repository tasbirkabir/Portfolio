"use client";

import { DollarSign, ShoppingCart, Users, Mail, Download, BookOpen, Eye, TrendingUp, ArrowRight } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis, CartesianGrid } from "recharts";

const TABS: Record<string, string> = { books: "books", orders: "orders", users: "users", newsletter: "newsletter", analytics: "analytics" };

export function AdminDashboard({ onNavigate }: { onNavigate: (t: any) => void }) {
  const { data, loading } = useFetch<any>("/api/analytics");

  if (loading || !data) {
    return <div className="h-96 animate-pulse rounded-3xl bg-muted" />;
  }

  const m = data.metrics;
  const cards = [
    { label: "Revenue", value: `$${m.revenue.toFixed(2)}`, icon: DollarSign, tab: "orders", color: "#15803d" },
    { label: "Orders", value: String(m.orders), icon: ShoppingCart, tab: "orders", color: "#1a1a1a" },
    { label: "Users", value: String(m.users), icon: Users, tab: "users", color: "#1e3a8a" },
    { label: "Subscribers", value: String(m.subscribers), icon: Mail, tab: "newsletter", color: "#9d174d" },
    { label: "Downloads", value: String(m.downloads), icon: Download, tab: "analytics", color: "#b45309" },
    { label: "Book views", value: String(m.bookViews), icon: BookOpen, tab: "analytics", color: "#0f766e" },
    { label: "Email signups", value: String(m.emailSignups), icon: TrendingUp, tab: "newsletter", color: "#7c2d12" },
    { label: "Read completions", value: String(m.completions), icon: Eye, tab: "analytics", color: "#4c1d95" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Dashboard</h1>
        <p className="text-sm text-muted-foreground">Platform overview · last 30 days</p>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {cards.map((c) => {
          const Icon = c.icon;
          return (
            <button
              key={c.label}
              onClick={() => onNavigate(TABS[c.tab])}
              className="group flex flex-col rounded-2xl border border-border/60 bg-card p-4 text-left transition-all hover:-translate-y-0.5 hover:shadow-premium"
            >
              <div className="mb-2 flex items-center justify-between">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${c.color}18`, color: c.color }}>
                  <Icon className="h-4 w-4" />
                </span>
                <ArrowRight className="h-3.5 w-3.5 text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
              </div>
              <p className="font-display text-2xl tracking-tight">{c.value}</p>
              <p className="text-xs text-muted-foreground">{c.label}</p>
            </button>
          );
        })}
      </div>

      {/* Revenue chart */}
      <div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="font-display text-lg tracking-tight">Revenue · last 14 days</h2>
            <p className="text-xs text-muted-foreground">Daily sales across all products</p>
          </div>
          <span className="font-display text-xl text-clay">${m.revenue.toFixed(0)}</span>
        </div>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.daily}>
              <defs>
                <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#b45309" stopOpacity={0.4} />
                  <stop offset="100%" stopColor="#b45309" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36} />
              <Tooltip
                contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                formatter={(v: any) => [`$${v}`, "Revenue"]}
              />
              <Area type="monotone" dataKey="revenue" stroke="#b45309" strokeWidth={2} fill="url(#rev)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Recent orders + top products */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg tracking-tight">Recent orders</h2>
          <div className="space-y-2">
            {data.recentOrders.slice(0, 6).map((o: any) => (
              <div key={o.id} className="flex items-center justify-between rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
                <div className="min-w-0">
                  <p className="truncate font-medium">{o.userName || o.userEmail}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.items.map((i: any) => i.title).join(", ")}</p>
                </div>
                <div className="text-right">
                  <p className="font-display">${o.total.toFixed(2)}</p>
                  <p className="text-[10px] uppercase text-muted-foreground">{o.method}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6">
          <h2 className="mb-4 font-display text-lg tracking-tight">Top products</h2>
          <div className="space-y-2">
            {data.topProducts.map((p: any, i: number) => (
              <div key={p.slug} className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2.5 text-sm">
                <span className="font-display text-lg text-muted-foreground">{i + 1}</span>
                <p className="flex-1 truncate font-medium">{p.slug.replace(/-/g, " ")}</p>
                <span className="text-xs text-muted-foreground">{p.count} sold</span>
                <span className="font-display text-clay">${p.revenue.toFixed(0)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
