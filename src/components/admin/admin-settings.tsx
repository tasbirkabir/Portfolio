"use client";

import { useState, useEffect } from "react";
import type { ReactNode } from "react";
import { Loader2, Save, Plus, Trash2, ArrowUp, ArrowDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TF, TA, Sel } from "./book-editor";

/** Routes available as nav / CTA targets across the site. */
const VIEWS = [
  "home", "about", "books", "resources", "blog", "contact",
  "library", "account", "search", "admin", "knowledge", "book",
];

/** Common Lucide icon names for quick reference in the icon field hint. */
const ICON_HINT =
  "Lucide icon name · e.g. Rocket, Bot, Globe, Workflow, BookOpen, TrendingUp, Megaphone, Search, Hammer, GraduationCap, ThumbsUp, Sparkles, Zap, Star, Code, Layers, Brain, Cpu";

const TABS = [
  { id: "homepage", label: "Homepage" },
  { id: "about", label: "About" },
  { id: "footer", label: "Footer" },
  { id: "navigation", label: "Navigation" },
  { id: "branding", label: "Branding" },
  { id: "contact", label: "Contact & SEO" },
] as const;

type TabId = (typeof TABS)[number]["id"];

export function AdminSettings() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [tab, setTab] = useState<TabId>("homepage");
  const [s, setS] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/settings")
      .then((r) => r.json())
      .then((j) => {
        setS(j.settings);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        toast({ title: "Failed to load settings", variant: "destructive" });
      });
  }, [toast]);

  const set = (k: string, v: any) => setS((f: any) => ({ ...f, [k]: v }));

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(s),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: "Settings saved", description: "Your website has been updated." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !s) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Sticky header: title + Save + tab pills */}
      <div className="sticky top-0 z-20 -mx-1 bg-background/85 px-1 pb-2 pt-1 backdrop-blur">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Site settings</h1>
            <p className="text-sm text-muted-foreground">Edit your entire website without touching code.</p>
          </div>
          <button
            onClick={save}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save changes
          </button>
        </div>

        <div className="no-scrollbar mt-3 flex gap-1.5 overflow-x-auto border-b border-border/60 pb-2">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={
                "shrink-0 rounded-full px-4 py-1.5 text-sm transition-colors " +
                (tab === t.id
                  ? "bg-foreground text-background"
                  : "text-muted-foreground hover:bg-foreground/5 hover:text-foreground")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─────────────────────────── Homepage ─────────────────────────── */}
      {tab === "homepage" && (
        <div className="space-y-5">
          <Card title="Hero" desc="Top-of-page headline, CTAs and avatar strip">
            <TF label="Hero eyebrow" value={s.heroEyebrow} onChange={(v) => set("heroEyebrow", v)} />
            <TF label="Hero title" value={s.heroTitle} onChange={(v) => set("heroTitle", v)} />
            <TA label="Hero subtitle" value={s.heroSubtitle} onChange={(v) => set("heroSubtitle", v)} rows={3} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Primary CTA text" value={s.heroCta1} onChange={(v) => set("heroCta1", v)} />
              <Sel label="Primary CTA view" value={s.heroCta1View} onChange={(v) => set("heroCta1View", v)} options={VIEWS} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Secondary CTA text" value={s.heroCta2} onChange={(v) => set("heroCta2", v)} />
              <Sel label="Secondary CTA view" value={s.heroCta2View} onChange={(v) => set("heroCta2View", v)} options={VIEWS} />
            </div>
            <TF label="Hero image URL" value={s.heroImage} onChange={(v) => set("heroImage", v)} />
            <TF label="Avatar strip text" value={s.heroAvatarStripText} onChange={(v) => set("heroAvatarStripText", v)} />
          </Card>

          <Card title="Section labels" desc="Eyebrows & titles for the homepage blocks">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="What I Build — eyebrow" value={s.homeWhatIBuildEyebrow} onChange={(v) => set("homeWhatIBuildEyebrow", v)} />
              <TF label="What I Build — title" value={s.homeWhatIBuildTitle} onChange={(v) => set("homeWhatIBuildTitle", v)} />
            </div>
            <TF label="Featured — eyebrow" value={s.homeFeaturedEyebrow} onChange={(v) => set("homeFeaturedEyebrow", v)} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Social proof — eyebrow" value={s.homeSocialProofEyebrow} onChange={(v) => set("homeSocialProofEyebrow", v)} />
              <TF label="Social proof — title" value={s.homeSocialProofTitle} onChange={(v) => set("homeSocialProofTitle", v)} />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Resources — eyebrow" value={s.homeResourcesEyebrow} onChange={(v) => set("homeResourcesEyebrow", v)} />
              <TF label="Resources — title" value={s.homeResourcesTitle} onChange={(v) => set("homeResourcesTitle", v)} />
            </div>
          </Card>

          <Card title="Stats" desc="Numerical highlights under the hero (icon · value · label)">
            <ListEditor
              items={s.homeStats || []}
              onChange={(items) => set("homeStats", items)}
              makeNew={() => ({ icon: "Rocket", value: "0+", label: "New stat" })}
              addLabel="Add stat"
              render={(item, update) => (
                <div className="grid gap-2 sm:grid-cols-3">
                  <IconField label="Icon" value={item.icon} onChange={(v) => update("icon", v)} />
                  <TF label="Value" value={item.value} onChange={(v) => update("value", v)} />
                  <TF label="Label" value={item.label} onChange={(v) => update("label", v)} />
                </div>
              )}
            />
          </Card>

          <Card title="What I Build" desc="Service pillars shown on the homepage">
            <ListEditor
              items={s.homeWhatIBuild || []}
              onChange={(items) => set("homeWhatIBuild", items)}
              makeNew={() => ({ icon: "Bot", title: "New pillar", desc: "" })}
              addLabel="Add pillar"
              render={(item, update) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                    <IconField label="Icon" value={item.icon} onChange={(v) => update("icon", v)} />
                    <TF label="Title" value={item.title} onChange={(v) => update("title", v)} />
                  </div>
                  <TA label="Description" value={item.desc} onChange={(v) => update("desc", v)} rows={2} />
                </div>
              )}
            />
          </Card>
        </div>
      )}

      {/* ───────────────────────────── About ───────────────────────────── */}
      {tab === "about" && (
        <div className="space-y-5">
          <Card title="Hero" desc="About-page headline & biography">
            <TF label="Eyebrow" value={s.aboutEyebrow} onChange={(v) => set("aboutEyebrow", v)} />
            <TF label="Title" value={s.aboutTitle} onChange={(v) => set("aboutTitle", v)} />
            <TA label="Bio (separate paragraphs with a blank line)" value={s.aboutBio} onChange={(v) => set("aboutBio", v)} rows={6} />
            <p className="text-[10px] text-muted-foreground">Press Enter twice to start a new paragraph — paragraphs are split on <code className="rounded bg-muted px-1">\n\n</code>.</p>
          </Card>

          <Card title="Mission" desc="Quote + body for the mission block">
            <TF label="Mission quote" value={s.aboutMissionQuote} onChange={(v) => set("aboutMissionQuote", v)} />
            <TA label="Mission body (separate paragraphs with a blank line)" value={s.aboutMissionBody} onChange={(v) => set("aboutMissionBody", v)} rows={5} />
          </Card>

          <Card title="Services" desc="What you build & teach — eyebrow, title, subtitle & list">
            <div className="grid gap-3 sm:grid-cols-3">
              <TF label="Eyebrow" value={s.aboutServicesEyebrow} onChange={(v) => set("aboutServicesEyebrow", v)} />
              <TF label="Title" value={s.aboutServicesTitle} onChange={(v) => set("aboutServicesTitle", v)} />
              <TF label="Subtitle" value={s.aboutServicesSubtitle} onChange={(v) => set("aboutServicesSubtitle", v)} />
            </div>
            <ListEditor
              items={s.aboutServices || []}
              onChange={(items) => set("aboutServices", items)}
              makeNew={() => ({ icon: "Bot", title: "New service", desc: "", stack: "" })}
              addLabel="Add service"
              render={(item, update) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                    <IconField label="Icon" value={item.icon} onChange={(v) => update("icon", v)} />
                    <TF label="Title" value={item.title} onChange={(v) => update("title", v)} />
                  </div>
                  <TA label="Description" value={item.desc} onChange={(v) => update("desc", v)} rows={2} />
                  <TF label="Stack" value={item.stack} onChange={(v) => update("stack", v)} />
                </div>
              )}
            />
          </Card>

          <Card title="Process" desc="Step-by-step process — eyebrow, title & list">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Eyebrow" value={s.aboutProcessEyebrow} onChange={(v) => set("aboutProcessEyebrow", v)} />
              <TF label="Title" value={s.aboutProcessTitle} onChange={(v) => set("aboutProcessTitle", v)} />
            </div>
            <ListEditor
              items={s.aboutProcess || []}
              onChange={(items) => set("aboutProcess", items)}
              makeNew={() => ({ icon: "Search", step: "01", title: "New step", desc: "" })}
              addLabel="Add step"
              render={(item, update) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <IconField label="Icon" value={item.icon} onChange={(v) => update("icon", v)} />
                    <TF label="Step" value={item.step} onChange={(v) => update("step", v)} />
                    <TF label="Title" value={item.title} onChange={(v) => update("title", v)} />
                  </div>
                  <TA label="Description" value={item.desc} onChange={(v) => update("desc", v)} rows={2} />
                </div>
              )}
            />
          </Card>

          <Card title="Timeline" desc="Career milestones — eyebrow, title & list">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Eyebrow" value={s.aboutTimelineEyebrow} onChange={(v) => set("aboutTimelineEyebrow", v)} />
              <TF label="Title" value={s.aboutTimelineTitle} onChange={(v) => set("aboutTimelineTitle", v)} />
            </div>
            <ListEditor
              items={s.aboutTimeline || []}
              onChange={(items) => set("aboutTimeline", items)}
              makeNew={() => ({ year: "Year", title: "New milestone", desc: "" })}
              addLabel="Add milestone"
              render={(item, update) => (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-[1fr_2fr]">
                    <TF label="Year" value={item.year} onChange={(v) => update("year", v)} />
                    <TF label="Title" value={item.title} onChange={(v) => update("title", v)} />
                  </div>
                  <TA label="Description" value={item.desc} onChange={(v) => update("desc", v)} rows={2} />
                </div>
              )}
            />
          </Card>

          <Card title="Achievements" desc="Big-number highlight strip">
            <ListEditor
              items={s.aboutAchievements || []}
              onChange={(items) => set("aboutAchievements", items)}
              makeNew={() => ({ value: "0+", label: "New achievement" })}
              addLabel="Add achievement"
              render={(item, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <TF label="Value" value={item.value} onChange={(v) => update("value", v)} />
                  <TF label="Label" value={item.label} onChange={(v) => update("label", v)} />
                </div>
              )}
            />
          </Card>

          <Card title="Call to action" desc="Bottom CTA on the about page">
            <TF label="CTA title" value={s.aboutCtaTitle} onChange={(v) => set("aboutCtaTitle", v)} />
            <TA label="CTA description" value={s.aboutCtaDesc} onChange={(v) => set("aboutCtaDesc", v)} rows={2} />
          </Card>
        </div>
      )}

      {/* ───────────────────────────── Footer ──────────────────────────── */}
      {tab === "footer" && (
        <div className="space-y-5">
          <Card title="Footer basics" desc="Bio, copyright & tagline">
            <TA label="Footer bio" value={s.footerBio} onChange={(v) => set("footerBio", v)} rows={4} />
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Copyright line" value={s.footerCopyright} onChange={(v) => set("footerCopyright", v)} />
              <TF label="Tagline" value={s.footerTagline} onChange={(v) => set("footerTagline", v)} />
            </div>
          </Card>

          <Card title="Footer columns" desc="Add or remove columns and the links inside each">
            <FooterColumnsEditor
              columns={s.footerColumns || []}
              onChange={(cols) => set("footerColumns", cols)}
            />
          </Card>
        </div>
      )}

      {/* ─────────────────────────── Navigation ────────────────────────── */}
      {tab === "navigation" && (
        <div className="space-y-5">
          <Card title="Navigation items" desc="Reorder, add & remove menu items">
            <ListEditor
              items={s.navItems || []}
              onChange={(items) => set("navItems", items)}
              makeNew={() => ({ label: "New", view: "home" })}
              addLabel="Add nav item"
              render={(item, update) => (
                <div className="grid gap-2 sm:grid-cols-2">
                  <TF label="Label" value={item.label} onChange={(v) => update("label", v)} />
                  <Sel label="View" value={item.view} onChange={(v) => update("view", v)} options={VIEWS} />
                </div>
              )}
            />
            <p className="text-[10px] text-muted-foreground">Leave empty to use the site's default navigation.</p>
          </Card>
        </div>
      )}

      {/* ─────────────────────────── Branding ──────────────────────────── */}
      {tab === "branding" && (
        <div className="space-y-5">
          <Card title="Brand basics" desc="Name & tagline shown across the site">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Brand name" value={s.brandName} onChange={(v) => set("brandName", v)} />
              <TF label="Tagline" value={s.brandTagline} onChange={(v) => set("brandTagline", v)} />
            </div>
          </Card>

          <Card title="Brand assets" desc="Logo, favicon & Open Graph image URLs">
            <TF label="Logo URL" value={s.logoUrl} onChange={(v) => set("logoUrl", v)} />
            <TF label="Favicon URL" value={s.faviconUrl} onChange={(v) => set("faviconUrl", v)} />
            <TF label="OG image URL" value={s.ogImageUrl} onChange={(v) => set("ogImageUrl", v)} />
          </Card>

          <Card title="Theme" desc="Accent color used for highlights across the site">
            <div className="grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <TF label="Accent color (hex)" value={s.accentColor} onChange={(v) => set("accentColor", v)} />
              <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                <span className="h-5 w-5 rounded-full border border-border" style={{ background: s.accentColor }} />
                <span className="text-xs text-muted-foreground">Preview</span>
              </div>
            </div>
          </Card>

          <Card title="Social links" desc="Profiles shown in the footer & contact areas">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="LinkedIn URL" value={s.socialLinkedin} onChange={(v) => set("socialLinkedin", v)} />
              <TF label="X / Twitter URL" value={s.socialTwitter} onChange={(v) => set("socialTwitter", v)} />
              <TF label="GitHub URL" value={s.socialGithub} onChange={(v) => set("socialGithub", v)} />
              <TF label="Facebook URL" value={s.socialFacebook} onChange={(v) => set("socialFacebook", v)} />
              <TF label="Email (mailto:)" value={s.socialEmail} onChange={(v) => set("socialEmail", v)} />
            </div>
          </Card>
        </div>
      )}

      {/* ────────────────────────── Contact & SEO ──────────────────────── */}
      {tab === "contact" && (
        <div className="space-y-5">
          <Card title="Contact details" desc="Primary email & phone for inquiries">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Contact email" value={s.contactEmail} onChange={(v) => set("contactEmail", v)} />
              <TF label="Contact phone" value={s.contactPhone} onChange={(v) => set("contactPhone", v)} />
            </div>
          </Card>

          <Card title="SEO defaults" desc="Default meta title & description for the site">
            <TF label="Default SEO title" value={s.seoTitle} onChange={(v) => set("seoTitle", v)} />
            <TA label="Default SEO description" value={s.seoDesc} onChange={(v) => set("seoDesc", v)} rows={3} />
            <p className="text-xs text-muted-foreground">
              Per-page SEO can be set on each book and blog post. Sitemap is available at{" "}
              <code className="rounded bg-muted px-1">/sitemap.xml</code> and RSS at{" "}
              <code className="rounded bg-muted px-1">/rss.xml</code>.
            </p>
          </Card>
        </div>
      )}
    </div>
  );
}

/* ──────────────────────────── Helpers ──────────────────────────── */

function Card({ title, desc, children }: { title: string; desc: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-border/60 bg-card p-5 sm:p-6">
      <div className="mb-4">
        <h2 className="font-display text-lg tracking-tight">{title}</h2>
        <p className="text-xs text-muted-foreground">{desc}</p>
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

/** Text field plus a hint listing common Lucide icon names. */
function IconField({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div>
      <TF label={label} value={value} onChange={onChange} />
      <p className="mt-1 text-[10px] text-muted-foreground">{ICON_HINT}</p>
    </div>
  );
}

/** Generic list editor with add / remove / reorder for any array of objects. */
function ListEditor({
  items,
  onChange,
  render,
  makeNew,
  addLabel = "Add item",
}: {
  items: any[];
  onChange: (items: any[]) => void;
  render: (item: any, update: (key: string, value: any) => void, i: number) => ReactNode;
  makeNew: () => any;
  addLabel?: string;
}) {
  const update = (i: number, key: string, value: any) => {
    const c = [...items];
    c[i] = { ...c[i], [key]: value };
    onChange(c);
  };
  const remove = (i: number) => onChange(items.filter((_, x) => x !== i));
  const moveUp = (i: number) => {
    if (i === 0) return;
    const c = [...items];
    [c[i - 1], c[i]] = [c[i], c[i - 1]];
    onChange(c);
  };
  const moveDown = (i: number) => {
    if (i === items.length - 1) return;
    const c = [...items];
    [c[i + 1], c[i]] = [c[i], c[i + 1]];
    onChange(c);
  };
  const add = () => onChange([...items, makeNew()]);

  return (
    <div className="space-y-2.5">
      {items.map((item, i) => (
        <div key={i} className="rounded-2xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center justify-end gap-1">
            <button
              type="button"
              disabled={i === 0}
              onClick={() => moveUp(i)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
              aria-label="Move up"
            >
              <ArrowUp className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              disabled={i === items.length - 1}
              onClick={() => moveDown(i)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30"
              aria-label="Move down"
            >
              <ArrowDown className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onClick={() => remove(i)}
              className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              aria-label="Remove"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
          {render(item, (k, v) => update(i, k, v), i)}
        </div>
      ))}
      <button
        type="button"
        onClick={add}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-clay hover:text-clay"
      >
        <Plus className="h-3.5 w-3.5" /> {addLabel}
      </button>
    </div>
  );
}

/** Footer columns editor — each column has a title + a nested list of links. */
function FooterColumnsEditor({
  columns,
  onChange,
}: {
  columns: any[];
  onChange: (cols: any[]) => void;
}) {
  const updateCol = (i: number, key: string, value: any) => {
    const c = [...columns];
    c[i] = { ...c[i], [key]: value };
    onChange(c);
  };
  const removeCol = (i: number) => onChange(columns.filter((_, x) => x !== i));
  const moveColUp = (i: number) => {
    if (i === 0) return;
    const c = [...columns];
    [c[i - 1], c[i]] = [c[i], c[i - 1]];
    onChange(c);
  };
  const moveColDown = (i: number) => {
    if (i === columns.length - 1) return;
    const c = [...columns];
    [c[i + 1], c[i]] = [c[i], c[i + 1]];
    onChange(c);
  };
  const addCol = () => onChange([...columns, { title: "New column", links: [] }]);

  return (
    <div className="space-y-3">
      {columns.map((col, i) => (
        <div key={i} className="rounded-2xl border border-border bg-background p-3">
          <div className="mb-2 flex items-center gap-2">
            <TF label="Column title" value={col.title} onChange={(v) => updateCol(i, "title", v)} />
            <div className="flex items-center gap-1 self-end pb-1">
              <button type="button" disabled={i === 0} onClick={() => moveColUp(i)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30" aria-label="Move column up"><ArrowUp className="h-3.5 w-3.5" /></button>
              <button type="button" disabled={i === columns.length - 1} onClick={() => moveColDown(i)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-foreground/5 hover:text-foreground disabled:opacity-30" aria-label="Move column down"><ArrowDown className="h-3.5 w-3.5" /></button>
              <button type="button" onClick={() => removeCol(i)} className="flex h-7 w-7 items-center justify-center rounded-md text-muted-foreground hover:bg-destructive/10 hover:text-destructive" aria-label="Remove column"><Trash2 className="h-3.5 w-3.5" /></button>
            </div>
          </div>

          {/* Nested link list */}
          <ListEditor
            items={col.links || []}
            onChange={(links) => updateCol(i, "links", links)}
            makeNew={() => ({ label: "New link", view: "home", bookSlug: "" })}
            addLabel="Add link"
            render={(item, update) => (
              <div className="space-y-2">
                <TF label="Label" value={item.label} onChange={(v) => update("label", v)} />
                <div className="grid gap-2 sm:grid-cols-2">
                  <Sel label="View" value={item.view || "home"} onChange={(v) => update("view", v)} options={VIEWS} />
                  <TF label="Book slug (optional, only for book view)" value={item.bookSlug || ""} onChange={(v) => update("bookSlug", v)} />
                </div>
              </div>
            )}
          />
        </div>
      ))}
      <button
        type="button"
        onClick={addCol}
        className="inline-flex w-full items-center justify-center gap-1.5 rounded-2xl border border-dashed border-border px-4 py-2.5 text-xs text-muted-foreground transition-colors hover:border-clay hover:text-clay"
      >
        <Plus className="h-3.5 w-3.5" /> Add column
      </button>
    </div>
  );
}

export { Sel };
