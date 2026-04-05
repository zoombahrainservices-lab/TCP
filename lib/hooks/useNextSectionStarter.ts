/**
 * Enhanced next section starter preload hook.
 * 
 * Preloads the "starter pack" for the next logical section in the chapter flow:
 * - Reading → Self-Check
 * - Self-Check → Framework
 * - Framework → Techniques
 * - Techniques → Resolution
 * - Resolution → Follow-Through
 * 
 * Starter pack includes:
 * - Route/code bundle (router.prefetch)
 * - First page data (API warmup)
 * - First hero image (high priority)
 * - Optional second image (only on fast networks)
 * 
 * Integrates with central registry and network budget.
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { preloadRegistry, makeRouteKey, makeImageKey, makeDataKey } from '@/lib/performance/preload-registry'
import { usePreloadBudget } from '@/lib/hooks/usePreloadBudget'
import { getSectionImageUrlPrimary } from '@/lib/chapterImages'

interface NextSectionStarterOptions {
  /** Current section type */
  currentSection: string
  /** Next section URL to prefetch */
  nextSectionUrl?: string | null
  /** Chapter number */
  chapterNumber: number
  /** Chapter slug */
  chapterSlug: string
  /** Next section first hero image */
  nextSectionHeroImage?: string | null
  /** Next section second image (optional) */
  nextSectionSecondImage?: string | null
  /** Whether to enable prefetch (default: true) */
  enabled?: boolean
}

/**
 * Preload the starter pack for the next section.
 * 
 * This runs when user is actively in a section, warming the next
 * section's entry point so the transition feels instant.
 */
export function useNextSectionStarter(options: NextSectionStarterOptions) {
  const {
    currentSection,
    nextSectionUrl,
    chapterNumber,
    chapterSlug,
    nextSectionHeroImage,
    nextSectionSecondImage,
    enabled = true,
  } = options

  const router = useRouter()
  const budget = usePreloadBudget()
  const preloadedSectionsRef = useRef(new Set<string>())

  useEffect(() => {
    if (!enabled || !budget.allowRoutePrefetch) return

    // Create unique key for this section transition
    const transitionKey = `${chapterSlug}:${currentSection}->next`
    
    // Skip if already preloaded this transition
    if (preloadedSectionsRef.current.has(transitionKey)) return
    preloadedSectionsRef.current.add(transitionKey)

    console.log(`[NextSectionStarter] Warming next section from ${currentSection}`)

    // 1. Prefetch next section route (critical priority)
    if (nextSectionUrl) {
      const routeKey = makeRouteKey(nextSectionUrl)
      preloadRegistry.enqueue(
        routeKey,
        () => router.prefetch(nextSectionUrl),
        'critical'
      )
    }

    // 2. Warm next section metadata API (high priority)
    if (chapterNumber && currentSection) {
      const dataKey = makeDataKey(`next-section:${chapterSlug}:${currentSection}`)
      preloadRegistry.enqueue(
        dataKey,
        () => {
          fetch(
            `/api/guided-book/next-section?chapterNumber=${chapterNumber}&currentSection=${currentSection}`,
            { method: 'GET', priority: 'high' as any }
          ).catch(() => {
            // Silent fail - this is speculative warmup
          })
        },
        'high'
      )
    }

    // 3. Preload first hero image (high priority)
    if (nextSectionHeroImage) {
      const imageKey = makeImageKey(nextSectionHeroImage)
      preloadRegistry.enqueue(
        imageKey,
        () => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            img.src = nextSectionHeroImage
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        },
        'high'
      )
    }

    // 4. Optionally preload second image (only on fast networks)
    if (budget.allowSecondaryImages && nextSectionSecondImage) {
      const imageKey = makeImageKey(nextSectionSecondImage)
      preloadRegistry.enqueue(
        imageKey,
        () => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            img.src = nextSectionSecondImage
            img.onload = () => resolve()
            img.onerror = () => resolve()
          })
        },
        'low'
      )
    }

    console.log(`[NextSectionStarter] Queued starter pack for next section`)
  }, [
    enabled,
    budget,
    currentSection,
    nextSectionUrl,
    chapterNumber,
    chapterSlug,
    nextSectionHeroImage,
    nextSectionSecondImage,
    router,
  ])

  // Cleanup when chapter changes
  useEffect(() => {
    return () => {
      preloadedSectionsRef.current.clear()
    }
  }, [chapterSlug])
}

/**
 * Get debug info about next section starter status
 */
export function useNextSectionStarterDebug(currentSection: string, nextSectionUrl?: string | null) {
  const budget = usePreloadBudget()
  
  return {
    enabled: budget.allowRoutePrefetch,
    currentSection,
    nextSectionUrl,
    willPreloadSecondImage: budget.allowSecondaryImages,
    profile: budget.profile,
  }
}
