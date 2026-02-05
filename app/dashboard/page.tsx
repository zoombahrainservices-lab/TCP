import { requireAuth } from '@/lib/auth/guards'
import { getGamificationData, getWeeklyReportsData, getChapterReportsData } from '@/app/actions/gamification'
import { getLevelThreshold } from '@/lib/gamification/math'
import { getIdentityResolutionForChapter1 } from '@/app/actions/identity'
import TopHero from '@/components/dashboard/TopHero'
import TodaysFocusCard from '@/components/dashboard/cards/TodaysFocusCard'
import StreakCard from '@/components/dashboard/cards/StreakCard'
import ReportsCard from '@/components/dashboard/cards/ReportsCard'
import InProgressCard from '@/components/dashboard/cards/InProgressCard'
import WhatsNextCard from '@/components/dashboard/cards/WhatsNextCard'
import ChapterReportsCard from '@/components/dashboard/cards/ChapterReportsCard'
import IdentityResolutionCard from '@/components/dashboard/cards/IdentityResolutionCard'

export default async function DashboardPage() {
  const user = await requireAuth()
  const { data: gamificationData, error: gamificationError } = await getGamificationData(user.id)
  const [reportsData, chapterReports, identityResolution] = await Promise.all([
    getWeeklyReportsData(user.id),
    getChapterReportsData(user.id),
    getIdentityResolutionForChapter1(),
  ])

  const totalXP = gamificationData?.total_xp ?? 0
  const level = gamificationData?.level ?? 1
  const currentStreak = gamificationData?.current_streak ?? 0
  const longestStreak = gamificationData?.longest_streak ?? 0

  // Format name as "FIRST L." (first name + last initial) like "TOM H."
  const fullName = user.fullName || user.email?.split('@')[0] || 'User'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]?.toUpperCase() || 'USER'
  const lastInitial = nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() + '.' : ''
  const displayName = `${firstName} ${lastInitial}`.trim()

  const levelThreshold = getLevelThreshold(level + 1)

  const userProgress = {
    currentChapter: 1,
    currentChapterTitle: 'From Stage Star to Silent Struggles',
    currentChapterSubtitle: "You'll learn why habits feel impossible",
    readTime: 7,
    progress: 20,
    xpAward: 20,
    chapterImage: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
        {/* Gamification Error Banner */}
        {gamificationError && (
          <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5">
            <p className="font-bold text-red-800">Gamification Error:</p>
            <p className="mt-1 text-sm text-red-600">
              {gamificationError.message || JSON.stringify(gamificationError)}
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
          {/* Left column: main chapter cards */}
          <div className="col-span-12 lg:col-span-8">
            <div className="space-y-6">
              <TodaysFocusCard
                chapterNumber={userProgress.currentChapter}
                readTime={userProgress.readTime}
                progress={55}
                xpAward={70}
              />
              <IdentityResolutionCard identity={identityResolution} />
              <InProgressCard
                chapterNumber={userProgress.currentChapter}
                title={userProgress.currentChapterTitle}
                subtitle={userProgress.currentChapterSubtitle}
                readTime={userProgress.readTime}
                xpAward={userProgress.xpAward}
                progress={userProgress.progress}
                chapterImage={userProgress.chapterImage}
              />
              <WhatsNextCard />
            </div>
          </div>

          {/* Right column: streak + reports */}
          <div className="col-span-12 lg:col-span-4">
            <div className="space-y-6">
              <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
              <ReportsCard
                xpThisWeek={reportsData.xpThisWeek}
                skillImprovement={reportsData.skillImprovement}
                totalXP={totalXP}
                weeklyXPData={reportsData.weeklyXPData}
              />
              <ChapterReportsCard chapters={chapterReports} />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
