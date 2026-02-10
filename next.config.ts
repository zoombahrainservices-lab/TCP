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
    // Allow local images from public: root (e.g. /TCP-logo.png) and /slider-work-on-quizz (e.g. ?v=2)
    localPatterns: [
      {
        pathname: '/**',
      },
    ],
    // Optimize images aggressively
    formats: ['image/avif', 'image/webp'],
    minimumCacheTTL: 31536000, // Cache for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
