"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, Check, ShieldCheck } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, signIn, signUp, resetPassword, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showVerificationNotice, setShowVerificationNotice] = useState(false);
  const [resetMode, setResetMode] = useState(false);

  const isLogin = authModalMode === "login";

  function resetFields() {
    setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); setAgreeTerms(false);
    setShowVerificationNotice(false); setResetMode(false);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (resetMode) {
      if (!email) { toast({ title: "Enter your email", variant: "destructive" }); return; }
      setLoading(true);
      const res = await resetPassword(email);
      setLoading(false);
      toast({ title: res.ok ? "Reset link sent" : "Could not send", description: res.ok ? res.message : res.error, variant: res.ok ? "default" : "destructive" });
      if (res.ok) { setResetMode(false); }
      return;
    }

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: "Invalid email", description: "Please enter a valid email address.", variant: "destructive" });
      return;
    }
    if (!isLogin) {
      if (!name.trim()) { toast({ title: "Name required", variant: "destructive" }); return; }
      if (password.length < 6) { toast({ title: "Password too short", description: "At least 6 characters.", variant: "destructive" }); return; }
      if (password !== confirmPassword) { toast({ title: "Passwords don't match", variant: "destructive" }); return; }
      if (!agreeTerms) { toast({ title: "Please accept the terms", variant: "destructive" }); return; }
    }
    if (!password) { toast({ title: "Password required", variant: "destructive" }); return; }

    setLoading(true);
    const res = isLogin ? await signIn(email, password) : await signUp(name, email, password);
    setLoading(false);

    if (!res.ok) {
      toast({ title: "Could not continue", description: res.error, variant: "destructive" });
    } else if (!isLogin && (res as any).needsVerification) {
      setShowVerificationNotice(true);
    } else {
      toast({ title: isLogin ? "Welcome back." : "Account created." });
      resetFields();
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
            className="relative max-h-[90vh] w-full max-w-md overflow-y-auto thin-scrollbar rounded-3xl border border-border bg-card shadow-2xl"
          >
            <button onClick={closeAuthModal} className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground">
              <X className="h-4 w-4" />
            </button>

            <div className="p-7 sm:p-8">
              {showVerificationNotice ? (
                <div className="text-center">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <h2 className="font-display text-2xl tracking-tight">Check your email</h2>
                  <p className="mt-2 text-sm text-muted-foreground">
                    We sent a verification link to <strong>{email}</strong>. Click the link to activate your account, then sign in.
                  </p>
                  <button onClick={() => { setShowVerificationNotice(false); openAuthModal("login"); }} className="mt-5 w-full rounded-full bg-foreground py-3 text-sm font-medium text-background">
                    Back to sign in
                  </button>
                </div>
              ) : (
                <div>
                  <div className="mb-6">
                    <div className="mb-3 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-clay/10 text-clay">
                      <Sparkles className="h-5 w-5" />
                    </div>
                    <h2 className="font-display text-2xl tracking-tight">
                      {resetMode ? "Reset password" : isLogin ? "Welcome back" : "Create your account"}
                    </h2>
                    <p className="mt-1 text-sm text-muted-foreground">
                      {resetMode ? "Enter your email and we'll send a reset link." : isLogin ? "Sign in to access your library, bookmarks and purchases." : "Join to unlock free resources, save your reading progress and buy books."}
                    </p>
                  </div>

                  <form onSubmit={submit} className="space-y-3">
                    {!isLogin && !resetMode && (
                      <Field icon={User} label="Full name">
                        <input required value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" className="w-full bg-transparent text-sm focus:outline-none" />
                      </Field>
                    )}
                    <Field icon={Mail} label="Email">
                      <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@studio.com" className="w-full bg-transparent text-sm focus:outline-none" />
                    </Field>
                    {!resetMode && (
                      <Field icon={Lock} label="Password">
                        <input required type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={isLogin ? "••••••••" : "At least 6 characters"} className="w-full bg-transparent text-sm focus:outline-none" />
                        <button type="button" onClick={() => setShowPassword((s) => !s)} className="text-muted-foreground hover:text-foreground">
                          {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      </Field>
                    )}
                    {!isLogin && !resetMode && (
                      <Field icon={Lock} label="Confirm password">
                        <input required type={showPassword ? "text" : "password"} value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="Re-enter your password" className="w-full bg-transparent text-sm focus:outline-none" />
                        {confirmPassword && confirmPassword === password && <Check className="h-4 w-4 text-green-500" />}
                      </Field>
                    )}
                    {!isLogin && !resetMode && (
                      <label className="flex cursor-pointer items-start gap-2.5 py-1 text-xs text-muted-foreground">
                        <input type="checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} className="mt-0.5 h-4 w-4 rounded border-border" />
                        <span>I agree to the <a href="#" className="font-medium text-clay hover:underline">Terms</a> and <a href="#" className="font-medium text-clay hover:underline">Privacy Policy</a>.</span>
                      </label>
                    )}
                    {isLogin && !resetMode && (
                      <div className="flex justify-end">
                        <button type="button" onClick={() => setResetMode(true)} className="text-xs font-medium text-clay hover:underline">Forgot password?</button>
                      </div>
                    )}
                    {resetMode && (
                      <button type="button" onClick={() => setResetMode(false)} className="text-xs font-medium text-muted-foreground hover:text-foreground">← Back to sign in</button>
                    )}
                    <button type="submit" disabled={loading} className="group mt-2 flex w-full items-center justify-center gap-2 rounded-full bg-foreground py-3.5 text-sm font-medium text-background transition-transform hover:scale-[1.02] active:scale-95 disabled:opacity-60">
                      {loading ? "Please wait…" : resetMode ? "Send reset link" : isLogin ? "Sign in" : "Create account"}
                      {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
                    </button>
                  </form>

                  {!resetMode && (
                    <p className="mt-5 text-center text-sm text-muted-foreground">
                      {isLogin ? "New here? " : "Already have an account? "}
                      <button onClick={() => { openAuthModal(isLogin ? "register" : "login"); resetFields(); }} className="font-medium text-clay hover:underline">
                        {isLogin ? "Create an account" : "Sign in"}
                      </button>
                    </p>
                  )}
                </div>
              )}
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
