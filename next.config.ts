import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  turbopack: {},

  // Ensure the docs folder is bundled with the chat API route on Vercel
  outputFileTracingIncludes: {
    '/api/admin/chat': ['./docs/**/*'],
  },

  // Prevent config/source files from accidentally entering serverless bundles.
  // The NFT tracer follows fs.readdir() with process.cwd() and drags in project-root
  // files (next.config.ts etc.) that have no business being in a Lambda bundle.
  outputFileTracingExcludes: {
    '*': [
      './next.config.ts',
      './next.config.js',
      './tsconfig.json',
      './tailwind.config.*',
      './postcss.config.*',
      './.eslintrc*',
      './.prettierrc*',
      './CLAUDE.md',
      './PROGRESS.md',
      './README.md',
    ],
  },
};

export default nextConfig;
