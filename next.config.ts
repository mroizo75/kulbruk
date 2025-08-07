import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    domains: ['localhost', '127.0.0.1'],
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
