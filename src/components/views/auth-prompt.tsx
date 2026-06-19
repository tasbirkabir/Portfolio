"use client";

import { motion } from "motion/react";
import { Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store/auth";

export function AuthPrompt({ title, desc }: { title: string; desc: string }) {
  const openAuthModal = useAuth((s) => s.openAuthModal);
  return (
    <div className="mx-auto max-w-2xl px-5 py-24 text-center sm:py-32">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-2xl bg-clay/10 text-clay">
          <Sparkles className="h-6 w-6" />
        </div>
        <h1 className="font-display text-3xl tracking-tight sm:text-4xl">{title}</h1>
        <p className="mx-auto mt-3 max-w-md font-reader text-lg text-muted-foreground">{desc}</p>
        <div className="mt-7 flex justify-center gap-3">
          <button onClick={() => openAuthModal("login")} className="rounded-full bg-foreground px-6 py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.03]">Sign in</button>
          <button onClick={() => openAuthModal("register")} className="rounded-full border border-border px-6 py-3.5 text-sm font-medium transition-colors hover:bg-foreground/5">Create account</button>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">Demo: reader@demo.com / demo123</p>
      </motion.div>
    </div>
  );
}
