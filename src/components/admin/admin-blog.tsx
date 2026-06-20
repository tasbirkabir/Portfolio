"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Loader2, Save } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import { TF, TA, Sel } from "./book-editor";

const CATS = ["Systems", "Marketing", "Freelancing", "Productivity", "AI", "Tutorials", "Case Studies"];

export function AdminBlog() {
  const { data, loading, refetch } = useFetch<{ posts: any[] }>("/api/admin/blog");
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);

  const posts = data?.posts ?? [];

  async function del(slug: string, title: string) {
    if (!confirm(`Delete "${title}"?`)) return;
    const r = await fetch(`/api/admin/blog/${slug}`, { method: "DELETE" });
    if (r.ok) { toast({ title: "Deleted" }); refetch(); }
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Blog</h1><p className="text-sm text-muted-foreground">{posts.length} posts</p></div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background"><Plus className="h-4 w-4" /> New post</button>
      </div>

      {loading ? <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div> : (
        <div className="space-y-2">
          {posts.map((p) => (
            <div key={p.slug} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3">
              <img src={p.cover} alt="" loading="lazy" className="h-12 w-16 shrink-0 rounded-lg object-cover" />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{p.title}</p>
                <p className="truncate text-xs text-muted-foreground">{p.category} · {p.readTime}m · {new Date(p.publishedAt).toLocaleDateString()}</p>
              </div>
              <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase sm:inline ${p.status === "published" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>{p.status}</span>
              <button onClick={() => setEditing(p)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><Pencil className="h-4 w-4" /></button>
              <button onClick={() => del(p.slug, p.title)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && <PostEditor post={editing} onClose={() => { setEditing(null); setCreating(false); }} onSaved={() => { setEditing(null); setCreating(false); refetch(); }} />}
    </div>
  );
}

function PostEditor({ post, onClose, onSaved }: { post: any | null; onClose: () => void; onSaved: () => void }) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState<any>(post || { title: "", slug: "", excerpt: "", content: "", category: "Systems", tags: [], readTime: 5, cover: "/images/blog-systems.jpg", featured: false, status: "published", seoTitle: "", seoDesc: "" });
  const set = (k: string, v: any) => setForm((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const r = post
        ? await fetch(`/api/admin/blog/${post.slug}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) })
        : await fetch("/api/admin/blog", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(form) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: post ? "Post updated" : "Post created" });
      onSaved();
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  return (
    <AnimatePresence>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[180] flex items-center justify-center bg-black/40 backdrop-blur-md p-4" onClick={onClose}>
        <motion.div initial={{ opacity: 0, y: 24, scale: 0.97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: 24, scale: 0.97 }} onClick={(e) => e.stopPropagation()} className="relative max-h-[90vh] w-full max-w-2xl overflow-y-auto thin-scrollbar rounded-3xl border border-border bg-card p-6 sm:p-8">
          <button onClick={onClose} className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"><X className="h-4 w-4" /></button>
          <h2 className="mb-5 font-display text-2xl tracking-tight">{post ? "Edit post" : "New post"}</h2>
          <div className="space-y-4">
            <TF label="Title" value={form.title} onChange={(v) => set("title", v)} />
            <TF label="Slug" value={form.slug} onChange={(v) => set("slug", v)} />
            <TA label="Excerpt" value={form.excerpt} onChange={(v) => set("excerpt", v)} rows={2} />
            <TA label="Content (Markdown — use ## for headings)" value={form.content} onChange={(v) => set("content", v)} rows={10} className="font-mono text-xs" />
            <div className="grid gap-3 sm:grid-cols-3">
              <Sel label="Category" value={form.category} onChange={(v) => set("category", v)} options={CATS} />
              <Sel label="Status" value={form.status} onChange={(v) => set("status", v)} options={["draft", "published", "scheduled"]} />
              <TF label="Read time (min)" type="number" value={form.readTime} onChange={(v) => set("readTime", Number(v))} />
            </div>
            <TF label="Cover image URL" value={form.cover} onChange={(v) => set("cover", v)} />
            <TF label="Tags (comma-separated)" value={(form.tags || []).join(", ")} onChange={(v) => set("tags", v.split(",").map((s) => s.trim()).filter(Boolean))} />
            <label className="flex items-center gap-2.5 text-sm"><input type="checkbox" checked={!!form.featured} onChange={(e) => set("featured", e.target.checked)} className="h-4 w-4 rounded" /> Featured</label>
            <TF label="SEO title" value={form.seoTitle ?? ""} onChange={(v) => set("seoTitle", v)} />
            <TF label="SEO description" value={form.seoDesc ?? ""} onChange={(v) => set("seoDesc", v)} />
            <div className="flex justify-end gap-3 border-t border-border pt-4">
              <button onClick={onClose} className="rounded-full border border-border px-5 py-2.5 text-sm hover:bg-foreground/5">Cancel</button>
              <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}{post ? "Save" : "Publish"}</button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
