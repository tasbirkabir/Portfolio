"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Upload, Loader2, CheckCircle, FileArchive, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/store/nav";
import { cn } from "@/lib/utils";

export function ZipUploader({ onClose }: { onClose: () => void }) {
  const { toast } = useToast();
  const navigate = useNav((s) => s.navigate);
  const [uploading, setUploading] = useState(false);
  const [slug, setSlug] = useState("");
  const [bookId, setBookId] = useState("");
  const [result, setResult] = useState<any | null>(null);
  const [dragOver, setDragOver] = useState(false);

  async function uploadZip(file: File) {
    if (!file.name.toLowerCase().endsWith(".zip")) {
      toast({ title: "Invalid file", description: "Please upload a .zip file.", variant: "destructive" });
      return;
    }

    setUploading(true);
    setResult(null);

    try {
      const fd = new FormData();
      fd.append("zip", file);
      if (slug) fd.append("slug", slug);
      if (bookId) fd.append("bookId", bookId);

      const r = await fetch("/api/admin/books/upload-zip", {
        method: "POST",
        body: fd,
      });
      const j = await r.json();

      if (!r.ok) throw new Error(j.error || "Upload failed");

      setResult(j);
      toast({
        title: "Ebook published!",
        description: `"${j.book.title}" — ${j.book.chapters} chapters, ${j.book.pages} pages, ${j.assetsImported} assets imported.`,
      });
    } catch (e: any) {
      toast({ title: "Upload failed", description: e.message, variant: "destructive" });
    } finally {
      setUploading(false);
    }
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) uploadZip(file);
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[180] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 24, scale: 0.96 }}
          transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
        >
          <button
            onClick={onClose}
            className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground hover:bg-foreground/5 hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>

          <div className="p-7 sm:p-8">
            <div className="mb-5 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                <FileArchive className="h-5 w-5" />
              </div>
              <div>
                <h2 className="font-display text-xl tracking-tight">Publish from ZIP</h2>
                <p className="text-xs text-muted-foreground">Upload a complete ebook package — auto-imported & published</p>
              </div>
            </div>

            {result ? (
              /* Success state */
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="space-y-4"
              >
                <div className="flex items-center gap-3 rounded-2xl border border-green-500/30 bg-green-500/5 p-4">
                  <CheckCircle className="h-6 w-6 shrink-0 text-green-500" />
                  <div>
                    <p className="font-medium text-green-700 dark:text-green-400">Ebook published successfully!</p>
                    <p className="text-xs text-muted-foreground">"{result.book.title}" is now live in the reader.</p>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="font-display text-2xl">{result.book.chapters}</p>
                    <p className="text-xs text-muted-foreground">Chapters</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="font-display text-2xl">{result.book.pages}</p>
                    <p className="text-xs text-muted-foreground">Pages</p>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-3">
                    <p className="font-display text-2xl">{result.assetsImported}</p>
                    <p className="text-xs text-muted-foreground">Assets</p>
                  </div>
                </div>

                {result.warnings?.length > 0 && (
                  <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-3">
                    <p className="mb-1 flex items-center gap-1.5 text-xs font-medium text-amber-600">
                      <AlertCircle className="h-3.5 w-3.5" /> Warnings ({result.warnings.length})
                    </p>
                    {result.warnings.map((w: string, i: number) => (
                      <p key={i} className="text-xs text-muted-foreground">• {w}</p>
                    ))}
                  </div>
                )}

                <div className="flex gap-3">
                  <button
                    onClick={() => {
                      onClose();
                      navigate("book");
                    }}
                    className="flex-1 rounded-full bg-foreground px-5 py-3 text-sm font-medium text-background transition-transform hover:scale-[1.02]"
                  >
                    View ebook
                  </button>
                  <button
                    onClick={() => { setResult(null); }}
                    className="rounded-full border border-border px-5 py-3 text-sm transition-colors hover:bg-foreground/5"
                  >
                    Upload another
                  </button>
                </div>
              </motion.div>
            ) : (
              /* Upload state */
              <div className="space-y-4">
                {/* Optional: slug field */}
                <div className="grid gap-3 sm:grid-cols-2">
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Slug (optional — auto-generated if empty)</span>
                    <input
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="ai-agency-operating-system"
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-clay focus:outline-none"
                    />
                  </label>
                  <label className="block">
                    <span className="mb-1 block text-xs font-medium text-muted-foreground">Update existing book ID (optional)</span>
                    <input
                      value={bookId}
                      onChange={(e) => setBookId(e.target.value)}
                      placeholder="cmq..."
                      className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm focus:border-clay focus:outline-none"
                    />
                  </label>
                </div>

                {/* Drop zone */}
                <label
                  onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                  className={cn(
                    "flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed p-8 transition-all",
                    dragOver ? "border-clay bg-clay/5" : "border-border hover:border-foreground/40",
                    uploading && "pointer-events-none opacity-60"
                  )}
                >
                  {uploading ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin text-clay" />
                      <p className="text-sm font-medium">Processing ZIP package...</p>
                      <p className="text-xs text-muted-foreground">Extracting chapters, importing assets, generating TOC</p>
                    </>
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">Drop ZIP file here or click to browse</p>
                      <p className="text-xs text-muted-foreground">Max 100MB · .zip format</p>
                    </>
                  )}
                  <input
                    type="file"
                    accept=".zip"
                    className="hidden"
                    onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadZip(f); e.target.value = ""; }}
                  />
                </label>

                {/* Structure help */}
                <div className="rounded-xl bg-muted/30 p-3 text-xs text-muted-foreground">
                  <p className="mb-1.5 font-medium text-foreground">Expected ZIP structure:</p>
                  <pre className="overflow-x-auto text-[11px] leading-relaxed">{`book.zip
├── metadata.json        (title, description, price, category, tags)
├── cover.jpg            (optional)
├── index.html           (chapter 1 / intro)
├── chapter-2.html       (chapter 2)
├── chapter-3.html       (chapter 3)
└── assets/
    ├── images/
    └── illustrations/`}</pre>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
