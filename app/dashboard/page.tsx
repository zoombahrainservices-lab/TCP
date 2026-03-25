import { Suspense } from 'react'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedChapterReportsData, getDashboardChapters, getCurrentChapterFromReports } from '@/lib/dashboard/cache.server'
import CurrentChapterSync from '@/components/dashboard/CurrentChapterSync'
import { Settings } from 'lucide-react'

// Async components (stream in with Suspense)
import GamificationAsync from '@/components/dashboard/async/GamificationAsync'
import ChapterProgressAsync from '@/components/dashboard/async/ChapterProgressAsync'
import ReportsAsync from '@/components/dashboard/async/ReportsAsync'

// Skeleton fallbacks
import TopHeroSkeleton from '@/components/dashboard/skeletons/TopHeroSkeleton'
import ChapterCardsSkeleton from '@/components/dashboard/skeletons/ChapterCardsSkeleton'
import ReportsSkeleton from '@/components/dashboard/skeletons/ReportsSkeleton'

export default async function DashboardPage() {
  // Only wait for auth + minimal data to render shell instantly
  const user = await requireAuth()
  
  // Get minimal data needed for navigation (cached and deduped across layout/page/async children)
  const [chapterReports, allChapters] = await Promise.all([
    getCachedChapterReportsData(user.id),
    getDashboardChapters(),
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
  const currentChapterSlug = currentChapterMeta?.slug ?? publishedChapters[0]?.slug

  const continueHref = currentChapterSlug ? `/read/${currentChapterSlug}` : '/dashboard'
  const continueLabel = `Continue Chapter ${currentChapter} →`

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
        <CurrentChapterSync currentChapter={currentChapter} />
        
        {/* Gamification Hero - Streams in with Suspense */}
        <Suspense fallback={<TopHeroSkeleton />}>
          <GamificationAsync
            userId={user.id}
            userName={displayName}
            continueHref={continueHref}
            continueLabel={continueLabel}
          />
        </Suspense>

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
  )
}
