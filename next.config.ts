import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  poweredByHeader: false,
  compress: true,
  typescript: {
    ignoreBuildErrors: true,
  },
  reactStrictMode: false,
  // Optimize package bundling for smaller initial JS
  experimental: {
    optimizePackageImports: ["lucide-react", "motion", "framer-motion"],
  },
};

export default nextConfig;
