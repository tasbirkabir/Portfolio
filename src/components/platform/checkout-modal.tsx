"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, ArrowRight, Shield, Loader2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/store/nav";
import { cn } from "@/lib/utils";

type Method = "bkash" | "nagad" | "rocket" | "card";

const ALL_METHODS: { id: Method; label: string; color: string; desc: string }[] = [
  { id: "bkash", label: "bKash", color: "#E2136E", desc: "Mobile wallet" },
  { id: "nagad", label: "Nagad", color: "#F37021", desc: "Mobile wallet" },
  { id: "rocket", label: "Rocket", color: "#8B2C8B", desc: "Mobile wallet" },
  { id: "card", label: "Card", color: "#1a1a1a", desc: "Visa / Mastercard" },
];

type CheckoutItem = { slug: string; title: string; type: "book" | "resource"; price: number };

export function CheckoutModal({
  open,
  items,
  onClose,
  onSuccess,
}: {
  open: boolean;
  items: CheckoutItem[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user, openAuthModal } = useAuth();
  const { toast } = useToast();
  const navigate = useNav((s) => s.navigate);
  const [method, setMethod] = useState<Method>("bkash");
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [loading, setLoading] = useState(false);

  // Fetch available payment methods / gateway config
  const [gatewayInfo, setGatewayInfo] = useState<{
    active: string;
    isLive: boolean;
    methods: string[];
    gateways: { id: string; name: string; configured: boolean }[];
  } | null>(null);

  useEffect(() => {
    if (!open) return;
    fetch("/api/payments/methods")
      .then((r) => r.json())
      .then(setGatewayInfo)
      .catch(() => {});
  }, [open]);

  const availableMethods = ALL_METHODS.filter((m) =>
    gatewayInfo?.methods?.includes(m.id) ?? true
  );
  const activeGatewayName = gatewayInfo?.gateways?.find((g) => g.id === gatewayInfo.active)?.name || "Demo";
  const isLive = gatewayInfo?.isLive ?? false;

  const total = items.reduce((a, i) => a + i.price, 0);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!email) {
      toast({ title: "Email required", description: "Enter your email or sign in to continue.", variant: "destructive" });
      return;
    }
    setLoading(true);

    try {
      // Always record in localStorage for reader unlock (static mode fallback)
      try {
        const owned = JSON.parse(localStorage.getItem("tk-owned-books") || "[]");
        for (const it of items) {
          if (it.type === "book" && !owned.includes(it.slug)) owned.push(it.slug);
        }
        localStorage.setItem("tk-owned-books", JSON.stringify(owned));
      } catch {}

      const gateway = gatewayInfo?.active || "mock";

      if (gateway === "sslcommerz") {
        // SSL Commerz: initiate → redirect to gateway
        const r = await fetch("/api/payments/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, method, customer: { name, email, phone } }),
        });
        const j = await r.json();
        if (j.redirectUrl) {
          window.location.href = j.redirectUrl;
          return; // page will redirect
        }
        throw new Error(j.error || "SSL Commerz initiation failed");
      } else if (gateway === "stripe") {
        // Stripe: create checkout session → redirect
        const r = await fetch("/api/payments/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, customer: { name, email } }),
        });
        const j = await r.json();
        if (j.redirectUrl) {
          window.location.href = j.redirectUrl;
          return;
        }
        throw new Error(j.error || "Stripe session creation failed");
      } else {
        // Mock / UddoktaPay fallback: simulate payment
        let txnId = `DEMO_${Date.now().toString(36).toUpperCase()}`;
        try {
          const r = await fetch("/api/orders/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, method, customer: { name, email } }),
          });
          const j = await r.json();
          if (r.ok && j.txnId) txnId = j.txnId;
        } catch {
          // Static mode — no server
        }

        toast({
          title: "Payment successful!",
          description: `${items.length} item${items.length > 1 ? "s" : ""} unlocked. Transaction: ${txnId}`,
        });
        try { await useAuth.getState().fetchUser(); } catch {}
        onSuccess();
        onClose();
        navigate("library");
      }
    } catch (err: any) {
      toast({ title: "Payment failed", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
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
            <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[85vh] overflow-y-auto thin-scrollbar p-7 sm:p-8">
              <h2 className="font-display text-2xl tracking-tight">Complete your purchase</h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Secure checkout via {activeGatewayName}
                {!isLive && <span className="ml-1 rounded-full bg-amber-500/10 px-2 py-0.5 text-[10px] font-medium text-amber-600">Demo mode</span>}
              </p>

              {/* Order summary */}
              <div className="mt-5 space-y-2 rounded-2xl border border-border/60 bg-muted/40 p-4">
                {items.map((it) => (
                  <div key={it.slug} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{it.title}</span>
                    <span className="font-medium">${it.price}</span>
                  </div>
                ))}
                <div className="mt-2 flex items-center justify-between border-t border-border pt-2">
                  <span className="font-display text-base">Total</span>
                  <span className="font-display text-xl">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Method picker */}
              <p className="mt-5 mb-2 text-xs font-medium text-muted-foreground">Payment method</p>
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {availableMethods.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center gap-1 rounded-xl border p-3 text-center transition-all",
                      method === m.id ? "border-foreground bg-foreground/5" : "border-border hover:border-foreground/40"
                    )}
                  >
                    <span className="h-6 w-6 rounded-full" style={{ background: m.color }} />
                    <span className="text-xs font-semibold">{m.label}</span>
                    <span className="text-[9px] text-muted-foreground">{m.desc}</span>
                  </button>
                ))}
              </div>

              {/* Customer form */}
              <form onSubmit={pay} className="mt-5 space-y-3">
                {!user && (
                  <div className="rounded-xl border border-clay/30 bg-clay/5 p-3 text-xs text-muted-foreground">
                    <button type="button" onClick={() => { onClose(); openAuthModal("login"); }} className="font-medium text-clay hover:underline">
                      Sign in
                    </button>{" "}
                    for faster checkout and to save your purchase to your library.
                  </div>
                )}
                <Input label="Full name" value={name} onChange={setName} placeholder="Your name" required />
                <Input label="Email" value={email} onChange={setEmail} placeholder="you@studio.com" type="email" required />
                {method !== "card" ? (
                  <Input label={`${ALL_METHODS.find((m) => m.id === method)?.label} account number`} value={phone} onChange={setPhone} placeholder="01XXXXXXXXX" required />
                ) : (
                  <Input label="Card number" value={cardNumber} onChange={(v) => setCardNumber(v.replace(/[^\d ]/g, ""))} placeholder="4242 4242 4242 4242" required />
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLive ? "Redirecting to payment…" : "Processing…"}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ${total.toFixed(2)} with {ALL_METHODS.find((m) => m.id === method)?.label}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  {isLive
                    ? `Secure payment via ${activeGatewayName} · Instant access · 30-day refund`
                    : "Demo mode — configure a payment gateway in .env for live payments"}
                </p>
              </form>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Input({ label, value, onChange, placeholder, type = "text", required }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; required?: boolean }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <input
        type={type}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full rounded-xl border border-border bg-background px-3.5 py-3 text-sm focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/30"
      />
    </label>
  );
}

// Helper hook to open the checkout from anywhere
export function useCheckout() {
  const [open, setOpen] = useState(false);
  const [items, setItems] = useState<CheckoutItem[]>([]);
  function startCheckout(items: CheckoutItem[]) {
    setItems(items);
    setOpen(true);
  }
  return { open, items, startCheckout, close: () => setOpen(false) };
}
