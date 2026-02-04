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
import ChapterReportsCard from '@/components/dashboard/cards/ChapterReportsCard'

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
    return (
      <div className="min-h-full">
        <div className="mx-auto max-w-[1400px] px-6 py-6">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-3">Profile</h1>
            <p className="text-lg text-gray-600 dark:text-gray-300">
              Your progress and achievements.
            </p>
          </div>
          <div className="py-16 rounded-2xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center bg-slate-50/80 dark:bg-gray-800/50 ring-1 ring-slate-200/60">
            <p className="text-xl font-semibold text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      </div>
    )
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

        <div className="mt-6 grid grid-cols-12 gap-6">
          {/* Row 1 */}
          <div className="col-span-12 lg:col-span-8">
            <ProfileSummaryCard
              totalXP={totalXP}
              level={level}
              chapterReports={chapterReports}
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
              <p className="text-slate-500 dark:text-slate-400">Track your journey and growth.</p>
            </div>
            <ChapterProgressProfileCard chapterReports={chapterReports} />
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
            <RecentActivityProfileCard recentXP={recentXP} />
          </div>
          <div className="col-span-12 lg:col-span-4">
            <ChapterReportsCard chapters={chapterReports} />
          </div>
        </div>
      </div>
    </div>
  )
}
