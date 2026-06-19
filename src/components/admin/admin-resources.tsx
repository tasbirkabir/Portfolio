"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Save, Download } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import { TF, TA, Sel } from "./book-editor";

const TYPES = ["pdf", "template", "checklist", "prompt-pack", "guide", "framework", "swipe-file", "toolkit"];
const ACCESS = ["public", "free", "email-gate", "paid", "members"];

export function AdminResources() {
  const { data, loading, refetch } = useFetch<{ resources: any[] }>("/api/admin/resources");
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const resources = data?.resources ?? [];

  async function del(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const r = await fetch(`/api/admin/resources/${slug}`, { method: "DELETE" });
    if (r.ok) { toast({ title: "Deleted" }); refetch(); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Resources</h1><p className="text-sm text-muted-foreground">{resources.length} resources</p></div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background"><Plus className="h-4 w-4" /> New resource</button>
      </div>
      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
        <div className="space-y-2">
          {resources.map((r) => (
            <div key={r.slug} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-[10px] font-semibold uppercase" style={{ background: `${r.accent}18`, color: r.accent }}>{r.type.slice(0, 2)}</span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{r.title}</p>
                <p className="truncate text-xs text-muted-foreground">{r.type} · {r.category} · {r.accessType} · {r.downloads} downloads {r.price > 0 ? `· $${r.price}` : ""}</p>
              </div>
              <button onClick={() => setEditing(r)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(r.slug, r.title)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}
      {(editing || creating) && <ResEditor item={editing} onClose={() => { setEditing(null); setCreating(false); }} onSaved={() => { setEditing(null); setCreating(false); refetch(); }} />}
    </div>
  );
}

function ResEditor({ item, onClose, onSaved }: { item: any | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(item || { title: "", slug: "", description: "", type: "pdf", category: "Resources", accent: "#1a1a1a", price: 0, accessType: "free", status: "published", pages: null, fileUrl: "" });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const r = item
        ? await fetch(`/api/admin/resources/${item.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/admin/resources", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: item ? "Resource updated" : "Resource created" });
      onSaved();
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-xl overflow-y-auto thin-scrollbar rounded-3xl border border-border bg-card p-6 sm:p-8">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><X className="h-4 w-4" /></button>
          <h2 className="mb-5 font-display text-2xl tracking-tight">{item ? "Edit resource" : "New resource"}</h2>
          <div className="space-y-4">
            <TF label="Title" value={form.title} onChange={(v) => set("title", v)} />
            <TF label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
            <TA label="Description" value={form.description} onChange={(v) => set("description", v)} rows={3} />
            <div className="grid gap-3 sm:grid-cols-2">
              <Sel label="Type" value={form.type} onChange={(v) => set("type", v)} options={TYPES} />
              <Sel label="Access type" value={form.accessType} onChange={(v) => set("accessType", v)} options={ACCESS} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <TF label="Category" value={form.category} onChange={(v) => set("category", v)} />
              <TF label="Accent (hex)" value={form.accent} onChange={(v) => set("accent", v)} />
              <TF label="Price ($)" type="number" value={form.price} onChange={(v) => set("price", Number(v))} />
            </div>
            <TF label="File URL (PDF / download link)" value={form.fileUrl ?? ""} onChange={(v) => set("fileUrl", v)} />
            <Sel label="Status" value={form.status} onChange={(v) => set("status", v)} options={["draft", "published", "scheduled"]} />
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-foreground/5">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{item ? "Save" : "Create"}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

export { Download };
