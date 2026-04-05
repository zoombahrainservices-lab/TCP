/**
 * Dashboard warmup client component.
 * 
 * This component runs on the dashboard to warm up the current/next chapter
 * using the staggered preload queue.
 * 
 * Integrates:
 * - useDashboardChapterWarmup for section warmup
 * - Central registry for deduplication
 * - Network budget for throttling
 */

'use client'

import { useDashboardChapterWarmup } from '@/lib/hooks/useDashboardChapterWarmup'
import { getChapterSlug } from '@/lib/guided-book/navigation'

interface DashboardWarmupClientProps {
  /** Current chapter number to warm up */
  currentChapter: number
}

/**
 * Client component that handles dashboard-level preloading.
 * 
 * Warms the first 3 pages of every section for the current chapter
 * using a staggered, network-aware queue.
 */
export default function DashboardWarmupClient({ currentChapter }: DashboardWarmupClientProps) {
  const chapterSlug = getChapterSlug(currentChapter)

  useDashboardChapterWarmup({
    chapterNumber: currentChapter,
    chapterSlug,
    enabled: true,
  })

  // This component renders nothing - it just runs the warmup hook
  return null
}
