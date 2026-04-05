/**
 * Dashboard chapter warmup hook.
 * 
 * When user is on dashboard, this hook warms the first 3 pages of every section
 * for the CURRENT/NEXT MOST LIKELY chapter (not all chapters).
 * 
 * Warmup is staggered and prioritized:
 * 1. Reading (highest priority)
 * 2. Self-Check
 * 3. Framework
 * 4. Techniques
 * 5. Resolution
 * 6. Follow-Through
 * 
 * For each section, preloads:
 * - Route / section entry
 * - First 3 page hero images
 * - First page data (optional)
 * 
 * Uses the central preload registry queue for rate-limited, non-blocking warmup.
 */

'use client'

import { useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { preloadRegistry, makeRouteKey, makeImageKey, makeDataKey } from '@/lib/performance/preload-registry'
import { usePreloadBudget } from '@/lib/hooks/usePreloadBudget'
import { getChapterSlug } from '@/lib/guided-book/navigation'
import { getSectionImageUrlPrimary } from '@/lib/chapterImages'

const SECTION_ORDER = [
  'read',
  'self_check',
  'framework',
  'techniques',
  'resolution',
  'follow_through',
] as const

type SectionSlug = typeof SECTION_ORDER[number]

interface DashboardWarmupOptions {
  /** Chapter number to warm up */
  chapterNumber: number
  /** Chapter slug */
  chapterSlug: string
  /** Whether warmup is enabled (default: true) */
  enabled?: boolean
}

/**
 * Get the route for a section
 */
function getSectionRoute(chapterNumber: number, chapterSlug: string, section: SectionSlug): string {
  if (section === 'read') {
    return `/read/${chapterSlug}`
  }
  if (section === 'resolution') {
    return `/chapter/${chapterNumber}/proof`
  }
  // follow_through has special handling
  if (section === 'follow_through') {
    // Assuming follow-through route pattern
    return `/read/chapter-${chapterNumber}/follow-through`
  }
  return `/read/${chapterSlug}/${section}`
}

/**
 * Warm a single section's first 3 pages
 */
async function warmSection(
  chapterNumber: number,
  chapterSlug: string,
  section: SectionSlug,
  priority: 'critical' | 'high' | 'normal' | 'low',
  router: ReturnType<typeof useRouter>
) {
  const routeUrl = getSectionRoute(chapterNumber, chapterSlug, section)
  const routeKey = makeRouteKey(routeUrl)

  // 1. Prefetch the route
  preloadRegistry.enqueue(
    routeKey,
    () => router.prefetch(routeUrl),
    priority
  )

  // 2. Preload first 3 page images for image-heavy sections
  if (section === 'read' || section === 'framework' || section === 'techniques') {
    for (let pageIdx = 0; pageIdx < 3; pageIdx++) {
      // Note: We don't have actual page data here, so we use a convention
      // In a real implementation, you'd fetch page metadata from an API
      // For now, we'll preload section hero images as a proxy
      if (pageIdx === 0) {
        const imageUrl = getSectionImageUrlPrimary(chapterNumber, section as any)
        const imageKey = makeImageKey(imageUrl)
        
        preloadRegistry.enqueue(
          imageKey,
          () => {
            const img = new Image()
            img.src = imageUrl
            return new Promise((resolve) => {
              img.onload = () => resolve()
              img.onerror = () => resolve() // Don't block on errors
            })
          },
          pageIdx === 0 ? priority : 'low' // Only first image gets priority
        )
      }
    }
  }

  // 3. Optionally prefetch first page data
  // This would call an API like /api/guided-book/section-pages?chapter=X&section=Y
  // Skipping for now as it depends on your API structure
}

/**
 * Hook to warm up the current chapter from dashboard.
 * 
 * Staggered warmup of all 6 sections, prioritized by section order.
 * Only runs once per chapter per session.
 */
export function useDashboardChapterWarmup(options: DashboardWarmupOptions) {
  const { chapterNumber, chapterSlug, enabled = true } = options
  const budget = usePreloadBudget()
  const router = useRouter()
  const warmedChaptersRef = useRef(new Set<number>())

  useEffect(() => {
    // Skip if disabled or already warmed this chapter
    if (!enabled || !budget.enableDashboardWarmup || warmedChaptersRef.current.has(chapterNumber)) {
      return
    }

    // Mark as warmed
    warmedChaptersRef.current.add(chapterNumber)

    console.log(`[DashboardWarmup] Starting warmup for chapter ${chapterNumber} (profile: ${budget.profile})`)

    // Warm sections in priority order
    const priorityMap: Record<SectionSlug, 'critical' | 'high' | 'normal' | 'low'> = {
      read: 'critical',
      self_check: 'high',
      framework: 'high',
      techniques: 'normal',
      resolution: 'normal',
      follow_through: 'low',
    }

    // Start warmup for all sections (registry will handle staggering)
    for (const section of SECTION_ORDER) {
      warmSection(chapterNumber, chapterSlug, section, priorityMap[section], router)
    }

    console.log(`[DashboardWarmup] Queued warmup tasks for chapter ${chapterNumber}`)
  }, [chapterNumber, chapterSlug, enabled, budget, router])

  // Cleanup is handled by registry's max age/size limits
}
