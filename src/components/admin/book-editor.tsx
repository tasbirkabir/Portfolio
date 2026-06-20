"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Save, Loader2, Upload, Trash2, FileText, File, ImageIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const CATEGORIES = ["AI Business", "Automation", "Marketing", "Freelancing", "Productivity", "Systems", "Mindset"];
const COVER_STYLES = ["editorial", "mono", "duotone", "grid", "stack"];
const ACCESS = ["public", "free", "email-gate", "paid", "members"];

const ASSET_TYPES = [
  { value: "pdf", label: "PDF Version" },
  { value: "epub", label: "EPUB Version" },
  { value: "mobi", label: "MOBI Version" },
  { value: "zip", label: "ZIP File" },
  { value: "bonus", label: "Bonus Resource" },
  { value: "template", label: "Template" },
  { value: "worksheet", label: "Worksheet" },
  { value: "prompt-pack", label: "Prompt Pack" },
  { value: "checklist", label: "Checklist" },
  { value: "source", label: "Source Files" },
];

export function BookEditor({ book, onClose, onSaved }: { book: any | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [assets, setAssets] = useState<any[]>([]);
  const [uploading, setUploading] = useState(false);
  const [assetType, setAssetType] = useState("pdf");
  const [assetLabel, setAssetLabel] = useState("");
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

  // Fetch assets when editing an existing book
  useEffect(() => {
    if (book?.id) {
      fetch(`/api/books/${book.slug}`).then(r => r.json()).then(d => {
        setAssets(d.assets || []);
      }).catch(() => {});
    }
  }, [book]);

  async function uploadAsset(file: File) {
    if (!book?.id) {
      toast({ title: "Save the book first", description: "Create or save the ebook before uploading files.", variant: "destructive" });
      return;
    }
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      fd.append("bookId", book.id);
      fd.append("type", assetType);
      fd.append("label", assetLabel || ASSET_TYPES.find(t => t.value === assetType)?.label || "File");
      const r = await fetch("/api/admin/assets/upload", { method: "POST", body: fd });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      setAssets([...assets, j.asset]);
      toast({ title: "File uploaded", description: file.name });
      setAssetLabel("");
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  async function deleteAsset(id: string) {
    if (!confirm("Delete this file?")) return;
    try {
      await fetch(`/api/admin/assets/${id}`, { method: "DELETE" });
      setAssets(assets.filter(a => a.id !== id));
      toast({ title: "File deleted" });
    } catch {
      toast({ title: "Delete failed", variant: "destructive" });
    }
  }

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

            {/* Downloadable Assets Management */}
            <div className="rounded-2xl border border-border bg-muted/30 p-4">
              <div className="mb-3 flex items-center gap-2">
                <Upload className="h-4 w-4 text-clay" />
                <h4 className="text-sm font-semibold">Downloadable Assets</h4>
                <span className="text-xs text-muted-foreground">({assets.length} files)</span>
              </div>

              {book?.id ? (
                <>
                  {/* Existing assets list */}
                  {assets.length > 0 && (
                    <div className="mb-3 space-y-1.5">
                      {assets.map((a) => (
                        <div key={a.id} className="flex items-center gap-2 rounded-lg bg-background px-3 py-2 text-xs">
                          {a.type === "pdf" ? <FileText className="h-4 w-4 text-red-500" /> :
                           a.type === "epub" || a.type === "mobi" ? <FileText className="h-4 w-4 text-blue-500" /> :
                           a.type === "png" || a.type === "jpg" || a.type === "svg" ? <ImageIcon className="h-4 w-4 text-green-500" /> :
                           <File className="h-4 w-4 text-muted-foreground" />}
                          <div className="min-w-0 flex-1">
                            <p className="truncate font-medium">{a.label}</p>
                            <p className="truncate text-muted-foreground">{a.filename} · {(a.fileSize / 1024 / 1024).toFixed(1)}MB · {a.downloads} downloads</p>
                          </div>
                          <button onClick={() => deleteAsset(a.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* Upload new asset */}
                  <div className="space-y-2">
                    <div className="grid gap-2 sm:grid-cols-2">
                      <select value={assetType} onChange={(e) => setAssetType(e.target.value)} className="rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none">
                        {ASSET_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                      </select>
                      <input value={assetLabel} onChange={(e) => setAssetLabel(e.target.value)} placeholder="Custom label (optional)" className="rounded-lg border border-border bg-background px-3 py-2 text-xs focus:outline-none" />
                    </div>
                    <label className={cn("flex cursor-pointer items-center justify-center gap-2 rounded-lg border border-dashed border-border px-4 py-3 text-xs text-muted-foreground transition-colors hover:border-clay hover:text-clay", uploading && "opacity-60")}>
                      {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
                      {uploading ? "Uploading…" : "Choose file to upload"}
                      <input
                        type="file"
                        className="hidden"
                        accept=".pdf,.epub,.mobi,.zip,.docx,.xlsx,.pptx,.png,.jpg,.jpeg,.svg"
                        onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadAsset(f); e.target.value = ""; }}
                      />
                    </label>
                    <p className="text-[10px] text-muted-foreground">Supported: PDF, EPUB, MOBI, ZIP, DOCX, XLSX, PPTX, PNG, JPG, SVG · Max 50MB</p>
                  </div>
                </>
              ) : (
                <p className="text-xs text-muted-foreground">Save the book first to upload downloadable files.</p>
              )}
            </div>

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
