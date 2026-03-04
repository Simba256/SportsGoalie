import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // Docker and production optimizations
  output: 'standalone',
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
