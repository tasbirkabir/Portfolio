"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Mail, Lock, User, ArrowRight, Sparkles, Eye, EyeOff, Check } from "lucide-react";
import { useAuth } from "@/lib/store/auth";
import { useToast } from "@/hooks/use-toast";

export function AuthModal() {
  const { authModalOpen, authModalMode, closeAuthModal, login, register, openAuthModal } = useAuth();
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [loading, setLoading] = useState(false);

  const isLogin = authModalMode === "login";

  // Password strength indicator
  const passwordStrength = (() => {
    if (!password) return 0;
    let s = 0;
    if (password.length >= 8) s++;
    if (/[A-Z]/.test(password)) s++;
    if (/[0-9]/.test(password)) s++;
    if (/[^A-Za-z0-9]/.test(password)) s++;
    return s;
  })();
  const strengthLabels = ["", "Weak", "Fair", "Good", "Strong"];
  const strengthColors = ["", "#ef4444", "#f59e0b", "#3b82f6", "#10b981"];

  function validate(): string | null {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return "Please enter a valid email address.";
    }
    if (!isLogin) {
      if (!name.trim()) return "Please enter your name.";
      if (password.length < 8) return "Password must be at least 8 characters.";
      if (password !== confirmPassword) return "Passwords do not match.";
      if (!agreeTerms) return "Please agree to the terms to continue.";
    }
    if (!password) return "Please enter your password.";
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const err = validate();
    if (err) {
      toast({ title: "Check your details", description: err, variant: "destructive" });
      return;
    }
    setLoading(true);
    const res = isLogin
      ? await login(email, password)
      : await register(name, email, password);
    setLoading(false);
    if (!res.ok) {
      toast({ title: "Could not continue", description: res.error, variant: "destructive" });
    } else {
      toast({
        title: isLogin ? "Welcome back." : "Account created successfully.",
        description: isLogin ? undefined : "You're signed in.",
      });
      setName(""); setEmail(""); setPassword(""); setConfirmPassword(""); setAgreeTerms(false);
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
            <button
              onClick={closeAuthModal}
              className="absolute right-4 top-4 z-10 flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-foreground/5 hover:text-foreground"
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
                  <Field icon={User} label="Full name">
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
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={isLogin ? "••••••••" : "At least 8 characters"}
                    className="w-full bg-transparent text-sm focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-muted-foreground transition-colors hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </Field>

                {/* Password strength indicator (register only) */}
                {!isLogin && password && (
                  <div className="flex items-center gap-2 px-1">
                    <div className="flex h-1.5 flex-1 gap-1">
                      {[1, 2, 3, 4].map((i) => (
                        <div
                          key={i}
                          className="h-full flex-1 rounded-full transition-all"
                          style={{
                            background: i <= passwordStrength ? strengthColors[passwordStrength] : "var(--muted)",
                          }}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] font-medium" style={{ color: strengthColors[passwordStrength] }}>
                      {strengthLabels[passwordStrength]}
                    </span>
                  </div>
                )}

                {/* Confirm password (register only) */}
                {!isLogin && (
                  <Field icon={Lock} label="Confirm password">
                    <input
                      required
                      type={showPassword ? "text" : "password"}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      placeholder="Re-enter your password"
                      className="w-full bg-transparent text-sm focus:outline-none"
                    />
                    {confirmPassword && confirmPassword === password && (
                      <Check className="h-4 w-4 text-green-500" />
                    )}
                  </Field>
                )}

                {/* Terms checkbox (register only) */}
                {!isLogin && (
                  <label className="flex cursor-pointer items-start gap-2.5 py-1 text-xs text-muted-foreground">
                    <input
                      type="checkbox"
                      checked={agreeTerms}
                      onChange={(e) => setAgreeTerms(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-border"
                    />
                    <span>
                      I agree to the{" "}
                      <a href="#" className="font-medium text-clay hover:underline">Terms</a>{" "}
                      and{" "}
                      <a href="#" className="font-medium text-clay hover:underline">Privacy Policy</a>.
                    </span>
                  </label>
                )}

                {/* Forgot password (login only) */}
                {isLogin && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={async () => {
                        if (!email) {
                          toast({ title: "Enter your email", description: "Type your email above first, then tap forgot password.", variant: "destructive" });
                          return;
                        }
                        const res = await useAuth.getState().requestPasswordReset(email);
                        toast({
                          title: res.ok ? "Reset link sent" : "Could not send",
                          description: res.ok ? "If an account exists for that email, a reset link has been sent." : res.error,
                        });
                      }}
                      className="text-xs font-medium text-clay hover:underline"
                    >
                      Forgot password?
                    </button>
                  </div>
                )}

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
