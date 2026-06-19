"use client";

import { useState } from "react";
import { Loader2, Send, Download, Mail } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import { TF, TA, Sel } from "./book-editor";

export function AdminNewsletter() {
  const { data, loading, refetch } = useFetch<{ subscribers: any[]; broadcasts: any[] }>("/api/admin/newsletter");
  const { toast } = useToast();
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [segment, setSegment] = useState("all");
  const [sending, setSending] = useState(false);

  const subs = data?.subscribers ?? [];
  const broadcasts = data?.broadcasts ?? [];

  function exportCsv() {
    const csv = "email,name,segment,createdAt\n" + subs.map((s: any) => `${s.email},${s.name || ""},${s.segment},${new Date(s.createdAt).toISOString()}`).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "subscribers.csv"; a.click();
    URL.revokeObjectURL(url);
  }

  async function broadcast() {
    if (!subject || !body) return;
    setSending(true);
    try {
      const r = await fetch("/api/admin/newsletter", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ subject, body, segment }) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: "Broadcast sent", description: `Delivered to ${j.deliveredTo} subscribers` });
      setSubject(""); setBody("");
      refetch();
    } catch (e: any) { toast({ title: "Send failed", description: e.message, variant: "destructive" }); }
    finally { setSending(false); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Newsletter</h1><p className="text-sm text-muted-foreground">{subs.length} subscribers</p></div>
        <button onClick={exportCsv} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm hover:bg-foreground/5"><Download className="h-4 w-4" /> Export CSV</button>
      </div>

      {/* Compose broadcast */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <p className="mb-3 flex items-center gap-2 text-sm font-medium"><Send className="h-4 w-4 text-clay" /> New broadcast</p>
        <div className="space-y-3">
          <TF label="Subject" value={subject} onChange={setSubject} />
          <TA label="Body (plain text)" value={body} onChange={setBody} rows={5} />
          <Sel label="Segment" value={segment} onChange={setSegment} options={["all", "buyers", "readers", "vip"]} />
          <button onClick={broadcast} disabled={sending} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60">{sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />} Send broadcast</button>
        </div>
      </div>

      {/* Subscribers */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 font-display text-lg tracking-tight">Subscribers</h2>
        {loading ? <div className="flex h-20 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
          <div className="max-h-72 space-y-1 overflow-y-auto thin-scrollbar">
            {subs.map((s: any) => (
              <div key={s.id} className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <div className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-muted-foreground" /><span className="truncate">{s.email}</span></div>
                <div className="flex items-center gap-3">
                  <span className="rounded-full bg-background px-2 py-0.5 text-[10px] text-muted-foreground">{s.segment}</span>
                  <span className="text-[10px] text-muted-foreground">{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Broadcast history */}
      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <h2 className="mb-3 font-display text-lg tracking-tight">Broadcast history</h2>
        {broadcasts.length === 0 ? <p className="text-sm text-muted-foreground">No broadcasts sent yet.</p> : (
          <div className="space-y-2">
            {broadcasts.map((b: any) => (
              <div key={b.id} className="rounded-lg bg-muted/40 px-3 py-2 text-sm">
                <p className="font-medium">{b.subject}</p>
                <p className="text-xs text-muted-foreground">{b.segment} · {new Date(b.sentAt || b.createdAt).toLocaleString()}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
