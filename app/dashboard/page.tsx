import { Suspense } from 'react'
import Link from 'next/link'
import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
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
  
  // Get minimal data needed for navigation (cached)
  const [chapterReports, allChapters] = await Promise.all([
    getChapterReportsData(user.id),
    getCachedAllChapters(),
  ])

  // Format name as "FIRST L." (first name + last initial) like "TOM H."
  const fullName = user.fullName || user.email?.split('@')[0] || 'User'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]?.toUpperCase() || 'USER'
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() + '.' : ''
  const displayName = `${firstName} ${lastInitial}`.trim()

  // Determine current chapter for navigation (minimal computation)
  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []

  const progressByNumber = new Map<number, any>()
  for (const row of progressList) {
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

  const currentChapter = currentChapterNumber ?? 1
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
