"use client";

import { useEffect, useState } from "react";

// Maps API URLs to static JSON file paths for static-export mode.
const STATIC_MAP: Record<string, string> = {
  "/api/books": "/data/books.json",
  "/api/books?featured=1": "/data/books.json", // filtered client-side
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

function isStaticHost(): boolean {
  if (typeof window === "undefined") return false;
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") return false;
  return true;
}

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

// Unified data fetcher: uses /api/* in dev, /data/*.json on a static host.
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
    const staticUrl = isStaticHost() ? toStatic(url) : null;
    const fetchUrl = staticUrl || url;

    // For static books?featured=1, we filter client-side after fetching books.json
    const isFeaturedBooks = url === "/api/books?featured=1";

    setLoading(true);
    setError(null);
    fetch(fetchUrl)
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
      .catch((e) => {
        if (!active) return;
        setError(e.message || "Something went wrong");
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [url, nonce]);

  return { data, loading, error, refetch: () => setNonce((n) => n + 1) };
}
