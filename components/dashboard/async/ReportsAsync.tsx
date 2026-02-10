import { getWeeklyReportsData, getGamificationData } from '@/app/actions/gamification'
import StreakCard from '@/components/dashboard/cards/StreakCard'
import ReportsCard from '@/components/dashboard/cards/ReportsCard'

interface Props {
  userId: string
}

export default async function ReportsAsync({ userId }: Props) {
  const [reportsData, gamificationData] = await Promise.all([
    getWeeklyReportsData(userId),
    getGamificationData(userId)
  ])

  const totalXP = gamificationData.data?.total_xp ?? 0
  const currentStreak = gamificationData.data?.current_streak ?? 0
  const longestStreak = gamificationData.data?.longest_streak ?? 0

  return (
    <div className="space-y-6">
      <StreakCard currentStreak={currentStreak} longestStreak={longestStreak} />
      <ReportsCard
        xpThisWeek={reportsData.xpThisWeek}
        skillImprovement={reportsData.skillImprovement}
        totalXP={totalXP}
        weeklyXPData={reportsData.weeklyXPData}
      />
    </div>
  )
}
