"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TF, TA, Sel } from "./book-editor";

const VIEWS = ["home", "about", "books", "resources", "blog", "contact", "library", "account", "search", "admin"];

export function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [s, setS] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings").then((r) => r.json()).then((j) => { setS(j.settings); setLoading(false); });
  }, []);

  const set = (k: string, v: any) => setS((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(s) });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: "Settings saved", description: "Your website has been updated." });
    } catch (e: any) { toast({ title: "Save failed", description: e.message, variant: "destructive" }); }
    finally { setSaving(false); }
  }

  if (loading || !s) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  const navItems: any[] = s.navItems || [];

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Site settings</h1><p className="text-sm text-muted-foreground">Edit your entire website without touching code</p></div>
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60">{saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes</button>
      </div>

      {/* Homepage builder */}
      <Card title="Homepage" desc="Hero section & CTAs">
        <TF label="Hero eyebrow" value={s.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
        <TF label="Hero title" value={s.heroTitle} onChange={(v) => set("heroTitle", v)} />
        <TA label="Hero subtitle" value={s.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} rows={3} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TF label="Primary CTA" value={s.heroCta1} onChange={(v) => set("heroCta1", v)} />
          <TF label="Secondary CTA" value={s.heroCta2} onChange={(v) => set("heroCta2", v)} />
        </div>
        <TF label="Hero image URL" value={s.heroImage} onChange={(v) => set("heroImage", v)} />
      </Card>

      {/* Brand */}
      <Card title="Brand" desc="Logo, favicon, colors & tagline">
        <div className="grid gap-3 sm:grid-cols-2">
          <TF label="Brand name" value={s.brandName} onChange={(v) => set("brandName", v)} />
          <TF label="Tagline" value={s.brandTagline} onChange={(v) => set("brandTagline", v)} />
        </div>
        <div className="grid gap-3 sm:grid-cols-3">
          <TF label="Logo URL" value={s.logoUrl} onChange={(v) => set("logoUrl", v)} />
          <TF label="Favicon URL" value={s.faviconUrl} onChange={(v) => set("faviconUrl", v)} />
          <TF label="OG image URL" value={s.ogImageUrl} onChange={(v) => set("ogImageUrl", v)} />
        </div>
        <TF label="Accent color (hex)" value={s.accentColor} onChange={(v) => set("accentColor", v)} />
      </Card>

      {/* Navigation builder */}
      <Card title="Navigation" desc="Reorder, add & remove menu items">
        <div className="space-y-2">
          {navItems.map((n, i) => (
            <div key={i} className="flex items-center gap-2 rounded-lg border border-border bg-background p-2">
              <div className="flex flex-col">
                <button disabled={i === 0} onClick={() => { const c = [...navItems]; [c[i - 1], c[i]] = [c[i], c[i - 1]]; set("navItems", c); }} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowUp className="h-3 w-3" /></button>
                <button disabled={i === navItems.length - 1} onClick={() => { const c = [...navItems]; [c[i + 1], c[i]] = [c[i], c[i + 1]]; set("navItems", c); }} className="text-muted-foreground hover:text-foreground disabled:opacity-30"><ArrowDown className="h-3 w-3" /></button>
              </div>
              <input value={n.label} onChange={(e) => { const c = [...navItems]; c[i] = { ...c[i], label: e.target.value }; set("navItems", c); }} className="flex-1 rounded border border-border bg-transparent px-2 py-1 text-sm focus:outline-none" />
              <select value={n.view} onChange={(e) => { const c = [...navItems]; c[i] = { ...c[i], view: e.target.value }; set("navItems", c); }} className="rounded border border-border bg-transparent px-2 py-1 text-sm focus:outline-none">
                {VIEWS.map((v) => <option key={v} value={v}>{v}</option>)}
              </select>
              <button onClick={() => set("navItems", navItems.filter((_, x) => x !== i))} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          ))}
          <button onClick={() => set("navItems", [...navItems, { label: "New", view: "home" }])} className="inline-flex items-center gap-1.5 rounded-full border border-dashed border-border px-3 py-1.5 text-xs text-muted-foreground hover:text-foreground"><Plus className="h-3 w-3" /> Add item</button>
        </div>
      </Card>

      {/* Footer */}
      <Card title="Footer" desc="Bio, copyright & social links">
        <TA label="Footer bio" value={s.footerBio} onChange={(v) => set("footerBio", v)} rows={3} />
        <TF label="Copyright line" value={s.footerCopyright} onChange={(v) => set("footerCopyright", v)} />
        <div className="grid gap-3 sm:grid-cols-2">
          <TF label="LinkedIn URL" value={s.socialLinkedin} onChange={(v) => set("socialLinkedin", v)} />
          <TF label="X / Twitter URL" value={s.socialTwitter} onChange={(v) => set("socialTwitter", v)} />
          <TF label="GitHub URL" value={s.socialGithub} onChange={(v) => set("socialGithub", v)} />
          <TF label="Facebook URL" value={s.socialFacebook} onChange={(v) => set("socialFacebook", v)} />
          <TF label="Email (mailto:)" value={s.socialEmail} onChange={(v) => set("socialEmail", v)} />
        </div>
      </Card>

      {/* SEO */}
      <Card title="SEO defaults" desc="Default meta title & description">
        <TF label="Default SEO title" value={s.seoTitle} onChange={(v) => set("seoTitle", v)} />
        <TA label="Default SEO description" value={s.seoDesc} onChange={(v) => set("seoDesc", v)} rows={2} />
        <p className="text-xs text-muted-foreground">Per-page SEO can be set on each book and blog post. Sitemap is available at <code className="rounded bg-muted px-1">/sitemap.xml</code> and RSS at <code className="rounded bg-muted px-1">/rss.xml</code>.</p>
      </Card>
    </div>
  );
}

function Card({ title, desc, children }: { title: string; desc: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="mb-4"><h2 className="font-display text-lg tracking-tight">{title}</h2><p className="text-xs text-muted-foreground">{desc}</p></div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

export { Sel };
