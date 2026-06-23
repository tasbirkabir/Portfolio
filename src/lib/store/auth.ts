"use client";

import { create } from "zustand";

export type AuthUser = {
  id: string;
  email: string;
  name: string | null;
  role: "user" | "admin";
};

type AuthState = {
  user: AuthUser | null;
  loading: boolean;
  authModalOpen: boolean;
  authModalMode: "login" | "register";
  fetchUser: () => Promise<void>;
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string; twoFactorRequired?: boolean; pendingToken?: string }>;
  verify2fa: (pendingToken: string, code: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  confirmPasswordReset: (token: string, password: string) => Promise<{ ok: boolean; error?: string; message?: string }>;
  openAuthModal: (mode?: "login" | "register") => void;
  closeAuthModal: () => void;
};

export const useAuth = create<AuthState>((set, get) => ({
  user: null,
  loading: true,
  authModalOpen: false,
  authModalMode: "login",
  fetchUser: async () => {
    try {
      const r = await fetch("/api/auth/me");
      const j = await r.json();
      set({ user: j.user, loading: false });
    } catch {
      set({ loading: false });
    }
  },
  login: async (email, password) => {
    const r = await fetch("/api/auth/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j.error };
    if (j.twoFactorRequired) return { ok: false, twoFactorRequired: true, pendingToken: j.pendingToken };
    set({ user: j.user, authModalOpen: false });
    return { ok: true };
  },
  verify2fa: async (pendingToken, code) => {
    const r = await fetch("/api/auth/verify-2fa", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ pendingToken, code }),
    });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j.error };
    set({ user: j.user, authModalOpen: false });
    return { ok: true };
  },
  register: async (name, email, password) => {
    const r = await fetch("/api/auth/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });
    const j = await r.json();
    if (!r.ok) return { ok: false, error: j.error };
    set({ user: j.user, authModalOpen: false });
    return { ok: true };
  },
  logout: async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    set({ user: null });
  },
  requestPasswordReset: async (email: string) => {
    const r = await fetch("/api/auth/reset-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const j = await r.json();
    return { ok: r.ok, error: j.error, message: j.message };
  },
  confirmPasswordReset: async (token: string, password: string) => {
    const r = await fetch("/api/auth/reset-password/confirm", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, password }),
    });
    const j = await r.json();
    return { ok: r.ok, error: j.error, message: j.message };
  },
  openAuthModal: (mode = "login") => set({ authModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
