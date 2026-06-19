import type { NextConfig } from "next";

// Static export configuration — produces a pure HTML/CSS/JS site in the `out/` folder.
// Usage: rename this to next.config.ts, then run `bun run build`.
// The `out/` directory can be uploaded directly to Hostinger shared hosting (public_html).

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true, // required for static export (no server-side image optimization)
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Generate a trailing slash so folders work on static hosts (e.g. /books/ → /books/index.html)
  trailingSlash: true,
};

export default nextConfig;
