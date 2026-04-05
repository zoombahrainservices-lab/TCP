/**
 * Active section rolling window preload hook.
 * 
 * Maintains a sliding preload window for the current active section.
 * When user is on page n, preloads pages n+1, n+2, n+3 (based on budget).
 * 
 * This is the enhanced version that integrates with:
 * - Central preload registry
 * - Network-aware budget
 * - Staggered queue management
 * 
 * Strongly applies to image-heavy sections:
 * - Reading
 * - Framework
 * - Techniques
 */

'use client'

import { useEffect, useMemo, useRef } from 'react'
import { preloadRegistry, makeImageKey, makePageKey } from '@/lib/performance/preload-registry'
import { usePreloadBudget } from '@/lib/hooks/usePreloadBudget'

interface PageWithImage {
  id?: string
  hero_image_url?: string | null
}

interface ActiveSectionWindowOptions {
  /** Current page index (0-based) */
  currentPage: number
  /** Array of pages in this section */
  pages: PageWithImage[]
  /** Chapter slug for dedup keys */
  chapterSlug: string
  /** Section slug for dedup keys */
  sectionSlug: string
  /** Whether to enable this preload (default: true) */
  enabled?: boolean
  /** Priority for preloaded images */
  priority?: 'critical' | 'high' | 'normal' | 'low'
}

/**
 * Preload images in a rolling window around the current page.
 * 
 * This hook intelligently manages the preload window:
 * - Only preloads future pages (n+1, n+2, n+3)
 * - Respects network budget (may only preload n+1 on slow connections)
 * - Uses central registry to avoid duplicate work
 * - Staggered loading via queue
 */
export function useActiveSectionWindow(options: ActiveSectionWindowOptions) {
  const {
    currentPage,
    pages,
    chapterSlug,
    sectionSlug,
    enabled = true,
    priority = 'normal',
  } = options

  const budget = usePreloadBudget()
  const lastPreloadedRef = useRef<Set<string>>(new Set())

  // Calculate which pages should be preloaded based on budget
  const targetPages = useMemo(() => {
    if (!enabled || currentPage < 0) return []

    const lookahead = budget.pageImageLookahead
    const targets: Array<{ index: number; page: PageWithImage; url: string }> = []

    for (let offset = 1; offset <= lookahead; offset++) {
      const targetIndex = currentPage + offset
      if (targetIndex >= pages.length) break // Stop at end of section

      const page = pages[targetIndex]
      const imageUrl = page?.hero_image_url

      if (imageUrl && typeof imageUrl === 'string' && imageUrl.trim()) {
        targets.push({
          index: targetIndex,
          page,
          url: imageUrl.trim(),
        })
      }
    }

    return targets
  }, [currentPage, pages, budget.pageImageLookahead, enabled])

  // Preload target pages
  useEffect(() => {
    if (targetPages.length === 0) return

    // Determine priority based on distance from current page
    const getPriorityForOffset = (offset: number): 'critical' | 'high' | 'normal' | 'low' => {
      if (priority === 'critical') return 'critical'
      if (offset === 1) return 'high' // n+1 is high priority
      if (offset === 2) return 'normal' // n+2 is normal
      return 'low' // n+3 is low priority
    }

    for (let i = 0; i < targetPages.length; i++) {
      const { index, page, url } = targetPages[i]
      const offset = index - currentPage

      // Create unique keys
      const imageKey = makeImageKey(url)
      const pageKey = makePageKey(chapterSlug, sectionSlug, index)

      // Skip if already preloaded in this window
      if (lastPreloadedRef.current.has(imageKey)) continue

      // Mark as preloaded for this window
      lastPreloadedRef.current.add(imageKey)

      // Enqueue image preload
      const imagePriority = getPriorityForOffset(offset)
      preloadRegistry.enqueue(
        imageKey,
        () => {
          return new Promise<void>((resolve) => {
            const img = new Image()
            img.src = url
            img.onload = () => resolve()
            img.onerror = () => resolve() // Don't block on errors
          })
        },
        imagePriority
      )

      console.log(`[ActiveSectionWindow] Queued page ${index} (${sectionSlug}, offset +${offset})`)
    }
  }, [targetPages, chapterSlug, sectionSlug, currentPage, priority])

  // Cleanup: clear tracking when section changes
  useEffect(() => {
    return () => {
      lastPreloadedRef.current.clear()
    }
  }, [chapterSlug, sectionSlug])
}

/**
 * Simpler variant that just returns the preload window info
 * without actually preloading (useful for testing/debugging)
 */
export function useActiveSectionWindowInfo(
  currentPage: number,
  totalPages: number,
  lookahead: 1 | 2 | 3
): { start: number; end: number; count: number } {
  return useMemo(() => {
    const start = Math.max(0, currentPage)
    const end = Math.min(totalPages - 1, currentPage + lookahead)
    const count = Math.max(0, end - start)

    return { start, end, count }
  }, [currentPage, totalPages, lookahead])
}
