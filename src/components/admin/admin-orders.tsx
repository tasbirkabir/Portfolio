"use client";

import { useState } from "react";
import { Loader2, RefreshCw } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";

const STATUSES = ["paid", "pending", "failed", "refunded"];

export function AdminOrders() {
  const { data, loading, refetch } = useFetch<{ orders: any[] }>("/api/admin/orders");
  const { toast } = useToast();
  const [filter, setFilter] = useState("all");
  const orders = (data?.orders ?? []).filter((o) => filter === "all" || o.status === filter);
  const revenue = (data?.orders ?? []).filter((o) => o.status === "paid").reduce((a, o) => a + o.total, 0);

  async function updateStatus(id: string, status: string) {
    const r = await fetch("/api/admin/orders", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ id, status }) });
    if (r.ok) { toast({ title: "Order updated", description: `Status → ${status}` }); refetch(); }
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Orders</h1><p className="text-sm text-muted-foreground">{orders.length} orders · ${revenue.toFixed(2)} revenue</p></div>
        <div className="flex gap-2">
          {["all", ...STATUSES].map((s) => (
            <button key={s} onClick={() => setFilter(s)} className={`rounded-full border px-3 py-1.5 text-xs capitalize transition-colors ${filter === s ? "border-foreground bg-foreground text-background" : "border-border text-muted-foreground hover:text-foreground"}`}>{s}</button>
          ))}
        </div>
      </div>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
        <div className="space-y-2">
          {orders.map((o) => (
            <div key={o.id} className="rounded-2xl border border-border/60 bg-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-sm font-semibold">{o.userName || o.userEmail}</p>
                  <p className="truncate text-xs text-muted-foreground">{o.items.map((i: any) => i.title).join(", ")}</p>
                  <p className="mt-1 text-[11px] text-muted-foreground">{new Date(o.createdAt).toLocaleString()} · {o.method.toUpperCase()} · {o.txnId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-display text-lg">${o.total.toFixed(2)}</span>
                  <select value={o.status} onChange={(e) => updateStatus(o.id, e.target.value)} className="rounded-lg border border-border bg-background px-2 py-1.5 text-xs capitalize focus:outline-none">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { RefreshCw };
