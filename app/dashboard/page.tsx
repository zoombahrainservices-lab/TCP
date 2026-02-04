import { requireAuth } from '@/lib/auth/guards'
import { getGamificationData, getWeeklyReportsData, getChapterReportsData } from '@/app/actions/gamification'
import { getLevelThreshold } from '@/lib/gamification/math'
import TopHero from '@/components/dashboard/TopHero'
import TodaysFocusCard from '@/components/dashboard/cards/TodaysFocusCard'
import StreakCard from '@/components/dashboard/cards/StreakCard'
import ReportsCard from '@/components/dashboard/cards/ReportsCard'
import InProgressCard from '@/components/dashboard/cards/InProgressCard'
import WhatsNextCard from '@/components/dashboard/cards/WhatsNextCard'
import ChapterReportsCard from '@/components/dashboard/cards/ChapterReportsCard'

export default async function DashboardPage() {
  const user = await requireAuth()
  const { data: gamificationData, error: gamificationError } = await getGamificationData(user.id)
  const [reportsData, chapterReports] = await Promise.all([
    getWeeklyReportsData(user.id),
    getChapterReportsData(user.id),
  ])

  const totalXP = gamificationData?.total_xp ?? 0
  const level = gamificationData?.level ?? 1
  const currentStreak = gamificationData?.current_streak ?? 0
  const longestStreak = gamificationData?.longest_streak ?? 0

  // Format name as "FIRST L." (first name + last initial) like "TOM H."
  const fullName = user.user_metadata?.full_name || user.email?.split('@')[0] || 'User'
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
          {/* Row 1 */}
          <div className="col-span-12 lg:col-span-8">
            <TodaysFocusCard
              chapterNumber={userProgress.currentChapter}
              readTime={userProgress.readTime}
              progress={55}
              xpAward={70}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
          </div>

          {/* Row 2 */}
          <div className="col-span-12 lg:col-span-8">
            <div className="mb-4 px-1">
              <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                You&apos;re making progress. Keep going.
              </h3>
              <p className="text-slate-500 dark:text-slate-400">Pick up where you left off.</p>
            </div>
            <InProgressCard
              chapterNumber={userProgress.currentChapter}
              title={userProgress.currentChapterTitle}
              subtitle={userProgress.currentChapterSubtitle}
              readTime={userProgress.readTime}
              xpAward={userProgress.xpAward}
              progress={userProgress.progress}
              chapterImage={userProgress.chapterImage}
            />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ReportsCard
              xpThisWeek={reportsData.xpThisWeek}
              skillImprovement={reportsData.skillImprovement}
              totalXP={totalXP}
              weeklyXPData={reportsData.weeklyXPData}
            />
          </div>

          {/* Row 3 */}
          <div className="col-span-12 lg:col-span-8">
            <WhatsNextCard />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ChapterReportsCard chapters={chapterReports} />
          </div>
        </div>
      </div>
    </div>
  )
}
