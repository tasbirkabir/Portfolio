"use client";

import { useState } from "react";
import { Plus, Pencil, Trash2, X, Search, Loader2 } from "lucide-react";
import { useFetch } from "@/hooks/use-fetch";
import { useToast } from "@/hooks/use-toast";
import { BookCover } from "@/components/site/book-cover";
import { BookEditor } from "./book-editor";

export function AdminBooks() {
  const { data, loading, refetch } = useFetch<{ books: any[] }>("/api/admin/books");
  const { toast } = useToast();
  const [editing, setEditing] = useState<any | null>(null);
  const [creating, setCreating] = useState(false);
  const [q, setQ] = useState("");

  const books = (data?.books ?? []).filter((b) => b.title.toLowerCase().includes(q.toLowerCase()));

  async function del(slug: string, title: string) {
    if (!confirm(`Delete "${title}"? This cannot be undone.`)) return;
    const r = await fetch(`/api/admin/books/${slug}`, { method: "DELETE" });
    if (r.ok) { toast({ title: "Deleted", description: title }); refetch(); }
    else toast({ title: "Delete failed", variant: "destructive" });
  }

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Ebooks</h1>
          <p className="text-sm text-muted-foreground">{books.length} books in the library</p>
        </div>
        <button onClick={() => setCreating(true)} className="inline-flex items-center gap-2 rounded-full bg-foreground px-4 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]">
          <Plus className="h-4 w-4" /> New ebook
        </button>
      </div>

      <div className="flex items-center gap-2.5 rounded-full border border-border bg-card px-4 py-2.5">
        <Search className="h-4 w-4 text-muted-foreground" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Filter books…" className="flex-1 bg-transparent text-sm focus:outline-none" />
      </div>

      {loading ? (
        <div className="flex h-40 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <div key={b.slug} className="flex items-center gap-4 rounded-2xl border border-border/60 bg-card p-3">
              <div className="w-12 shrink-0"><BookCover book={b} showBadge={false} /></div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold">{b.title}</p>
                <p className="truncate text-xs text-muted-foreground">{b.category} · {b.pages}p · ${b.price} · {b.accessType}</p>
              </div>
              <span className={`hidden rounded-full px-2 py-0.5 text-[10px] font-medium uppercase sm:inline ${b.status === "published" ? "bg-green-500/10 text-green-600" : "bg-amber-500/10 text-amber-600"}`}>{b.status}</span>
              <div className="flex gap-1">
                <button onClick={() => setEditing(b)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"><Pencil className="h-4 w-4" /></button>
                <button onClick={() => del(b.slug, b.title)} className="flex h-8 w-8 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          ))}
        </div>
      )}

      {(editing || creating) && (
        <BookEditor
          book={editing}
          onClose={() => { setEditing(null); setCreating(false); }}
          onSaved={() => { setEditing(null); setCreating(false); refetch(); }}
        />
      )}
    </div>
  );
}
