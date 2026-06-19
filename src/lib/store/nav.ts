"use client";

import { create } from "zustand";

export type View =
  | "home" | "about" | "books" | "book" | "resources" | "blog" | "post" | "contact"
  | "library" | "account" | "search" | "admin";

type NavState = {
  view: View;
  bookSlug: string | null;
  postSlug: string | null;
  readerBookSlug: string | null;
  pageKey: number;
  navigate: (view: View, opts?: { bookSlug?: string; postSlug?: string }) => void;
  openReader: (slug: string) => void;
  closeReader: () => void;
};

export const useNav = create<NavState>((set) => ({
  view: "home",
  bookSlug: null,
  postSlug: null,
  readerBookSlug: null,
  pageKey: 0,
  navigate: (view, opts) => {
    set((s) => ({
      view,
      bookSlug: opts?.bookSlug ?? (view === "book" ? s.bookSlug : null),
      postSlug: opts?.postSlug ?? (view === "post" ? s.postSlug : null),
      pageKey: s.pageKey + 1,
    }));
    if (typeof window !== "undefined") {
      window.scrollTo({ top: 0, behavior: "auto" });
    }
  },
  openReader: (slug) => set({ readerBookSlug: slug }),
  closeReader: () => set({ readerBookSlug: null }),
}));
