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
  login: (email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  register: (name: string, email: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => Promise<void>;
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
  openAuthModal: (mode = "login") => set({ authModalOpen: true, authModalMode: mode }),
  closeAuthModal: () => set({ authModalOpen: false }),
}));
