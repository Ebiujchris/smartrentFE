import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    optimizePackageImports: ['@base-ui/react'],
  },
};

export default nextConfig;
