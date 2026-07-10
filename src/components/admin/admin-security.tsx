"use client";

import { useState, useEffect } from "react";
import { Loader2, Shield, ShieldCheck, Smartphone, Clock, Check, X } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Card, relTime } from "./admin-ui";

export function AdminSecurity() {
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [account, setAccount] = useState<any>(null);

  useEffect(() => {
    fetch("/api/admin/account").then(r => r.json()).then(d => {
      setAccount(d.account);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, []);

  if (loading || !account) return <div className="flex h-96 items-center justify-center"><Loader2 className="h-5 w-5 animate-spin" /></div>;

  return (
    <div className="space-y-5">
      <div><h1 className="font-display text-2xl tracking-tight sm:text-3xl">Security</h1><p className="text-sm text-muted-foreground">Authentication and account security</p></div>

      <Card title="Authentication" desc="How your account is protected" icon={Shield}>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Supabase Auth</span>
            </div>
            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">Active</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <Check className="h-4 w-4 text-green-500" />
              <span className="text-sm font-medium">Email verification</span>
            </div>
            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">Enabled</span>
          </div>
          <div className="flex items-center justify-between rounded-xl bg-muted/40 p-3">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">Session persistence</span>
            </div>
            <span className="rounded-full bg-green-500/10 px-2.5 py-0.5 text-xs font-medium text-green-600">Automatic</span>
          </div>
        </div>
      </Card>

      <Card title="Account info" desc="Account details and login activity" icon={Clock}>
        <div className="grid gap-3 sm:grid-cols-2">
          <InfoRow label="Email" value={account.email} />
          <InfoRow label="Role" value={account.role} />
          <InfoRow label="Last login" value={account.lastLoginAt ? relTime(account.lastLoginAt) : "—"} />
          <InfoRow label="Last login IP" value={account.lastLoginIp || "—"} />
          <InfoRow label="Member since" value={new Date(account.createdAt).toLocaleDateString()} />
        </div>
      </Card>

      <Card title="Session management" desc="Your sessions are managed by Supabase Auth" icon={Smartphone}>
        <p className="text-sm text-muted-foreground">
          Supabase Auth automatically handles session refresh, token rotation, and secure cookie
          management. Your session persists across page refreshes and stays active until you sign out.
        </p>
        <p className="text-xs text-muted-foreground">
          To sign out of all devices, change your password via the "Reset password" link, which
          invalidates all existing sessions.
        </p>
      </Card>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between rounded-lg bg-muted/40 px-3 py-2">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className="text-sm font-medium capitalize">{value}</span>
    </div>
  );
}
