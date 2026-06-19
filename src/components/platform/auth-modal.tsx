"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ArrowRight, Sparkles } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const isLogin = authModalMode === "login";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = isLogin
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (!res.ok) {
      toast({ title: "Could not continue", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: isLogin ? "Welcome back." : "Account created.",
        description: isLogin ? undefined : "You're signed in.",
      });
      setName(""); setEmail(""); setPassword("");
    }
  }

  function fillDemo(role: "admin" | "user") {
    if (role === "admin") {
      setEmail("admin@tasbirkabir.site"); setPassword("admin123");
    } else {
      setEmail("reader@demo.com"); setPassword("demo123");
    }
  }

  return (
    <AnimatePresence>
      {authModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] flex items-center justify-center bg-black/40 backdrop-blur-md p-4"
          onClick={closeAuthModal}
        >
          <motion.div
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.96 }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
          >
            <button
              onClick={closeAuthModal}
              className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="p-7 sm:p-8">
              <div className="mb-6">
                <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                  <Sparkles className="h-5 w-5" />
                </div>
                <h2 className="font-display text-2xl tracking-tight">
                  {isLogin ? "Welcome back" : "Create your account"}
                </h2>
                <p className="mt-1 text-sm text-muted-foreground">
                  {isLogin
                    ? "Sign in to access your library, bookmarks and purchases."
                    : "Join to unlock free resources, save your reading progress and buy books."}
                </p>
              </div>

              <form onSubmit={submit} className="space-y-3">
                {!isLogin && (
                  <Field icon={User} label="Name">
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                  </Field>
                )}
                <Field icon={Mail} label="Email">
                  <input
                    required
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@studio.com"
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </Field>
                <Field icon={Lock} label="Password">
                  <input
                    required
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                </Field>

                <button
                  type="submit"
                  disabled={loading}
                  className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60"
                >
                  {loading ? "Please wait…" : isLogin ? "Sign in" : "Create account"}
                  {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                </button>
              </form>

              <p className="mt-5 text-center text-sm text-muted-foreground">
                {isLogin ? "New here? " : "Already have an account? "}
                <button
                  onClick={() => openAuthModal(isLogin ? "register" : "login")}
                  className="font-medium text-clay hover:underline"
                >
                  {isLogin ? "Create an account" : "Sign in"}
                </button>
              </p>

              <div className="mt-5 rounded-2xl border border-border/60 bg-muted/40 p-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
                  Demo accounts
                </p>
                <div className="flex gap-2">
                  <button
                    onClick={() => fillDemo("admin")}
                    className="flex-1 rounded-lg bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-foreground/5"
                  >
                    <p className="font-medium">Admin</p>
                    <p className="text-muted-foreground">admin@tasbirkabir.site</p>
                  </button>
                  <button
                    onClick={() => fillDemo("user")}
                    className="flex-1 rounded-lg bg-background px-3 py-2 text-left text-xs transition-colors hover:bg-foreground/5"
                  >
                    <p className="font-medium">Reader</p>
                    <p className="text-muted-foreground">reader@demo.com</p>
                  </button>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

function Field({ icon: Icon, label, children }: { icon: typeof Mail; label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted-foreground">{label}</span>
      <div className="flex items-center gap-2.5 rounded-xl border border-border bg-background px-3.5 py-3 focus-within:border-clay focus-within:ring-2 focus-within:ring-clay/30">
        <Icon className="h-4 w-4 shrink-0 text-muted-foreground" />
        {children}
      </div>
    </label>
  );
}
