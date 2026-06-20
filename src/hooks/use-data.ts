"use client";

import { useEffect, useState } from "react";

// Maps API URLs to static JSON file paths for static-export mode.
const STATIC_MAP: Record<string, string> = {
  "/api/books": "/data/books.json",
  "/api/books?featured=1": "/data/books.json",
  "/api/resources": "/data/resources.json",
  "/api/blog": "/data/blog.json",
  "/api/testimonials": "/data/testimonials.json",
  "/api/settings": "/data/settings.json",
};

function toStatic(url: string): string | null {
  if (url.startsWith("/api/books/")) {
    const slug = url.replace("/api/books/", "");
    return `/data/book-${slug}.json`;
  }
  if (url.startsWith("/api/blog/")) {
    const slug = url.replace("/api/blog/", "");
    return `/data/post-${slug}.json`;
  }
  return STATIC_MAP[url] || null;
}

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

/**
 * Unified data fetcher.
 * Always tries the API first (/api/*). If the API fails (e.g. on a static host
 * with no server), falls back to the static JSON file (/data/*.json).
 */
export function useData<T>(url: string | null): State<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
      return;
    }
    let active = true;
    const staticUrl = toStatic(url);
    const isFeaturedBooks = url === "/api/books?featured=1";

    setLoading(true);
    setError(null);

    // Try the API first
    fetch(url)
      .then(async (r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((json) => {
        if (!active) return;
        if (isFeaturedBooks && json.books) {
          setData({ books: json.books.filter((b: any) => b.featured) } as T);
        } else {
          setData(json as T);
        }
        setLoading(false);
      })
      .catch(async () => {
        // API failed — try static JSON fallback
        if (!staticUrl || !active) {
          if (active) {
            setError("Failed to load data");
            setLoading(false);
          }
          return;
        }
        try {
          const r2 = await fetch(staticUrl);
          if (!r2.ok) throw new Error("Static fetch failed");
          const json2 = await r2.json();
          if (!active) return;
          if (isFeaturedBooks && json2.books) {
            setData({ books: json2.books.filter((b: any) => b.featured) } as T);
          } else {
            setData(json2 as T);
          }
          setLoading(false);
        } catch {
          if (active) {
            setError("Failed to load data");
            setLoading(false);
          }
        }
      });

    return () => {
      active = false;
    };
  }, [url, nonce]);

  // Clear data when url becomes null
  useEffect(() => {
    if (!url) {
      setData(null);
      setLoading(false);
    }
  }, [url]);

  return { data, loading, error, refetch: () => setNonce((n) => n + 1) };
}
