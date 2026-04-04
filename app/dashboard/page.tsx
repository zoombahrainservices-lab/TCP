import { Suspense } from 'react'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedChapterReportsData, getCachedGamificationData, getDashboardChapters, getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'
import { getLevelThreshold } from '@/lib/gamification/math'
import CurrentChapterSync from '@/components/dashboard/CurrentChapterSync'
import SectionImagePrefetch from '@/components/dashboard/SectionImagePrefetch'
import TopHero from '@/components/dashboard/TopHero'
import PageTransition from '@/components/ui/PageTransition'

// Async components (stream in with Suspense)
import ChapterProgressAsync from '@/components/dashboard/async/ChapterProgressAsync'
import ReportsAsync from '@/components/dashboard/async/ReportsAsync'

// Skeleton fallbacks
import ChapterCardsSkeleton from '@/components/dashboard/skeletons/ChapterCardsSkeleton'
import ReportsSkeleton from '@/components/dashboard/skeletons/ReportsSkeleton'
import StreakCelebrationTrigger from '@/components/dashboard/StreakCelebrationTrigger'

export default async function DashboardPage() {
  // Only wait for auth + critical above-the-fold data to render shell instantly
  const user = await requireAuth()
  
  // Get all critical data in parallel (cached and deduped across layout/page/async children)
  const [chapterReports, allChapters, gamificationResult] = await Promise.all([
    getCachedChapterReportsData(user.id),
    getDashboardChapters(),
    getCachedGamificationData(user.id),
  ])

  // Format name as "FIRST L." (first name + last initial) like "TOM H."
  const fullName = user.fullName || user.email?.split('@')[0] || 'User'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]?.toUpperCase() || 'USER'
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() + '.' : ''
  const displayName = `${firstName} ${lastInitial}`.trim()

  // Determine current chapter for navigation (use shared helper)
  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []

  const currentChapter = getCurrentChapterFromReports(publishedChapters, progressList)
  const currentChapterMeta = publishedChapters.find(c => c.chapter_number === currentChapter) ?? publishedChapters[0]

  // Extract gamification data
  const totalXP = gamificationResult.data?.total_xp ?? 0
  const level = gamificationResult.data?.level ?? 1
  const levelThreshold = getLevelThreshold(level + 1)

  return (
    <PageTransition>
      <Suspense fallback={null}>
        <StreakCelebrationTrigger />
      </Suspense>
      <div className="min-h-full">
        <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
          <CurrentChapterSync currentChapter={currentChapter} />
          <SectionImagePrefetch currentChapter={currentChapter} />
          
          {/* Gamification Hero - Now renders immediately with prefetched data */}
          {gamificationResult.error && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5">
              <p className="font-bold text-red-800">Gamification Error:</p>
              <p className="mt-1 text-sm text-red-600">
                {gamificationResult.error.message || JSON.stringify(gamificationResult.error)}
              </p>
              <p className="mt-2 text-xs text-red-600">
                Make sure you&apos;ve run both database migrations in Supabase SQL editor.
              </p>
            </div>
          )}
          
          <TopHero
            userName={displayName}
            totalXP={totalXP}
            level={level}
            levelThreshold={levelThreshold}
          />

          <div className="mt-6 grid grid-cols-12 gap-6">
            {/* Left column: Chapter progress cards - Streams in independently */}
            <div className="col-span-12 lg:col-span-8">
              <Suspense fallback={<ChapterCardsSkeleton />}>
                <ChapterProgressAsync userId={user.id} />
              </Suspense>
            </div>

            {/* Right column: Reports - Streams in independently */}
            <div className="col-span-12 lg:col-span-4">
              <Suspense fallback={<ReportsSkeleton />}>
                <ReportsAsync userId={user.id} />
              </Suspense>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
