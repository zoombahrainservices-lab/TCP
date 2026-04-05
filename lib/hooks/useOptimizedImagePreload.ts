/**
 * OPTIMIZED Rolling Image Preload Hook
 * 
 * Purpose: Fast, focused image preloading for image-heavy sections.
 * Replaces the complex multi-hook system with one simple, effective hook.
 * 
 * Key improvements:
 * 1. Preloads EXACT URLs that next/image will use (no mismatch!)
 * 2. n+1 loads IMMEDIATELY (no queue, no delay)
 * 3. n+2, n+3 load with smart delays (100ms, 200ms)
 * 4. Cancels stale work when page changes
 * 5. Network-aware (respects Save-Data, slow connections)
 * 6. No duplicate work (single source of truth)
 * 
 * Usage:
 * ```typescript
 * useOptimizedImagePreload({
 *   currentPage: 5,
 *   pages: pagesArray,
 *   sectionType: 'read', // or 'framework' or 'techniques'
 *   enabled: true,
 * })
 * ```
 */

'use client'

import { useEffect, useRef, useMemo, useCallback } from 'react'
import { buildHeroImagePreloadUrl } from '@/lib/image/next-image-url'

interface PageWithImage {
  id?: string
  hero_image_url?: string | null
}

interface OptimizedImagePreloadOptions {
  /** Current page index (0-based) */
  currentPage: number
  /** Array of pages in section */
  pages: PageWithImage[]
  /** Section type (for logging) */
  sectionType: 'read' | 'framework' | 'techniques' | string
  /** Enable/disable preload */
  enabled?: boolean
}

interface PreloadTask {
  url: string
  pageIndex: number
  priority: 'immediate' | 'high' | 'normal'
  delayMs: number
}

/**
 * Check if user is on slow connection or has Save-Data enabled
 */
function useNetworkBudget(): { lookahead: 1 | 2 | 3 } {
  if (typeof window === 'undefined') return { lookahead: 3 }

  const nav = window.navigator as Navigator & {
    connection?: {
      saveData?: boolean
      effectiveType?: string
    }
  }

  const conn = nav.connection

  // Respect Save-Data
  if (conn?.saveData === true) {
    return { lookahead: 1 }
  }

  // Slow connections: only n+1
  if (conn?.effectiveType === 'slow-2g' || conn?.effectiveType === '2g') {
    return { lookahead: 1 }
  }

  // 3G: n+1, n+2
  if (conn?.effectiveType === '3g') {
    return { lookahead: 2 }
  }

  // 4G/WiFi: n+1, n+2, n+3
  return { lookahead: 3 }
}

/**
 * Optimized rolling image preload hook.
 * 
 * Strategy:
 * - n+1: Immediate preload (0ms delay)
 * - n+2: Delayed preload (100ms delay)
 * - n+3: Delayed preload (200ms delay)
 * - Cancels all pending preloads when page changes
 * - Uses exact next/image URLs
 */
export function useOptimizedImagePreload(options: OptimizedImagePreloadOptions) {
  const {
    currentPage,
    pages,
    sectionType,
    enabled = true,
  } = options

  const budget = useNetworkBudget()
  const preloadedRef = useRef(new Set<string>())
  const timeoutsRef = useRef<NodeJS.Timeout[]>([])
  const abortControllersRef = useRef<Map<string, AbortController>>(new Map())

  // Calculate preload tasks (n+1, n+2, n+3)
  const preloadTasks = useMemo<PreloadTask[]>(() => {
    if (!enabled || currentPage < 0) return []

    const tasks: PreloadTask[] = []
    const lookahead = budget.lookahead

    for (let offset = 1; offset <= lookahead; offset++) {
      const targetIndex = currentPage + offset
      if (targetIndex >= pages.length) break

      const page = pages[targetIndex]
      const rawUrl = page?.hero_image_url

      if (!rawUrl) continue

      // Build the EXACT URL that next/image will use
      const optimizedUrl = buildHeroImagePreloadUrl(rawUrl)
      if (!optimizedUrl) continue

      tasks.push({
        url: optimizedUrl,
        pageIndex: targetIndex,
        priority: offset === 1 ? 'immediate' : offset === 2 ? 'high' : 'normal',
        delayMs: offset === 1 ? 0 : offset === 2 ? 100 : 200,
      })
    }

    return tasks
  }, [currentPage, pages, budget.lookahead, enabled])

  // Preload function with fetch + cache
  const preloadImage = useCallback((url: string, signal: AbortSignal): Promise<void> => {
    return new Promise((resolve, reject) => {
      // Use fetch for better control and cache behavior
      fetch(url, {
        signal,
        mode: 'no-cors', // Allow cross-origin (Supabase images)
        cache: 'force-cache', // Ensure it goes to cache
        priority: 'low' as any, // Don't compete with visible content
      })
        .then(() => {
          // Also warm up Image() for belt-and-suspenders
          const img = new Image()
          img.decoding = 'async'
          img.src = url
          img.onload = () => resolve()
          img.onerror = () => resolve() // Don't fail on error
        })
        .catch((error) => {
          if (error.name === 'AbortError') {
            // Cancelled, that's fine
            resolve()
          } else {
            // Other error, don't block
            resolve()
          }
        })
    })
  }, [])

  // Main preload effect
  useEffect(() => {
    if (preloadTasks.length === 0) return

    // Cancel all pending preloads from previous page
    timeoutsRef.current.forEach(clearTimeout)
    timeoutsRef.current = []

    abortControllersRef.current.forEach((controller) => controller.abort())
    abortControllersRef.current.clear()

    console.log(`[OptimizedImagePreload] Page ${currentPage} (${sectionType}): Preloading ${preloadTasks.length} images`)

    // Execute preload tasks with delays
    preloadTasks.forEach((task) => {
      // Skip if already preloaded (global dedup)
      if (preloadedRef.current.has(task.url)) {
        console.log(`  ↳ Page ${task.pageIndex}: Already preloaded (cached)`)
        return
      }

      // Schedule preload with appropriate delay
      const timeout = setTimeout(() => {
        // Create abort controller for this preload
        const controller = new AbortController()
        abortControllersRef.current.set(task.url, controller)

        console.log(`  ↳ Page ${task.pageIndex}: Starting preload (${task.priority}, +${task.delayMs}ms)`)

        preloadImage(task.url, controller.signal)
          .then(() => {
            preloadedRef.current.add(task.url)
            abortControllersRef.current.delete(task.url)
            console.log(`  ✓ Page ${task.pageIndex}: Preload complete`)
          })
          .catch(() => {
            abortControllersRef.current.delete(task.url)
          })
      }, task.delayMs)

      timeoutsRef.current.push(timeout)
    })

    // Cleanup on unmount or when currentPage changes
    return () => {
      timeoutsRef.current.forEach(clearTimeout)
      timeoutsRef.current = []

      abortControllersRef.current.forEach((controller) => controller.abort())
      abortControllersRef.current.clear()
    }
  }, [preloadTasks, currentPage, sectionType, preloadImage])

  // Clear preloaded set when section changes (detected by pages reference change)
  useEffect(() => {
    preloadedRef.current.clear()
  }, [pages])
}

/**
 * Simpler variant for debugging: just returns what would be preloaded
 */
export function useOptimizedImagePreloadDebug(
  currentPage: number,
  pages: PageWithImage[],
  lookahead: 1 | 2 | 3 = 3
): { pages: number[]; urls: string[] } {
  return useMemo(() => {
    if (currentPage < 0) return { pages: [], urls: [] }

    const pageIndices: number[] = []
    const urls: string[] = []

    for (let offset = 1; offset <= lookahead; offset++) {
      const targetIndex = currentPage + offset
      if (targetIndex >= pages.length) break

      const page = pages[targetIndex]
      const rawUrl = page?.hero_image_url

      if (!rawUrl) continue

      const optimizedUrl = buildHeroImagePreloadUrl(rawUrl)
      if (!optimizedUrl) continue

      pageIndices.push(targetIndex)
      urls.push(optimizedUrl)
    }

    return { pages: pageIndices, urls }
  }, [currentPage, pages, lookahead])
}
