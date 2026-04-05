/**
 * Unified guided-flow preload layer.
 * 
 * Orchestrates three concerns in one system:
 * 1. Route prefetch (Next.js router)
 * 2. Next-step data warmup (in-memory cache)
 * 3. Next-step/page image warmup
 * 
 * Keeps preloading narrow and auth-safe:
 * - Only warms the most likely next step in TCP flow
 * - Only warms next page (n+1) inside Reading/Framework/Techniques
 * - Does not prefetch protected data before auth is ready
 */

'use client'

import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useRef } from 'react'
import { tryPrefetch } from '@/lib/prefetch/clientPrefetchCache'
import { usePrefetchImage } from '@/lib/hooks/usePrefetchImage'
import { getChapterSlug, getFollowThroughUrl } from '@/lib/guided-book/navigation'
import { perfLog } from '@/lib/performance/debug'

export interface GuidedFlowPrefetchConfig {
  /** Current chapter number */
  chapterNumber: number
  /** Current chapter slug (e.g., "stage-star-silent-struggles") */
  chapterSlug: string
  /** Current step slug (read, self_check, framework, techniques, resolution, follow_through) */
  currentStepSlug?: string | null
  /** Next step slug to prefetch */
  nextStepSlug?: string | null
  /** Next step hero image to prefetch */
  nextStepHeroImage?: string | null
  /** Current page index (for paginated sections) */
  currentPageIndex?: number
  /** Total pages in current step */
  totalPages?: number
  /** Next page hero image to prefetch (for n+1 preloading) */
  nextPageHeroImage?: string | null
  /** Whether to also prefetch dashboard (for completion flows) */
  prefetchDashboard?: boolean
}

/**
 * Main hook for guided-flow preloading.
 * Call this in Reading, Self-Check, Framework, Techniques, and Resolution clients.
 */
export function useGuidedFlowPreload(config: GuidedFlowPrefetchConfig) {
  const router = useRouter()
  const {
    chapterNumber,
    chapterSlug,
    currentStepSlug,
    nextStepSlug,
    nextStepHeroImage,
    currentPageIndex,
    totalPages,
    nextPageHeroImage,
    prefetchDashboard = false,
  } = config

  // Track what we've already prefetched this render cycle
  const prefetchedRef = useRef(new Set<string>())

  // Helper to build next step URL
  const getNextStepUrl = useCallback(() => {
    if (!nextStepSlug) return null
    
    // Special handling for resolution (uses /chapter/[N]/proof route)
    if (nextStepSlug === 'resolution') {
      return `/chapter/${chapterNumber}/proof`
    }
    
    // Standard guided flow route using chapter slug
    return `/read/${chapterSlug}/${nextStepSlug}`
  }, [chapterNumber, chapterSlug, nextStepSlug])

  // Helper to build next page URL (within current step)
  const getNextPageUrl = useCallback(() => {
    if (!currentStepSlug || currentPageIndex === undefined || totalPages === undefined) {
      return null
    }
    
    const nextPageIdx = currentPageIndex + 1
    if (nextPageIdx >= totalPages) return null
    
    // For reading step, use /read/chapter-slug route (client-side page nav)
    if (currentStepSlug === 'read') {
      return `/read/${chapterSlug}?page=${nextPageIdx}`
    }
    
    // For other steps, use /read/chapter-slug/step-slug route (client-side page nav)
    return `/read/${chapterSlug}/${currentStepSlug}?page=${nextPageIdx}`
  }, [chapterSlug, currentStepSlug, currentPageIndex, totalPages])

  // Prefetch next step route
  useEffect(() => {
    const nextUrl = getNextStepUrl()
    if (!nextUrl) return
    
    const key = `route:${nextUrl}`
    if (prefetchedRef.current.has(key)) return
    
    tryPrefetch(key, () => {
      router.prefetch(nextUrl)
      perfLog.prefetch('Prefetched next step route:', nextUrl)
    })
    
    prefetchedRef.current.add(key)
  }, [getNextStepUrl, router])

  // Prefetch next page route (within current step)
  useEffect(() => {
    const nextPageUrl = getNextPageUrl()
    if (!nextPageUrl) return
    
    const key = `route:${nextPageUrl}`
    if (prefetchedRef.current.has(key)) return
    
    tryPrefetch(key, () => {
      router.prefetch(nextPageUrl)
      perfLog.prefetch('Prefetched next page route:', nextPageUrl)
    })
    
    prefetchedRef.current.add(key)
  }, [getNextPageUrl, router])

  // Prefetch dashboard if requested (for completion flows)
  useEffect(() => {
    if (!prefetchDashboard) return
    
    const key = 'route:/dashboard'
    if (prefetchedRef.current.has(key)) return
    
    tryPrefetch(key, () => {
      router.prefetch('/dashboard')
      perfLog.prefetch('Prefetched dashboard')
    })
    
    prefetchedRef.current.add(key)
  }, [prefetchDashboard, router])

  // Prefetch next step hero image
  usePrefetchImage(nextStepHeroImage || null, {
    priority: 'high',
    defer: false,
  })

  // Prefetch next page hero image (for n+1 preloading within step)
  usePrefetchImage(nextPageHeroImage || null, {
    priority: 'medium',
    defer: true,
  })

  // Log summary in dev
  useEffect(() => {
    perfLog.prefetch('Config:', {
      chapterNumber,
      currentStepSlug,
      nextStepSlug,
      nextStepUrl: getNextStepUrl(),
      currentPageIndex,
      totalPages,
      nextPageUrl: getNextPageUrl(),
      hasNextStepImage: !!nextStepHeroImage,
      hasNextPageImage: !!nextPageHeroImage,
      prefetchDashboard,
    })
  }, [
    chapterNumber,
    currentStepSlug,
    nextStepSlug,
    currentPageIndex,
    totalPages,
    nextStepHeroImage,
    nextPageHeroImage,
    prefetchDashboard,
    getNextStepUrl,
    getNextPageUrl,
  ])
}

/**
 * Preload the reading hub entry point.
 * Call this from Login and Dashboard to warm the TCP starting point.
 */
export function usePrefetchReadingHub(chapterNumber?: number) {
  const router = useRouter()
  
  useEffect(() => {
    const url = chapterNumber
      ? `/read/${getChapterSlug(chapterNumber)}`
      : '/read'
    
    tryPrefetch(`route:${url}`, () => {
      router.prefetch(url)
      perfLog.prefetch('Prefetched reading hub:', url)
    })
  }, [chapterNumber, router])
}

/**
 * Preload a specific guided step.
 * Useful for one-off preloading (e.g., from dashboard section cards).
 */
export function usePrefetchGuidedStep(
  chapterNumber: number | null,
  stepSlug: string | null,
  heroImage?: string | null
) {
  const router = useRouter()
  
  useEffect(() => {
    if (!chapterNumber || !stepSlug) return

    const chapterPathSlug = getChapterSlug(chapterNumber)
    const url =
      stepSlug === 'resolution'
        ? `/chapter/${chapterNumber}/proof`
        : stepSlug === 'follow_through' || stepSlug === 'follow-through'
          ? getFollowThroughUrl(chapterNumber)
          : `/read/${chapterPathSlug}/${stepSlug}`
    
    tryPrefetch(`route:${url}`, () => {
      router.prefetch(url)
      perfLog.prefetch('Prefetched guided step:', url)
    })
  }, [chapterNumber, stepSlug, router])

  usePrefetchImage(heroImage || null, {
    priority: 'medium',
    defer: true,
  })
}
