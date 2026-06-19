"use client";

import { Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { BarChart, Bar, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid, PieChart, Pie, Cell, Legend } from "recharts";

const PIE_COLORS = ["#b45309", "#15803d", "#1e3a8a", "#9d174d", "#7c2d12", "#0f766e"];

export function AdminAnalytics() {
  const { data, loading } = useFetch<any>("/api/analytics");
  if (loading || !data) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;
  const m = data.metrics;

  const eventTypes = ["page_view", "book_view", "sale", "download", "email_signup", "reading_complete"].map((t) => ({
    name: t.replace("_", " "),
    value: data.recentEvents.filter((e: any) => e.type === t).length || (t === "sale" ? m.orders : t === "download" ? m.downloads : t === "email_signup" ? m.emailSignups : t === "reading_complete" ? m.completions : t === "book_view" ? m.bookViews : m.pageViews),
  })).filter((e) => e.value > 0);

  return (
    <div className="space-y-5">
      <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Analytics</h1><p className="text-sm text-muted-foreground">Platform events · last 30 days</p></div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-display text-lg tracking-tight">Daily revenue</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data.daily}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="date" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} width={36} />
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} formatter={(v: any) => [`$${v}`, "Revenue"]} />
                <Bar dataKey="revenue" fill="#b45309" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
        <div className="rounded-3xl border border-border/60 bg-card p-5">
          <h2 className="mb-3 font-display text-lg tracking-tight">Event breakdown</h2>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={eventTypes} dataKey="value" nameKey="name" cx="50%" cy="50%" innerRadius={45} outerRadius={80} paddingAngle={3}>
                  {eventTypes.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { l: "Page views", v: m.pageViews }, { l: "Book views", v: m.bookViews },
          { l: "Downloads", v: m.downloads }, { l: "Email signups", v: m.emailSignups },
          { l: "Reading completions", v: m.completions }, { l: "Total orders", v: m.orders },
          { l: "Total revenue", v: `$${m.revenue.toFixed(0)}` }, { l: "Subscribers", v: m.subscribers },
        ].map((s) => (
          <div key={s.l} className="rounded-2xl border border-border/60 bg-card p-4">
            <p className="font-display text-2xl">{s.v}</p>
            <p className="text-xs text-muted-foreground">{s.l}</p>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 font-display text-lg tracking-tight">Recent events</h2>
        <div className="space-y-1">
          {data.recentEvents.map((e: any) => (
            <div key={e.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-xs">
              <span className="font-medium uppercase text-clay">{e.type.replace("_", " ")}</span>
              <span className="text-muted-foreground">{e.refSlug || e.path || "—"}</span>
              <span className="text-muted-foreground">{new Date(e.createdAt).toLocaleTimeString()}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
