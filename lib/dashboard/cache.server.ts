/**
 * Request-scoped cached helpers for dashboard data
 * 
 * These helpers use React's cache() to deduplicate expensive data fetches
 * within a single request, reducing DB round-trips without introducing
 * cross-request caching complexity.
 */

import { cache } from 'react'
import { getChapterReportsData, getGamificationData } from '@/app/actions/gamification'
import { getCachedAllChapters, getCachedChapterReadingPreviewImages } from '@/lib/content/cache.server'

/**
 * Get chapter reports data (cached per-request)
 * 
 * This helper ensures that multiple components calling it in the same request
 * (e.g., layout, page, ChapterProgressAsync) will only execute the underlying
 * query once.
 */
export const getCachedChapterReportsData = cache(async (userId: string) => {
  return getChapterReportsData(userId)
})

/**
 * Get gamification data (cached per-request)
 * 
 * Deduplicates calls between GamificationAsync and ReportsAsync.
 */
export const getCachedGamificationData = cache(async (userId: string) => {
  return getGamificationData(userId)
})

/**
 * Get all chapters for dashboard (already cached via service-role client)
 * 
 * Re-exporting for consistency - this uses the service-role helper which
 * is the correct source for dashboard chapter lists.
 */
export { getCachedAllChapters as getDashboardChapters }
export { getCachedChapterReadingPreviewImages as getDashboardChapterReadingPreviewImages }

/**
 * Get current chapter number from reports data
 * 
 * Shared logic for determining the user's current chapter based on progress.
 * Returns the first incomplete chapter, or the last chapter if all are complete.
 */
export function getCurrentChapterFromReports(
  publishedChapters: any[],
  chapterReports: any[]
): number {
  const progressByNumber = new Map<number, any>()
  for (const row of chapterReports) {
    if (typeof row.chapter_id === 'number') {
      progressByNumber.set(row.chapter_id, row)
    }
  }

  let currentChapterNumber: number | null = null
  for (const chapter of publishedChapters) {
    const chapterNum = chapter.chapter_number as number
    const progress = progressByNumber.get(chapterNum)
    const totalSections = progress?.totalSections ?? 6
    const completedCount = progress?.completedCount ?? 0

    if (!progress || completedCount < totalSections) {
      currentChapterNumber = chapterNum
      break
    }
  }

  if (currentChapterNumber == null && publishedChapters.length > 0) {
    const last = publishedChapters[publishedChapters.length - 1]
    currentChapterNumber = last.chapter_number as number
  }

  return currentChapterNumber ?? 1
}
