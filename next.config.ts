import type { NextConfig } from "next";

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
  // Compress responses
  compress: true,
  // Powered-by header removed for security + minor perf
  poweredByHeader: false,
};

export default nextConfig;
