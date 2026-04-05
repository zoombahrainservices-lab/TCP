/**
 * Helper to build the exact URL that next/image will use.
 * 
 * Critical: Preload must use the SAME URL that next/image requests,
 * including width, quality, and format parameters.
 * 
 * Why this matters:
 * - Raw Supabase URL: https://xxx.supabase.co/.../image.webp
 * - Next/image URL: /_next/image?url=https://...&w=1080&q=75
 * 
 * If preload uses raw URL and next/image uses optimized URL,
 * browser sees them as different resources = wasted bandwidth!
 */

/**
 * Build the URL that next/image will request for a given source image.
 * 
 * @param src - Source image URL (from Supabase or local)
 * @param width - Desired width (should match next/image's selection)
 * @param quality - Image quality (default: 75, matches Next.js default)
 * @returns The actual URL that next/image will fetch
 */
export function buildNextImageUrl(
  src: string,
  width: number = 1080,
  quality: number = 75
): string {
  // For local images (starts with /), Next.js serves directly
  if (src.startsWith('/')) {
    return src
  }

  // For remote images, Next.js uses /_next/image endpoint
  const params = new URLSearchParams({
    url: src,
    w: width.toString(),
    q: quality.toString(),
  })

  return `/_next/image?${params.toString()}`
}

/**
 * Get the optimal width for preloading based on viewport.
 * Matches next/image's device size selection logic.
 * 
 * From next.config.ts:
 * deviceSizes: [640, 750, 828, 1080, 1200, 1920]
 */
export function getOptimalImageWidth(): number {
  if (typeof window === 'undefined') return 1080

  const viewportWidth = window.innerWidth
  const devicePixelRatio = window.devicePixelRatio || 1

  // Effective width considering device pixel ratio
  const effectiveWidth = viewportWidth * devicePixelRatio

  // Match Next.js device size selection
  // These are from next.config.ts deviceSizes
  const deviceSizes = [640, 750, 828, 1080, 1200, 1920]

  // Find the smallest size that's >= effective width
  for (const size of deviceSizes) {
    if (size >= effectiveWidth) {
      return size
    }
  }

  // If viewport is huge, use max size
  return 1920
}

/**
 * Build the exact preload URL for a hero image.
 * This should match what GuidedHeroImage renders.
 * 
 * @param src - Source image URL from database
 * @returns URL that matches next/image's request
 */
export function buildHeroImagePreloadUrl(src: string | null | undefined): string | null {
  if (!src || typeof src !== 'string' || !src.trim()) {
    return null
  }

  const cleanSrc = src.trim()
  const optimalWidth = getOptimalImageWidth()

  return buildNextImageUrl(cleanSrc, optimalWidth, 75)
}
