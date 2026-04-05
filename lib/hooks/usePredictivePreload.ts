/**
 * Predictive preload hooks for guided chapter navigation.
 * 
 * Implements production-safe n+1..n+3 page image lookahead and
 * next-section route/data/image prefetching with network awareness.
 * 
 * Goals:
 * - Faster page-to-page transitions within sections
 * - Faster section-to-section navigation
 * - Network-aware throttling (respect saveData and slow connections)
 * - Deduplication via central registry
 * - No breaking changes to navigation or progress logic
 */

'use client'

import { useRouter } from 'next/navigation'
import { useEffect, useRef, useMemo } from 'react'
import { tryPrefetch } from '@/lib/prefetch/clientPrefetchCache'
import { usePrefetchImage, usePrefetchImages } from '@/lib/hooks/usePrefetchImage'
import { useNetworkPrefetchPolicy } from '@/lib/hooks/useNetworkPrefetchPolicy'
import { perfLog } from '@/lib/performance/debug'

interface PageWithHeroImage {
  hero_image_url?: string | null
}

interface PageImagePreloadOptions {
  /** Explicitly enable/disable this preload system */
  enabled?: boolean
  /** Override network-based lookahead count */
  maxLookahead?: 1 | 2 | 3
}

/**
 * Preload hero images for upcoming pages (n+1, n+2, n+3).
 * 
 * Use this inside Reading, Framework, and Techniques clients to warm
 * images before the user clicks "Continue."
 * 
 * Behavior:
 * - Only preloads future pages (currentPage + 1 onwards)
 * - Respects network policy for lookahead count
 * - Deduplicates via global registry
 * - Safe on fast page flips (won't duplicate work)
 */
export function usePageImagePreload(
  currentPage: number,
  pages: PageWithHeroImage[],
  options?: PageImagePreloadOptions
) {
  const policy = useNetworkPrefetchPolicy()
  const enabled = options?.enabled !== false
  const maxLookahead = options?.maxLookahead ?? policy.pageImageLookahead

  // Build list of upcoming image URLs
  const upcomingImages = useMemo(() => {
    if (!enabled || currentPage < 0) return []

    const images: string[] = []
    const startIdx = currentPage + 1
    const endIdx = Math.min(startIdx + maxLookahead, pages.length)

    for (let i = startIdx; i < endIdx; i++) {
      const url = pages[i]?.hero_image_url
      if (url && typeof url === 'string' && url.trim()) {
        images.push(url.trim())
      }
    }

    return images
  }, [currentPage, pages, maxLookahead, enabled])

  // Preload upcoming images with low priority and deferred execution
  usePrefetchImages(upcomingImages, {
    priority: 'low',
    defer: policy.deferNonCritical,
    usePreload: false, // Skip <link> for secondary images
  })

  // Debug logging
  useEffect(() => {
    if (upcomingImages.length > 0) {
      perfLog.prefetch(`Page image lookahead (n+${maxLookahead}):`, upcomingImages)
    }
  }, [upcomingImages, maxLookahead])
}

interface NextSectionPrefetchInput {
  /** Current section type (read, self_check, framework, techniques, resolution) */
  currentSection: string
  /** Next section URL to prefetch */
  nextSectionUrl?: string | null
  /** Current chapter number */
  chapterNumber: number
  /** Current chapter slug */
  chapterSlug: string
  /** Next section first hero image URL */
  nextSectionHeroImage?: string | null
  /** Next section second image URL (optional) */
  nextSectionSecondImage?: string | null
  /** Explicitly enable/disable this preload system */
  enabled?: boolean
}

/**
 * Prefetch the next section in the guided flow.
 * 
 * Use this to warm:
 * - Next section route (router.prefetch)
 * - Next section hero image
 * - Optionally second image on fast networks
 * 
 * Respects network policy to avoid over-prefetching on weak connections.
 */
export function useNextSectionPrefetch(input: NextSectionPrefetchInput) {
  const {
    currentSection,
    nextSectionUrl,
    chapterNumber,
    chapterSlug,
    nextSectionHeroImage,
    nextSectionSecondImage,
    enabled = true,
  } = input

  const router = useRouter()
  const policy = useNetworkPrefetchPolicy()
  const prefetchedRef = useRef(new Set<string>())

  // Prefetch next section route
  useEffect(() => {
    if (!enabled || !policy.allowRoutePrefetch || !nextSectionUrl) return

    const key = `route:${nextSectionUrl}`
    if (prefetchedRef.current.has(key)) return

    tryPrefetch(key, () => {
      router.prefetch(nextSectionUrl)
      perfLog.prefetch(`Prefetched next section route (${currentSection} -> next):`, nextSectionUrl)
    })

    prefetchedRef.current.add(key)
  }, [enabled, policy.allowRoutePrefetch, nextSectionUrl, currentSection, router])

  // Prefetch next section metadata (optional data warmup)
  useEffect(() => {
    if (!enabled || !policy.allowRoutePrefetch) return
    if (!chapterNumber || !chapterSlug) return

    const key = `data:next-section:${chapterSlug}:${currentSection}`
    if (prefetchedRef.current.has(key)) return

    tryPrefetch(key, () => {
      // Warm the next-section API for future use
      fetch(`/api/guided-book/next-section?chapterNumber=${chapterNumber}&currentSection=${currentSection}`, {
        method: 'GET',
        priority: 'low',
      }).catch(() => {
        // Silently fail - this is speculative warmup
      })
      perfLog.prefetch(`Prefetched next section metadata for ${currentSection}`)
    })

    prefetchedRef.current.add(key)
  }, [enabled, policy.allowRoutePrefetch, chapterNumber, chapterSlug, currentSection])

  // Prefetch next section first hero image (high priority)
  usePrefetchImage(nextSectionHeroImage || null, {
    priority: 'high',
    defer: policy.deferNonCritical,
  })

  // Prefetch next section second image (only on fast networks)
  const shouldLoadSecondImage = policy.allowSecondSectionImage && nextSectionSecondImage
  usePrefetchImage(shouldLoadSecondImage ? nextSectionSecondImage : null, {
    priority: 'low',
    defer: true,
  })
}
