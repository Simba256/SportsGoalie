import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
  // Docker and production optimizations
  output: 'standalone',
  // Turbopack configuration (Next.js 16 default)
  turbopack: {},
};

export default nextConfig;
