import { getWeeklyReportsData } from '@/app/actions/gamification'
import { getCachedGamificationData, getCachedChapterReportsData } from '@/lib/dashboard/cache.server'
import StreakCard from '@/components/dashboard/cards/StreakCard'
import SimplifiedReportsCard from '@/components/dashboard/cards/SimplifiedReportsCard'

interface Props {
  userId: string
}

export default async function ReportsAsync({ userId }: Props) {
  const [reportsData, gamificationData, chapterReports] = await Promise.all([
    getWeeklyReportsData(userId),
    getCachedGamificationData(userId),
    getCachedChapterReportsData(userId),
  ])

  const currentStreak = gamificationData.data?.current_streak ?? 0
  const longestStreak = gamificationData.data?.longest_streak ?? 0

  // Calculate chapters completed (progress = 100%)
  const chaptersCompleted =
    Array.isArray(chapterReports)
      ? chapterReports.filter((ch) => {
          if (ch && typeof ch.totalSections === 'number' && ch.totalSections > 0) {
            const progress = Math.round((ch.completedCount / ch.totalSections) * 100)
            return progress >= 100
          }
          return false
        }).length
      : 0

  return (
    <div className="space-y-6">
      <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
      <SimplifiedReportsCard
        xpThisWeek={reportsData.xpThisWeek}
        chaptersCompleted={chaptersCompleted}
        currentStreak={currentStreak}
      />
    </div>
  )
}

