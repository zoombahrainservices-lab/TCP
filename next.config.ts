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
    // Include Chromium bin/brotli assets in report API serverless bundle (fixes /var/task/.../chromium/bin missing)
    outputFileTracingIncludes: {
      '/api/reports/**': ['./node_modules/@sparticuz/chromium/**'],
    },
  },
};

export default nextConfig;
