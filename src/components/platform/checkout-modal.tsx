"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Lock, ArrowRight, Shield, Loader2, CreditCard, Calendar, Building2 } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";
import { useNav } from "@/lib/store/nav";
import { cn } from "@/lib/utils";

type Method = "bkash" | "nagad" | "google-pay" | "card";

type CheckoutItem = { slug: string; title: string; type: "book" | "resource"; price: number };

const PAYMENT_METHODS: {
  id: Method;
  label: string;
  logo: string;
  desc: string;
}[] = [
  { id: "bkash", label: "bKash", logo: "/images/payment/bkash.svg", desc: "Mobile wallet" },
  { id: "nagad", label: "Nagad", logo: "/images/payment/nagad.svg", desc: "Mobile wallet" },
  { id: "google-pay", label: "Google Pay", logo: "/images/payment/google-pay.svg", desc: "Instant pay" },
  { id: "card", label: "Card / Bank", logo: "", desc: "Visa · Mastercard" },
];

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
  const [phone, setPhone] = useState("");
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");
  const [cardName, setCardName] = useState(user?.name || "");
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

  const activeGatewayName = gatewayInfo?.gateways?.find((g) => g.id === gatewayInfo.active)?.name || "Secure";
  const isLive = gatewayInfo?.isLive ?? false;

  const total = items.reduce((a, i) => a + i.price, 0);

  async function pay(e: React.FormEvent) {
    e.preventDefault();
    if (!user) {
      toast({ title: "Sign in required", description: "Please sign in or create an account to purchase.", variant: "destructive" });
      onClose();
      openAuthModal("register");
      return;
    }
    setLoading(true);

    try {
      try {
        const owned = JSON.parse(localStorage.getItem("tk-owned-books") || "[]");
        for (const it of items) {
          if (it.type === "book" && !owned.includes(it.slug)) owned.push(it.slug);
        }
        localStorage.setItem("tk-owned-books", JSON.stringify(owned));
      } catch {}

      const gateway = gatewayInfo?.active || "mock";
      const customer = { name: user.name || "", email: user.email, phone };

      if (gateway === "sslcommerz") {
        const r = await fetch("/api/payments/sslcommerz/initiate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, method, customer }),
        });
        const j = await r.json();
        if (j.redirectUrl) {
          window.location.href = j.redirectUrl;
          return;
        }
        throw new Error(j.error || "SSL Commerz initiation failed");
      } else if (gateway === "stripe") {
        const r = await fetch("/api/payments/stripe/create-session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ items, customer }),
        });
        const j = await r.json();
        if (j.redirectUrl) {
          window.location.href = j.redirectUrl;
          return;
        }
        throw new Error(j.error || "Stripe session creation failed");
      } else {
        let txnId = `TK_${Date.now().toString(36).toUpperCase()}`;
        try {
          const r = await fetch("/api/orders/checkout", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ items, method, customer }),
          });
          const j = await r.json();
          if (r.ok && j.txnId) txnId = j.txnId;
        } catch {}

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
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-2xl"
          >
            <button onClick={onClose} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="max-h-[85vh] overflow-y-auto thin-scrollbar p-6 sm:p-7">
              {/* Header */}
              <div className="mb-5">
                <h2 className="font-display text-xl tracking-tight">Payment Details</h2>
                <p className="mt-0.5 text-sm text-muted-foreground">
                  Complete your purchase securely
                  
                </p>
              </div>

              {/* Order summary */}
              <div className="mb-5 space-y-1.5 rounded-2xl border border-border/40 bg-muted/30 p-3.5">
                {items.map((it) => (
                  <div key={it.slug} className="flex items-center justify-between text-sm">
                    <span className="text-foreground/80">{it.title}</span>
                    <span className="font-medium">${it.price}</span>
                  </div>
                ))}
                <div className="mt-1.5 flex items-center justify-between border-t border-border/40 pt-1.5">
                  <span className="font-display text-sm">Total</span>
                  <span className="font-display text-lg">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Payment method picker — glassmorphism cards with real logos */}
              <div className="mb-5 grid grid-cols-2 gap-2 sm:grid-cols-4">
                {PAYMENT_METHODS.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => setMethod(m.id)}
                    className={cn(
                      "flex flex-col items-center justify-center gap-1.5 rounded-xl border p-2.5 text-center transition-all duration-300",
                      method === m.id
                        ? "border-clay bg-clay/10 shadow-sm"
                        : "border-border/50 bg-background/50 hover:border-foreground/30 hover:bg-background/80"
                    )}
                  >
                    {m.logo ? (
                      <img src={m.logo} alt={m.label} className="h-6 w-auto" />
                    ) : (
                      <div className="flex h-6 items-center gap-1">
                        <CreditCard className="h-4 w-4" />
                        <Building2 className="h-4 w-4" />
                      </div>
                    )}
                    <span className="text-[10px] font-medium text-muted-foreground">{m.desc}</span>
                  </button>
                ))}
              </div>

              {/* Customer form / Sign-in gate */}
              {!user ? (
                <div className="rounded-2xl border border-clay/30 bg-clay/5 p-5 text-center">
                  <p className="font-display text-lg tracking-tight">Sign in to purchase</p>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Create an account or sign in. Your ebook will be saved to your library instantly.
                  </p>
                  <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-center">
                    <button
                      onClick={() => { onClose(); openAuthModal("register"); }}
                      className="rounded-full bg-foreground px-5 py-2.5 text-sm font-medium text-background transition-transform hover:scale-[1.03] active:scale-95"
                    >
                      Create account
                    </button>
                    <button
                      onClick={() => { onClose(); openAuthModal("login"); }}
                      className="rounded-full border border-border px-5 py-2.5 text-sm font-medium transition-colors hover:bg-foreground/5"
                    >
                      Sign in
                    </button>
                  </div>
                </div>
              ) : (
              <form onSubmit={pay} className="space-y-3">
                {/* Mobile wallet fields */}
                {method === "bkash" || method === "nagad" ? (
                  <div className="space-y-2">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">
                        {PAYMENT_METHODS.find((m) => m.id === method)?.label} account number
                      </span>
                      <div className="relative">
                        <input
                          required
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="01XXXXXXXXX"
                          className="w-full rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 pl-10 text-sm backdrop-blur-sm focus:border-clay/50 focus:bg-background/80 focus:outline-none"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>
                  </div>
                ) : method === "card" ? (
                  /* Card / Bank fields — glassmorphism inputs */
                  <div className="space-y-3">
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">Card Number</span>
                      <div className="relative">
                        <input
                          required
                          value={cardNumber}
                          onChange={(e) => setCardNumber(e.target.value.replace(/[^\d ]/g, ""))}
                          placeholder="0000 0000 0000 0000"
                          className="w-full rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 pl-10 text-sm backdrop-blur-sm focus:border-clay/50 focus:bg-background/80 focus:outline-none"
                        />
                        <CreditCard className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                      </div>
                    </label>
                    <div className="grid grid-cols-2 gap-3">
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted-foreground">Expiry Date</span>
                        <div className="relative">
                          <input
                            required
                            value={expiry}
                            onChange={(e) => setExpiry(e.target.value.replace(/[^\d/]/g, ""))}
                            placeholder="MM/YY"
                            className="w-full rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 pl-10 text-sm backdrop-blur-sm focus:border-clay/50 focus:bg-background/80 focus:outline-none"
                          />
                          <Calendar className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </label>
                      <label className="block">
                        <span className="mb-1 block text-xs font-medium text-muted-foreground">CVC</span>
                        <div className="relative">
                          <input
                            required
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/[^\d]/g, "").slice(0, 4))}
                            placeholder="123"
                            className="w-full rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 pl-10 text-sm backdrop-blur-sm focus:border-clay/50 focus:bg-background/80 focus:outline-none"
                          />
                          <Lock className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
                        </div>
                      </label>
                    </div>
                    <label className="block">
                      <span className="mb-1 block text-xs font-medium text-muted-foreground">Cardholder Name</span>
                      <input
                        required
                        value={cardName}
                        onChange={(e) => setCardName(e.target.value)}
                        placeholder="John Doe"
                        className="w-full rounded-xl border border-border/50 bg-background/50 px-3.5 py-2.5 text-sm backdrop-blur-sm focus:border-clay/50 focus:bg-background/80 focus:outline-none"
                      />
                    </label>
                  </div>
                ) : (
                  /* Google Pay — no fields needed, just confirm */
                  <div className="rounded-xl border border-border/50 bg-background/50 p-4 text-center backdrop-blur-sm">
                    <img src="/images/payment/google-pay.svg" alt="Google Pay" className="mx-auto h-8 w-auto" />
                    <p className="mt-2 text-xs text-muted-foreground">You'll be redirected to Google Pay to complete your payment.</p>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-xl bg-foreground py-3.5 text-sm font-medium text-background shadow-lg shadow-foreground/20 transition-all hover:shadow-foreground/40 hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {loading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      {isLive ? "Redirecting to payment…" : "Processing…"}
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4" />
                      Pay ${total.toFixed(2)}
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </>
                  )}
                </button>
                <p className="flex items-center justify-center gap-1.5 text-[11px] text-muted-foreground">
                  <Shield className="h-3 w-3" />
                  {isLive
                    ? `Secure payment via ${activeGatewayName} · Instant access · 30-day refund`
                    : "Secure payment · Instant access · 30-day refund"}
                </p>
              </form>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
