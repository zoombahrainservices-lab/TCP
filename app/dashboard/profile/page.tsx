import { requireAuth } from '@/lib/auth/guards'
import {
  getGamificationData,
  getRecentXPLogs,
  getWeeklyReportsData,
  getChapterReportsData,
} from '@/app/actions/gamification'
import { getLevelThreshold } from '@/lib/gamification/math'
import TopHero from '@/components/dashboard/TopHero'
import ProfileSummaryCard from '@/components/dashboard/cards/ProfileSummaryCard'
import StreakCard from '@/components/dashboard/cards/StreakCard'
import ChapterProgressProfileCard from '@/components/dashboard/cards/ChapterProgressProfileCard'
import ReportsCard from '@/components/dashboard/cards/ReportsCard'
import RecentActivityProfileCard from '@/components/dashboard/cards/RecentActivityProfileCard'
import ProfilePageSkeleton from '@/components/dashboard/skeletons/ProfilePageSkeleton'
import PageTransition from '@/components/ui/PageTransition'

export default async function ProfilePage() {
  const user = await requireAuth()

  const { data: gamificationData, error: gamificationError } = await getGamificationData(user.id)
  const [recentXPResult, reportsDataResult, chapterReportsResult] = await Promise.all([
    getRecentXPLogs(user.id, 10),
    getWeeklyReportsData(user.id).catch(() => ({
      xpThisWeek: 0,
      skillImprovement: 0,
      weeklyXPData: [0, 0, 0, 0] as number[],
    })),
    getChapterReportsData(user.id).catch(() => []),
  ])

  const recentXP = recentXPResult.data ?? []
  const reportsData =
    reportsDataResult && typeof reportsDataResult === 'object'
      ? reportsDataResult
      : { xpThisWeek: 0, skillImprovement: 0, weeklyXPData: [0, 0, 0, 0] as number[] }
  const chapterReports = Array.isArray(chapterReportsResult) ? chapterReportsResult : []

  if (!gamificationData) {
    return <ProfilePageSkeleton />
  }

  const totalXP = Number(gamificationData.total_xp) || 0
  const level = Number(gamificationData.level) || 1
  const currentStreak = Number(gamificationData.current_streak) || 0
  const longestStreak = Number(gamificationData.longest_streak) || 0
  const levelThreshold = getLevelThreshold(level + 1)

  const fullName = user.fullName || user.email?.split('@')[0] || 'User'
  const nameParts = fullName.trim().split(' ')
  const firstName = nameParts[0]?.toUpperCase() || 'USER'
  const lastInitial =
    nameParts.length > 1 ? nameParts[nameParts.length - 1]?.[0]?.toUpperCase() + '.' : ''
  const displayName = `${firstName} ${lastInitial}`.trim()

  return (
    <PageTransition>
      <div className="min-h-full">
        <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
          {gamificationError && (
            <div className="mb-6 rounded-2xl bg-red-50 border border-red-200 p-5 ring-1 ring-red-200/50">
              <p className="font-bold text-red-800">Gamification Error:</p>
              <p className="mt-1 text-sm text-red-600">
                {gamificationError.message || JSON.stringify(gamificationError)}
              </p>
            </div>
          )}

          <TopHero
            userName={displayName}
            totalXP={totalXP}
            level={level}
            levelThreshold={levelThreshold}
          />

          <div className="mt-6 grid grid-cols-12 gap-[10px]">
            {/* Left column */}
            <div className="col-span-12 flex flex-col gap-[10px] lg:col-span-8">
              <ProfileSummaryCard
                totalXP={totalXP}
                level={level}
                chapterReports={chapterReports}
              />
              <div className="px-1 pt-1">
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">
                  You&apos;re making progress. Keep going.
                </h3>
                <p className="text-slate-500 dark:text-slate-400">Track your journey and growth.</p>
              </div>
              <ChapterProgressProfileCard chapterReports={chapterReports} />
              <RecentActivityProfileCard recentXP={recentXP} />
            </div>

            {/* Right column */}
            <div className="col-span-12 flex flex-col gap-[10px] lg:col-span-4">
              <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
              <ReportsCard
                xpThisWeek={reportsData.xpThisWeek}
                skillImprovement={reportsData.skillImprovement}
                totalXP={totalXP}
                weeklyXPData={reportsData.weeklyXPData}
              />
            </div>
          </div>
        </div>
      </div>
    </PageTransition>
  )
}
