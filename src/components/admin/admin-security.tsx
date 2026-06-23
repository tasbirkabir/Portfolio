"use client";

import { useState, useEffect } from "react";
import {
  Loader2, Shield, ShieldCheck, Smartphone, Monitor, LogOut, Clock,
  Check, X, Copy, QrCode, AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, relTime } from "./admin-account";

type Session = {
  id: string;
  sid: string;
  deviceName: string;
  ip: string;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  current: boolean;
};

type HistoryEntry = {
  id: string;
  ip: string;
  deviceName: string;
  success: boolean;
  reason: string | null;
  createdAt: string;
};

function deviceIcon(name: string) {
  const n = (name || "").toLowerCase();
  if (n.includes("mobile") || n.includes("phone") || n.includes("android") || n.includes("iphone")) return <Smartphone className="h-4 w-4 text-clay" />;
  return <Monitor className="h-4 w-4 text-clay" />;
}

export function AdminSecurity() {
  const { toast } = useToast();
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(true);
  const [history, setHistory] = useState<HistoryEntry[]>([]);
  const [revoking, setRevoking] = useState<string | null>(null);

  // 2FA state
  const [twoFactorEnabled, setTwoFactorEnabled] = useState<boolean | null>(null);
  const [loadingStatus, setLoadingStatus] = useState(true);
  const [setup, setSetup] = useState<{ secret: string; qrDataUrl: string } | null>(null);
  const [settingUp, setSettingUp] = useState(false);
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [disabling, setDisabling] = useState(false);

  useEffect(() => {
    void loadSessions();
    void loadHistory();
    void loadStatus();
  }, []);

  async function loadSessions() {
    setLoadingSessions(true);
    try {
      const r = await fetch("/api/admin/account/sessions");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load sessions");
      setSessions(j.sessions || []);
    } catch (e: any) {
      toast({ title: "Sessions load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoadingSessions(false);
    }
  }

  async function loadHistory() {
    setLoadingHistory(true);
    try {
      const r = await fetch("/api/admin/account/login-history");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load history");
      setHistory(j.history || []);
    } catch (e: any) {
      toast({ title: "History load failed", description: e.message, variant: "destructive" });
    } finally {
      setLoadingHistory(false);
    }
  }

  async function loadStatus() {
    setLoadingStatus(true);
    try {
      const r = await fetch("/api/admin/account");
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Failed to load account");
      setTwoFactorEnabled(!!j.account?.twoFactorEnabled);
    } catch {
      setTwoFactorEnabled(null);
    } finally {
      setLoadingStatus(false);
    }
  }

  async function revokeSession(sid: string, device: string) {
    if (!confirm(`Sign out "${device}"? This will end that session immediately.`)) return;
    setRevoking(sid);
    try {
      const r = await fetch(`/api/admin/account/sessions/${encodeURIComponent(sid)}`, { method: "DELETE" });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Revoke failed");
      toast({ title: "Session ended", description: device });
      await loadSessions();
    } catch (e: any) {
      toast({ title: "Revoke failed", description: e.message, variant: "destructive" });
    } finally {
      setRevoking(null);
    }
  }

  async function startSetup() {
    setSettingUp(true);
    setCode("");
    try {
      const r = await fetch("/api/admin/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "setup" }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Setup failed");
      setSetup({ secret: j.secret, qrDataUrl: j.qrDataUrl });
    } catch (e: any) {
      toast({ title: "2FA setup failed", description: e.message, variant: "destructive" });
    } finally {
      setSettingUp(false);
    }
  }

  async function verifyAndEnable() {
    if (!code.trim()) {
      toast({ title: "Enter the code", description: "Type the 6-digit code from your authenticator app.", variant: "destructive" });
      return;
    }
    setVerifying(true);
    try {
      const r = await fetch("/api/admin/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "enable", code }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Verification failed");
      setTwoFactorEnabled(true);
      setSetup(null);
      setCode("");
      toast({ title: "2FA enabled", description: "Two-factor authentication is now active." });
    } catch (e: any) {
      toast({ title: "Verification failed", description: e.message, variant: "destructive" });
    } finally {
      setVerifying(false);
    }
  }

  async function disable2fa() {
    if (!code.trim()) {
      toast({ title: "Enter the code", description: "Type your current 6-digit code to confirm.", variant: "destructive" });
      return;
    }
    if (!confirm("Disable two-factor authentication? Your account will be less secure.")) return;
    setDisabling(true);
    try {
      const r = await fetch("/api/admin/account/2fa", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "disable", code }),
      });
      const j = await r.json();
      if (!r.ok) throw new Error(j.error || "Disable failed");
      setTwoFactorEnabled(false);
      setCode("");
      toast({ title: "2FA disabled", description: "Two-factor authentication has been turned off." });
    } catch (e: any) {
      toast({ title: "Disable failed", description: e.message, variant: "destructive" });
    } finally {
      setDisabling(false);
    }
  }

  function copySecret() {
    if (!setup?.secret) return;
    navigator.clipboard?.writeText(setup.secret).then(
      () => toast({ title: "Secret copied" }),
      () => toast({ title: "Copy failed", variant: "destructive" })
    );
  }

  return (
    <div className="space-y-5">
      <div>
        <h1 className="font-display text-2xl tracking-tight sm:text-3xl">Security</h1>
        <p className="text-sm text-muted-foreground">Sessions, login history and two-factor authentication</p>
      </div>

      {/* Active Sessions */}
      <Card title="Active sessions" desc="Devices currently signed in to your account">
        {loadingSessions ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : sessions.length === 0 ? (
          <EmptyState icon={<Monitor className="h-5 w-5" />} text="No active sessions found." />
        ) : (
          <div className="space-y-2">
            {sessions.map((s) => (
              <div key={s.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-border bg-background px-3 py-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  {deviceIcon(s.deviceName)}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="truncate text-sm font-medium">{s.deviceName}</p>
                    {s.current && (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-600">
                        <Check className="h-3 w-3" /> Current device
                      </span>
                    )}
                  </div>
                  <p className="truncate text-xs text-muted-foreground">
                    {s.ip} · Active {relTime(s.lastActiveAt)}
                  </p>
                </div>
                {s.current ? (
                  <span className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-clay" /> This device
                  </span>
                ) : (
                  <button
                    onClick={() => revokeSession(s.sid, s.deviceName)}
                    disabled={revoking === s.sid}
                    className="inline-flex items-center gap-1.5 rounded-full border border-border px-3 py-1.5 text-xs transition-colors hover:border-destructive hover:text-destructive disabled:opacity-60"
                  >
                    {revoking === s.sid ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <LogOut className="h-3.5 w-3.5" />}
                    Sign out
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Login History */}
      <Card title="Login history" desc="Recent sign-in attempts (last 30)">
        {loadingHistory ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : history.length === 0 ? (
          <EmptyState icon={<Clock className="h-5 w-5" />} text="No login activity recorded yet." />
        ) : (
          <div className="max-h-96 space-y-1.5 overflow-y-auto thin-scrollbar pr-1">
            {history.map((h) => (
              <div key={h.id} className="flex items-center gap-3 rounded-xl border border-border bg-background px-3 py-2">
                <span className={
                  "flex h-7 w-7 shrink-0 items-center justify-center rounded-full " +
                  (h.success ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")
                }>
                  {h.success ? <Check className="h-3.5 w-3.5" /> : <X className="h-3.5 w-3.5" />}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{h.deviceName}</p>
                  <p className="truncate text-xs text-muted-foreground">
                    {h.ip} · {relTime(h.createdAt)}
                    {h.reason ? ` · ${h.reason}` : ""}
                  </p>
                </div>
                <span className={
                  "shrink-0 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide " +
                  (h.success ? "bg-emerald-500/10 text-emerald-600" : "bg-destructive/10 text-destructive")
                }>
                  {h.success ? "Success" : "Failed"}
                </span>
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* Two-Factor Authentication */}
      <Card title="Two-factor authentication" desc="Add a second step to keep your account safe">
        {loadingStatus ? (
          <div className="flex h-32 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
        ) : twoFactorEnabled ? (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-emerald-500/30 bg-emerald-500/5 px-4 py-3">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
              <div>
                <p className="text-sm font-medium">2FA is enabled</p>
                <p className="text-xs text-muted-foreground">You&apos;ll need a code from your authenticator app to sign in.</p>
              </div>
            </div>
            <div>
              <label className="block">
                <span className="mb-1 block text-xs font-medium text-muted-foreground">Enter your 6-digit code to disable</span>
                <input
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                  placeholder="000000"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-[0.3em] focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
                />
              </label>
            </div>
            <div className="flex justify-end">
              <button
                onClick={disable2fa}
                disabled={disabling || code.length !== 6}
                className="inline-flex items-center gap-2 rounded-full border border-destructive px-5 py-2 text-sm font-medium text-destructive transition-colors hover:bg-destructive hover:text-white disabled:opacity-60"
              >
                {disabling ? <Loader2 className="h-4 w-4 animate-spin" /> : <Shield className="h-4 w-4" />}
                Disable 2FA
              </button>
            </div>
          </div>
        ) : setup ? (
          <div className="space-y-4">
            <p className="flex items-start gap-2 text-xs text-muted-foreground">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-clay" />
              Scan the QR code with Google Authenticator, Authy, or 1Password, then enter the 6-digit code.
            </p>
            <div className="flex flex-col items-center gap-3 sm:flex-row sm:items-start">
              <div className="rounded-2xl border border-border bg-white p-3">
                <img src={setup.qrDataUrl} alt="2FA QR code" className="h-40 w-40" />
              </div>
              <div className="flex-1 space-y-3">
                <div>
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">Manual entry key</span>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-background px-3 py-2">
                    <code className="flex-1 break-all font-mono text-xs">{setup.secret}</code>
                    <button onClick={copySecret} className="shrink-0 text-muted-foreground hover:text-foreground" aria-label="Copy secret">
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
                <label className="block">
                  <span className="mb-1 block text-xs font-medium text-muted-foreground">Verification code</span>
                  <input
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    placeholder="000000"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 font-mono text-sm tracking-[0.3em] focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
                  />
                </label>
              </div>
            </div>
            <div className="flex flex-wrap justify-end gap-2">
              <button
                onClick={() => { setSetup(null); setCode(""); }}
                className="rounded-full border border-border px-4 py-2 text-sm transition-colors hover:bg-foreground/5"
              >
                Cancel
              </button>
              <button
                onClick={verifyAndEnable}
                disabled={verifying || code.length !== 6}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {verifying ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShieldCheck className="h-4 w-4" />}
                Verify &amp; enable
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-center gap-3 rounded-2xl border border-border bg-background px-4 py-3">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">2FA is not enabled</p>
                <p className="text-xs text-muted-foreground">Protect your account with an authenticator app code at sign-in.</p>
              </div>
            </div>
            <div className="flex justify-end">
              <button
                onClick={startSetup}
                disabled={settingUp}
                className="inline-flex items-center gap-2 rounded-full bg-foreground px-5 py-2 text-sm font-medium text-background transition-transform hover:scale-[1.03] disabled:opacity-60"
              >
                {settingUp ? <Loader2 className="h-4 w-4 animate-spin" /> : <QrCode className="h-4 w-4" />}
                Enable 2FA
              </button>
            </div>
          </div>
        )}
      </Card>
    </div>
  );
}

function EmptyState({ icon, text }: { icon: React.ReactNode; text: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-2 py-10 text-center">
      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted text-muted-foreground">{icon}</div>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
