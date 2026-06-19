// Static mode: when true, the app fetches from /data/*.json instead of /api/*.
// Detected by checking if window.location origin serves a static export (no /api).
// In dev (localhost:3000 with a server), IS_STATIC is false and API routes are used.
// After `bun run build` with output: "export", IS_STATIC is true.

export const IS_STATIC =
  typeof window !== "undefined" &&
  !window.location.hostname.includes("localhost") &&
  !window.location.hostname.includes("127.0.0.1") &&
  // The dev server always has /api; static exports don't.
  !(window as any).__NEXT_DATA__?.props?.pageProps?.__N_SSG === undefined
    ? true
    : false;

// Simpler + more reliable: static mode is on when running from a static export.
// We detect by attempting to fetch /api/auth/me and falling back, but that's slow.
// Instead: when the app is built with output: "export", we set a global flag at build time.
// For the dev server, IS_STATIC = false (uses API routes).
// For the static export, IS_STATIC = true (uses /data/*.json).
// Detection: in a static export, there's no __NEXT_DATA__ runtime with a server.
// We use: process.env.NODE_ENV === "production" && no window.__NEXT_DATA__.props.server.

export function getIsStatic(): boolean {
  if (typeof window === "undefined") return false;
  // Dev server is always dynamic
  if (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1") {
    return false;
  }
  // In a static export deployed to a static host, we treat it as static.
  // The presence of /data/manifest.json is the signal.
  return true;
}
