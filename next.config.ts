import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Disable source maps in production to reduce build output size
  productionBrowserSourceMaps: false,
  // Don't bundle these in API routes (resolve from node_modules at runtime). No full "puppeteer" on serverless.
  serverExternalPackages: ['@sparticuz/chromium', 'puppeteer-core'],
  // Include Chromium bin/brotli assets ONLY for report/PDF routes (not all routes)
  outputFileTracingIncludes: {
    '/api/reports/**': ['./node_modules/@sparticuz/chromium/**'],
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
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Removed 2048, 3840 (too large)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Lower quality for faster initial load
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
