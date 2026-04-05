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
    // Optimize images for production performance
    // REMOVED: AVIF (slower to encode, adds 200-500ms latency on cold cache)
    // KEPT: WebP (faster to encode, good compression, wide browser support)
    formats: ['image/webp'],
    minimumCacheTTL: 31536000, // Cache for 1 year
    deviceSizes: [640, 750, 828, 1080, 1200, 1920], // Removed 2048, 3840 (too large)
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Quality 80 is sweet spot (vs 75 default): better quality, minimal size increase
    dangerouslyAllowSVG: false,
    contentDispositionType: 'inline',
    unoptimized: false, // Ensure optimization is enabled
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
};

export default nextConfig;
