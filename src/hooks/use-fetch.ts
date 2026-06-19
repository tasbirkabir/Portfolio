"use client";

import { useEffect, useState } from "react";

type State<T> = {
  data: T | null;
  loading: boolean;
  error: string | null;
};

export function useFetch<T>(url: string | null): State<T> & { refetch: () => void } {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(!!url);
  const [error, setError] = useState<string | null>(null);
  const [nonce, setNonce] = useState(0);

  useEffect(() => {
    if (!url) {
      return;
    }
    let active = true;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    fetch(url, { signal: controller.signal })
      .then(async (r) => {
        if (!r.ok) throw new Error(`Request failed (${r.status})`);
        return r.json();
      })
      .then((json) => {
        if (active) {
          setData(json);
          setLoading(false);
        }
      })
      .catch((e) => {
        if (active && e.name !== "AbortError") {
          setError(e.message || "Something went wrong");
          setLoading(false);
        }
      });
    return () => {
      active = false;
      controller.abort();
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
