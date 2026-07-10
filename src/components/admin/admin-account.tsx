"use client";

import { useState, useEffect } from "react";
import { Loader2, Save, KeyRound, UserCog, Clock } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";
import { Card, relTime, fmtDate } from "./admin-ui";
import { TF } from "./book-editor";

export function AdminAccount() {
  const { user, fetchUser } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<any>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  useEffect(() => {
    fetch("/api/admin/account").then(r => r.json()).then(d => {
      setAccount(d.account);
      setName(d.account?.name || "");
      setEmail(d.account?.email || "");
      setProfileImage(d.account?.profileImage || "");
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  async function save() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profileImage }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error);
      toast({ title: "Profile saved" });
      fetchUser();
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  if (loading || !account) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Account</h1><p className="text-sm text-muted-foreground">Manage your admin profile</p></div>

      <Card title="Profile" desc="Your name and profile image" icon={UserCog}>
        <div className="flex items-center gap-4">
          {profileImage ? (
            <img src={profileImage} alt={name} className="h-16 w-16 rounded-full object-cover ring-1 ring-black/5" />
          ) : (
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-foreground font-display text-2xl text-background">
              {(name || email).charAt(0).toUpperCase()}
            </span>
          )}
          <div>
            <p className="font-display text-lg">{name || "Admin"}</p>
            <p className="text-sm text-muted-foreground">{email}</p>
            {user?.role === "admin" && <span className="mt-1 inline-block rounded-full bg-clay/10 px-2 py-0.5 text-xs font-medium text-clay">Admin</span>}
          </div>
        </div>
        <TF label="Name" value={name} onChange={(v) => setName(v)} />
        <TF label="Profile image URL" value={profileImage} onChange={(v) => setProfileImage(v)} />
        <button onClick={save} disabled={saving} className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background disabled:opacity-60">
          {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />} Save changes
        </button>
      </Card>

      <Card title="Sign-in activity" desc="Recent account activity" icon={Clock}>
        <div className="grid gap-3 sm:grid-cols-3">
          <MiniStat label="Last login" value={account.lastLoginAt ? relTime(account.lastLoginAt) : "—"} />
          <MiniStat label="Last login IP" value={account.lastLoginIp || "—"} />
          <MiniStat label="Member since" value={fmtDate(account.createdAt)} />
        </div>
      </Card>

      <Card title="Password" desc="Change your password via Supabase Auth" icon={KeyRound}>
        <p className="text-sm text-muted-foreground">
          Password management is handled securely by Supabase Auth. To change your password,
          use the "Forgot password?" link on the sign-in page, or visit your account settings.
        </p>
        <button
          onClick={() => { useAuth.getState().openAuthModal("login"); }}
          className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-sm font-medium hover:bg-foreground/5"
        >
          <KeyRound className="h-4 w-4" /> Reset password
        </button>
      </Card>
    </div>
  );
}

function MiniStat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-muted/40 p-4">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="mt-1 truncate text-sm font-medium">{value}</p>
    </div>
  );
}
