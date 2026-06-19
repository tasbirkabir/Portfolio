"use client";

import { motion } from "motion/react";
import { LogOut, Mail, User, ShoppingBag, BookOpen } from "lucide-react";
import { useNav } from "@/lib/store/nav";
import { useAuth } from "@/lib/store/auth";
import { useFetch } from "@/hooks/use-fetch";
import { AuthPrompt } from "./auth-prompt";

export function AccountView() {
  const { user, logout } = useAuth();
  const navigate = useNav((s) => s.navigate);
  const { data } = useFetch<{ orders: any[] }>(user ? "/api/orders" : null);

  if (!user) {
    return <AuthPrompt title="Your account" desc="Sign in to manage your profile, view purchases, and access your library." />;
  }

  const orders = data?.orders ?? [];
  const spent = orders.reduce((a: number, o: any) => a + o.total, 0);

  return (
    <div className="mx-auto max-w-4xl px-5 py-16 sm:px-8 sm:py-24">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }} className="mb-10">
        <p className="eyebrow mb-3">Account</p>
        <h1 className="font-display text-[clamp(2rem,5vw,3.5rem)] leading-[0.98] tracking-tight">Profile & purchases</h1>
      </motion.div>

      {/* Profile card */}
      <div className="rounded-3xl border border-border/60 bg-card p-6 sm:p-8">
        <div className="flex items-center gap-4">
          <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground font-display text-2xl text-background">
            {(user.name || user.email).charAt(0).toUpperCase()}
          </span>
          <div className="flex-1">
            <p className="font-display text-xl">{user.name || "Member"}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            {user.role === "admin" && (
              <button onClick={() => navigate("admin")} className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-clay/10 px-3 py-1 text-xs font-medium text-clay">
                Admin panel →
              </button>
            )}
          </div>
          <button
            onClick={async () => { await logout(); navigate("home"); }}
            className="flex items-center gap-1.5 rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
          >
            <LogOut className="h-4 w-4" /> Sign out
          </button>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-4 sm:grid-cols-3">
          <Stat icon={ShoppingBag} label="Orders" value={String(orders.length)} />
          <Stat icon={BookOpen} label="Total spent" value={`$${spent.toFixed(2)}`} />
          <Stat icon={User} label="Role" value={user.role} />
        </div>
      </div>

      {/* Orders */}
      <div className="mt-8">
        <h2 className="mb-4 font-display text-xl tracking-tight">Order history</h2>
        {orders.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-border bg-muted/30 p-8 text-center text-sm text-muted-foreground">
            No purchases yet.
          </div>
        ) : (
          <div className="space-y-3">
            {orders.map((o: any) => (
              <div key={o.id} className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-border/60 bg-card p-4">
                <div>
                  <p className="text-sm font-semibold">{o.items.map((it: any) => it.title).join(", ")}</p>
                  <p className="text-xs text-muted-foreground">{new Date(o.createdAt).toLocaleDateString()} · {o.method.toUpperCase()} · {o.txnId}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-[10px] font-medium uppercase text-green-600">{o.status}</span>
                  <span className="font-display text-base">${o.total.toFixed(2)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ icon: Icon, label, value }: { icon: typeof Mail; label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <div className="flex items-center gap-2 text-muted-foreground"><Icon className="h-4 w-4" /><span className="text-xs">{label}</span></div>
      <p className="mt-1 font-display text-xl capitalize">{value}</p>
    </div>
  );
}
