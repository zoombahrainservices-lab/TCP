import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle these in API routes (resolve from node_modules at runtime)
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core', 'puppeteer'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '*.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
