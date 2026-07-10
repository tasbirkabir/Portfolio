"use client";

import { create } from "zustand";
import { createClient } from "@/lib/supabase/browser";
import type { User } from "@supabase/supabase-js";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
  profileImage: string | null;
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  fetchUser: () => Promise<void>;
  signIn: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  signUp: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string; needsVerification?: boolean }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
  // Backwards-compatible aliases
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
};

export const useAuth = create<AuthState>((set) => ({
  user: null,
  loading: true,
  authModalOpen: false,
  authModalMode: "login",

  fetchUser: async () => {
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        set({ user: null, loading: false });
        return;
      }
      // Fetch profile from our API to get role/name
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const data = await res.json();
        set({ user: data.user, loading: false });
      } else {
        set({ user: null, loading: false });
      }
    } catch {
      set({ loading: false });
    }
  },

  signIn: async (email, password) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        return { ok: false, error: translateError(error.message) };
      }
      // Fetch profile
      const res = await fetch("/api/auth/me");
      if (res.ok) {
        const d = await res.json();
        set({ user: d.user, authModalOpen: false });
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: "Network error. Please try again." };
    }
  },

  signUp: async (name, email, password) => {
    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { name } },
      });
      if (error) {
        return { ok: false, error: translateError(error.message) };
      }
      // If email confirmation is required, data.user exists but no session
      if (data.user && !data.session) {
        return { ok: true, needsVerification: true };
      }
      // If no verification needed, session is created — fetch profile
      if (data.session) {
        const res = await fetch("/api/auth/me");
        if (res.ok) {
          const d = await res.json();
          set({ user: d.user, authModalOpen: false });
        }
      }
      return { ok: true };
    } catch (e: any) {
      return { ok: false, error: "Network error. Please try again." };
    }
  },

  signOut: async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
    } catch {}
    set({ user: null });
  },

  resetPassword: async (email) => {
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/callback?type=recovery`,
      });
      if (error) return { ok: false, error: translateError(error.message) };
      return { ok: true, message: "If an account exists, a reset link has been sent." };
    } catch {
      return { ok: false, error: "Network error. Please try again." };
    }
  },

  openAuthModal: (mode = "login") => set({ authModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
  // Aliases
  login: async (email, password) => {
    const store = useAuth.getState();
    return store.signIn(email, password);
  },
  register: async (name, email, password) => {
    const store = useAuth.getState();
    const res = await store.signUp(name, email, password);
    return { ok: res.ok, error: res.error };
  },
  logout: async () => {
    const store = useAuth.getState();
    return store.signOut();
  },
}));

/** Translate Supabase error messages to user-friendly text. */
function translateError(msg: string): string {
  const m = msg.toLowerCase();
  if (m.includes("invalid login credentials")) return "Invalid email or password.";
  if (m.includes("user already registered")) return "An account with this email already exists.";
  if (m.includes("password should be at least")) return "Password must be at least 6 characters.";
  if (m.includes("email not confirmed")) return "Please verify your email before signing in.";
  if (m.includes("rate limit")) return "Too many attempts. Please wait a minute and try again.";
  return "Something went wrong. Please try again.";
}
