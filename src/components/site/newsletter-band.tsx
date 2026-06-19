"use client";

import { useState } from "react";
import { motion } from "motion/react";
import { ArrowRight, Check, Mail } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function NewsletterBand() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const { toast } = useToast();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    try {
      let ok = false;
      try {
        const r = await fetch("/api/newsletter", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email }),
        });
        ok = r.ok;
      } catch {
        // Static mode — no server. Store locally + fall back to mailto.
      }
      if (!ok) {
        // Record locally and open email client for confirmation in static mode.
        try {
          const subs = JSON.parse(localStorage.getItem("tk-newsletter") || "[]");
          if (!subs.includes(email)) subs.push(email);
          localStorage.setItem("tk-newsletter", JSON.stringify(subs));
        } catch {}
        window.location.href = `mailto:tasbirrkabir@gmail.com?subject=${encodeURIComponent("Newsletter subscribe")}&body=${encodeURIComponent(`Please add me to the newsletter: ${email}`)}`;
      }
      setDone(true);
      toast({ title: "You're in.", description: "Check your inbox for a welcome note." });
    } catch (err: any) {
      toast({ title: "Something went wrong", description: err.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="relative overflow-hidden rounded-3xl border border-border/60 bg-foreground p-8 text-background sm:p-14">
      <div className="pointer-events-none absolute -right-16 -top-16 h-64 w-64 rounded-full bg-clay/30 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-20 -left-10 h-56 w-56 rounded-full bg-white/5 blur-3xl" />
      <div className="relative grid items-center gap-8 md:grid-cols-2">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-background/20 px-3 py-1 text-xs">
            <Mail className="h-3 w-3" />
            The Builder's Letter
          </div>
          <h2 className="mt-4 font-display text-3xl leading-tight tracking-tight sm:text-4xl text-balance">
            One framework. Every Sunday.
          </h2>
          <p className="mt-3 max-w-md text-sm text-background/70">
            Join 12,400+ builders getting one practical framework for building, tracking, advertising and converting —
            every Sunday morning. No fluff. Unsubscribe anytime.
          </p>
        </div>

        <div>
          {done ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="flex items-center gap-3 rounded-2xl border border-background/20 bg-background/5 p-5"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-full bg-clay text-foreground">
                <Check className="h-5 w-5" />
              </span>
              <div>
                <p className="font-medium">You're on the list.</p>
                <p className="text-sm text-background/60">Your first framework lands this Sunday.</p>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={submit} className="flex flex-col gap-3 sm:flex-row">
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@studio.com"
                className="flex-1 rounded-full border border-background/20 bg-background/5 px-5 py-3.5 text-sm text-background placeholder:text-background/40 focus:border-clay focus:outline-none focus:ring-2 focus:ring-clay/40"
              />
              <button
                type="submit"
                disabled={loading}
                className="group inline-flex items-center justify-center gap-2 rounded-full bg-background px-6 py-3.5 text-sm font-medium text-foreground transition-transform hover:scale-[1.03] active:scale-95 disabled:opacity-60"
              >
                {loading ? "Joining…" : "Subscribe"}
                {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
              </button>
            </form>
          )}
          <p className="mt-3 text-xs text-background/40">Free forever. One email a week. No spam.</p>
        </div>
      </div>
    </div>
  );
}
