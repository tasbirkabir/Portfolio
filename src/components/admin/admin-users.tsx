"use client";

import { useState } from "react";
import { Loader2, Ban, Trash2, Shield, Gift } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";

export function AdminUsers() {
  const { data, loading, refetch } = useFetch<{ users: any[] }>("/api/admin/users");
  const { toast } = useToast();
  const [grantEmail, setGrantEmail] = useState("");
  const [grantSlug, setGrantSlug] = useState("");
  const users = data?.users ?? [];

  async function act(id: string, email: string, body: any, msg: string) {
    const r = await fetch(`/api/admin/users/${id}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ userEmail: email, ...body }) });
    if (r.ok) { toast({ title: msg }); refetch(); }
  }
  async function del(id: string) {
    if (!confirm("Delete this user permanently?")) return;
    const r = await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    if (r.ok) { toast({ title: "User deleted" }); refetch(); }
  }

  return (
    <div className="space-y-5">
      <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Users</h1><p className="text-sm text-muted-foreground">{users.length} registered users</p></div>

      {/* Grant access */}
      <div className="rounded-2xl border border-border/60 bg-card p-4">
        <p className="mb-2 flex items-center gap-2 text-sm font-medium"><Gift className="h-4 w-4 text-clay" /> Grant access manually</p>
        <div className="flex flex-wrap gap-2">
          <input value={grantEmail} onChange={(e) => setGrantEmail(e.target.value)} placeholder="user@email.com" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
          <input value={grantSlug} onChange={(e) => setGrantSlug(e.target.value)} placeholder="book-slug" className="flex-1 rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none" />
          <button
            onClick={async () => {
              const u = users.find((x) => x.email === grantEmail.trim().toLowerCase());
              if (!u) { toast({ title: "User not found", variant: "destructive" }); return; }
              await act(u.id, u.email, { grantAccess: { type: "book", slug: grantSlug.trim() } }, "Access granted");
              setGrantEmail(""); setGrantSlug("");
            }}
            className="rounded-full bg-foreground px-4 py-2 text-sm font-medium text-background"
          >Grant</button>
        </div>
      </div>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
        <div className="space-y-2">
          {users.map((u) => (
            <div key={u.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border/60 bg-card p-4">
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-foreground font-display text-sm text-background">{(u.name || u.email).charAt(0).toUpperCase()}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{u.name || "Member"} {u.role === "admin" && <span className="ml-1 rounded-full bg-clay/10 px-1.5 py-0.5 text-[9px] font-medium text-clay">ADMIN</span>}</p>
                <p className="truncate text-xs text-muted-foreground">{u.email} · {u.orders} orders · ${u.spent} · {u.items} items</p>
              </div>
              <div className="flex gap-1">
                <button onClick={() => act(u.id, u.email, { banned: !u.banned }, u.banned ? "User unbanned" : "User banned")} className={`flex h-8 w-8 items-center justify-center rounded-lg transition-colors ${u.banned ? "bg-destructive/10 text-destructive" : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground"}`} title={u.banned ? "Unban" : "Ban"}><Ban className="h-4 w-4" /></button>
                <button onClick={() => act(u.id, u.email, { role: u.role === "admin" ? "user" : "admin" }, u.role === "admin" ? "Demoted to user" : "Promoted to admin")} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground" title="Toggle admin"><Shield className="h-4 w-4" /></button>
                <button onClick={() => del(u.id)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
