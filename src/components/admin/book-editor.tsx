"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const CATEGORIES = ["AI Business", "Automation", "Marketing", "Freelancing", "Productivity", "Systems", "Mindset"];
const COVER_STYLES = ["editorial", "mono", "duotone", "grid", "stack"];
const ACCESS = ["public", "free", "email-gate", "paid", "members"];

export function BookEditor({ book, onClose, onSaved }: { book: any | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(
    book || {
      title: "", slug: "", subtitle: "", description: "",
      price: 19, originalPrice: null, pages: 100, category: "AI Business",
      accent: "#1a1a1a", coverStyle: "editorial", badge: "New", featured: false,
      accessType: "paid", status: "published",
      whatYouLearn: [], chapters: [], faq: [], highlights: [], content: [],
      seoTitle: "", seoDesc: "",
    }
  );

  function set<K extends keyof any>(k: K, v: any) {
    setForm((f: any) => ({ ...f, [k]: v }));
  }

  async function save() {
    setSaving(true);
    try {
      const r = book
        ? await fetch(`/api/admin/books/${book.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/admin/books", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Save failed");
      toast({ title: book ? "Book updated" : "Book created", description: form.title });
      onSaved();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }}
          transition={{ duration: 0.3 }}
          onClick={(e) => e.stopPropagation()}
          className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto thin-scrollbar rounded-3xl border border-border bg-card p-6 sm:p-8"
        >
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><X className="h-4 w-4" /></button>
          <h2 className="mb-5 font-display text-2xl tracking-tight">{book ? "Edit ebook" : "New ebook"}</h2>

          <div className="space-y-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Title" value={form.title} onChange={(v) => set("title", v)} />
              <TF label="Slug (auto from title if empty)" value={form.slug} onChange={(v) => set("slug", v)} />
            </div>
            <TF label="Subtitle" value={form.subtitle} onChange={(v) => set("subtitle", v)} />
            <TA label="Description" value={form.description} onChange={(v) => set("description", v)} rows={3} />
            <div className="grid gap-3 sm:grid-cols-3">
              <TF label="Price ($)" type="number" value={form.price} onChange={(v) => set("price", Number(v))} />
              <TF label="Original price ($)" type="number" value={form.originalPrice ?? ""} onChange={(v) => set("originalPrice", v ? Number(v) : null)} />
              <TF label="Pages" type="number" value={form.pages} onChange={(v) => set("pages", Number(v))} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <Sel label="Category" value={form.category} onChange={(v) => set("category", v)} options={CATEGORIES} />
              <Sel label="Cover style" value={form.coverStyle} onChange={(v) => set("coverStyle", v)} options={COVER_STYLES} />
              <Sel label="Access type" value={form.accessType} onChange={(v) => set("accessType", v)} options={ACCESS} />
            </div>
            <div className="grid gap-3 sm:grid-cols-3">
              <TF label="Accent (hex)" value={form.accent} onChange={(v) => set("accent", v)} />
              <TF label="Badge" value={form.badge ?? ""} onChange={(v) => set("badge", v)} />
              <Sel label="Status" value={form.status} onChange={(v) => set("status", v)} options={["draft", "published", "scheduled"]} />
            </div>
            <label className="flex items-center gap-2.5 text-sm">
              <input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded" />
              Featured on homepage
            </label>
            <TA label="What you'll learn (one per line)" value={(form.whatYouLearn || []).join("\n")} onChange={(v) => set("whatYouLearn", v.split("\n").filter(Boolean))} rows={4} />
            <TA label="Highlights (one per line)" value={(form.highlights || []).join("\n")} onChange={(v) => set("highlights", v.split("\n").filter(Boolean))} rows={3} />
            <TA label="Chapters (JSON: [{title, pages}])" value={JSON.stringify(form.chapters || [], null, 0)} onChange={(v) => { try { set("chapters", JSON.parse(v)); } catch {} }} rows={4} className="font-mono text-xs" />
            <TA label="Reader content (JSON: [{id, title, sections:[{heading, body:[]}]}])" value={JSON.stringify(form.content || [], null, 0)} onChange={(v) => { try { set("content", JSON.parse(v)); } catch {} }} rows={5} className="font-mono text-xs" />
            <TF label="SEO title" value={form.seoTitle ?? ""} onChange={(v) => set("seoTitle", v)} />
            <TF label="SEO description" value={form.seoDesc ?? ""} onChange={(v) => set("seoDesc", v)} />

            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm transition-colors hover:bg-foreground/5">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60">
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {book ? "Save changes" : "Create ebook"}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

function TF({ label, value, onChange, type = "text", placeholder }: { label: string; value: any; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <input type={type} value={value ?? ""} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30" />
    </label>
  );
}
function TA({ label, value, onChange, rows = 3, className = "" }: { label: string; value: string; onChange: (v: string) => void; rows?: number; className?: string }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <textarea value={value} onChange={(e) => onChange(e.target.value)} rows={rows} className={`w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30 ${className}`} />
    </label>
  );
}
function Sel({ label, value, onChange, options }: { label: string; value: string; onChange: (v: string) => void; options: string[] }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30">
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
    </label>
  );
}

export { TF, TA, Sel };
