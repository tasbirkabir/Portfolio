"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Save, KeyRound, Eye, EyeOff, Check, Clock, ShieldCheck, UserCog,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { TF } from "./book-editor";
import { Card, relTime, fmtDate } from "./admin-ui";

type Account = {
  id: string;
  email: string;
  name: string;
  role: string;
  profileImage: string | null;
  twoFactorEnabled: boolean;
  lastLoginAt: string | null;
  lastLoginIp: string | null;
  passwordChangedAt: string | null;
  createdAt: string;
};

function initials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function scorePassword(pw: string): number {
  let score = 0;
  if (pw.length >= 8) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[a-z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  return Math.min(score, 4);
}

const STRENGTH = [
  { label: "Too weak", color: "bg-destructive" },
  { label: "Weak", color: "bg-amber-500" },
  { label: "Fair", color: "bg-yellow-500" },
  { label: "Good", color: "bg-lime-500" },
  { label: "Strong", color: "bg-emerald-500" },
];

export function AdminAccount() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [account, setAccount] = useState<Account | null>(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  // Password fields
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);

  useEffect(() => {
    void load();
  }, []);

  async function load() {
    setLoading(true);
    try {
      const r = await fetch("/api/admin/account");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load account");
      const a: Account = j.account;
      setAccount(a);
      setName(a.name || "");
      setEmail(a.email || "");
      setProfileImage(a.profileImage || "");
    } catch (e: any) {
      toast({ title: "Load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  async function saveProfile() {
    setSaving(true);
    try {
      const r = await fetch("/api/admin/account", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, profileImage: profileImage || null }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Save failed");
      setAccount(j.account);
      toast({ title: "Profile saved", description: "Your account details have been updated." });
    } catch (e: any) {
      toast({ title: "Save failed", description: e.message, variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  async function changePassword() {
    if (!currentPw || !newPw || !confirmPw) {
      toast({ title: "All fields required", description: "Fill in your current and new password.", variant: "destructive" });
      return;
    }
    if (newPw !== confirmPw) {
      toast({ title: "Passwords don't match", description: "New password and confirmation must match.", variant: "destructive" });
      return;
    }
    setPwSaving(true);
    try {
      const r = await fetch("/api/admin/account/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword: currentPw, newPassword: newPw, confirmPassword: confirmPw }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Password change failed");
      setCurrentPw(""); setNewPw(""); setConfirmPw("");
      toast({ title: "Password changed", description: "Other devices have been signed out." });
      void load();
    } catch (e: any) {
      toast({ title: "Password change failed", description: e.message, variant: "destructive" });
    } finally {
      setPwSaving(false);
    }
  }

  if (loading || !account) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const score = scorePassword(newPw);
  const profileDirty =
    name !== (account.name || "") ||
    email !== (account.email || "") ||
    profileImage !== (account.profileImage || "");

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Account</h1>
        <p className="text-sm text-muted-foreground">Manage your admin profile and password</p>
      </div>

      {/* Profile */}
      <Card title="Profile" desc="Your name, email and avatar">
        <div className="flex flex-col gap-5 sm:flex-row sm:items-start">
          <div className="flex shrink-0 flex-col items-center gap-2">
            {profileImage ? (
              <img
                src={profileImage}
                alt={name || "Profile"}
                className="h-20 w-20 rounded-full border border-border object-cover"
                onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = "none"; }}
              />
            ) : (
              <div className="flex h-20 w-20 items-center justify-center rounded-full border border-border bg-foreground font-display text-xl text-background">
                {initials(name || email)}
              </div>
            )}
            <span className="inline-flex items-center gap-1 rounded-full border border-border px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
              <ShieldCheck className="h-3 w-3 text-clay" /> {account.role}
            </span>
          </div>

          <div className="flex-1 space-y-3">
            <div className="grid gap-3 sm:grid-cols-2">
              <TF label="Name" value={name} onChange={setName} />
              <TF label="Email" type="email" value={email} onChange={setEmail} />
            </div>
            <TF label="Profile image URL" value={profileImage} onChange={setProfileImage} placeholder="https://…" />
            <p className="text-xs text-muted-foreground">
              {profileImage ? "Avatar preview shown on the left." : "Add a URL above to set your avatar."}
            </p>

            <div className="flex flex-wrap items-center justify-end gap-2">
              <button
                onClick={() => { setName(account.name || ""); setEmail(account.email || ""); setProfileImage(account.profileImage || ""); }}
                disabled={!profileDirty || saving}
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-foreground/5 disabled:opacity-40"
              >
                Reset
              </button>
              <button
                onClick={saveProfile}
                disabled={!profileDirty || saving}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                Save changes
              </button>
            </div>
          </div>
        </div>
      </Card>

      {/* Change Password */}
      <Card title="Change password" desc="Choose a strong, unique password">
        <div className="grid gap-3 sm:grid-cols-3">
          <PasswordField label="Current password" value={currentPw} onChange={setCurrentPw} show={showCurrent} onToggle={() => setShowCurrent((v) => !v)} />
          <PasswordField label="New password" value={newPw} onChange={setNewPw} show={showNew} onToggle={() => setShowNew((v) => !v)} />
          <PasswordField label="Confirm new password" value={confirmPw} onChange={setConfirmPw} show={showConfirm} onToggle={() => setShowConfirm((v) => !v)} />
        </div>

        {/* Strength indicator */}
        <div>
          <div className="flex gap-1.5">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className={
                  "h-1.5 flex-1 rounded-full transition-colors " +
                  (newPw.length === 0
                    ? "bg-muted"
                    : i < score
                    ? STRENGTH[score].color
                    : "bg-muted")
                }
              />
            ))}
          </div>
          <div className="mt-1.5 flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {newPw.length === 0 ? "Enter a new password" : STRENGTH[score].label}
            </span>
            <span className="text-muted-foreground">At least 8 characters, one uppercase, one lowercase, one number.</span>
          </div>
        </div>

        {confirmPw.length > 0 && newPw !== confirmPw && (
          <p className="flex items-center gap-1.5 text-xs text-destructive">
            <KeyRound className="h-3.5 w-3.5" /> New password and confirmation don&apos;t match.
          </p>
        )}

        <div className="flex justify-end">
          <button
            onClick={changePassword}
            disabled={pwSaving || !currentPw || !newPw || !confirmPw}
            className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
          >
            {pwSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <KeyRound className="h-4 w-4" />}
            Update password
          </button>
        </div>
      </Card>

      {/* Meta */}
      <Card title="Sign-in activity" desc="Last login and password history">
        <div className="grid gap-3 sm:grid-cols-2">
          <MetaRow icon={<Clock className="h-4 w-4 text-clay" />} label="Last login" value={relTime(account.lastLoginAt)} sub={account.lastLoginIp ? `from ${account.lastLoginIp}` : undefined} />
          <MetaRow icon={<KeyRound className="h-4 w-4 text-clay" />} label="Password changed" value={fmtDate(account.passwordChangedAt)} sub={relTime(account.passwordChangedAt)} />
          <MetaRow icon={<UserCog className="h-4 w-4 text-clay" />} label="Account created" value={fmtDate(account.createdAt)} />
          <MetaRow icon={<ShieldCheck className="h-4 w-4 text-clay" />} label="Two-factor auth" value={account.twoFactorEnabled ? "Enabled" : "Disabled"} sub={account.twoFactorEnabled ? "Configured" : "Recommended"} />
        </div>
        {account.twoFactorEnabled ? (
          <p className="flex items-center gap-1.5 text-xs text-emerald-600">
            <Check className="h-3.5 w-3.5" /> 2FA is active. Manage it on the Security tab.
          </p>
        ) : (
          <p className="text-xs text-muted-foreground">Tip: enable two-factor authentication on the Security tab to add an extra layer of protection.</p>
        )}
      </Card>
    </div>
  );
}

function PasswordField({
  label, value, onChange, show, onToggle,
}: { label: string; value: string; onChange: (v: string) => void; show: boolean; onToggle: () => void }) {
  return (
    <label className="block">
      <span className="mb-1 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="relative">
        <input
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full rounded-lg border border-border bg-background px-3 py-2 pr-9 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
        />
        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
        </button>
      </div>
    </label>
  );
}

function MetaRow({ icon, label, value, sub }: { icon: React.ReactNode; label: string; value: string; sub?: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl border border-border bg-background px-3 py-3">
      <div className="mt-0.5">{icon}</div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="truncate text-sm font-medium">{value}</p>
        {sub ? <p className="truncate text-[11px] text-muted-foreground">{sub}</p> : null}
      </div>
    </div>
  );
}
