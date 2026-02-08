import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Don't bundle these in API routes (resolve from node_modules at runtime). No full "puppeteer" on serverless.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // Include Chromium bin/brotli assets in serverless bundle (fixes /var/task/.../chromium/bin missing). Next 16: top-level key.
  outputFileTracingIncludes: {
    '/*': ['./node_modules/@sparticuz/chromium/**'],
  },
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
