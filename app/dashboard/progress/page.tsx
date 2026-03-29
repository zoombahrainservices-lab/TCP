import { requireAuth } from '@/lib/auth/guards'
import {
  getGamificationData,
  getAllChapterSkillScores,
  getChapterReportsData,
  getReportWeeklyData,
  getRecentXPLogs,
  getTodaysXPLogs,
  getChapterXPBreakdown,
} from '@/app/actions/gamification'
import ChapterOverallScoreCard from '@/components/dashboard/report/ChapterOverallScoreCard'
import ComprehensiveReportCard from '@/components/dashboard/report/ComprehensiveReportCard'
import XPAndScoresCard from '@/components/dashboard/report/XPAndScoresCard'
import ReportRecentActivityCard from '@/components/dashboard/report/ReportRecentActivityCard'

export default async function ReportPage() {
  const user = await requireAuth()

  const [
    gamificationResult,
    skillScoresResult,
    chapterReportsResult,
    weeklyXPResult,
    recentXPResult,
    todaysXPResult,
  ] = await Promise.all([
    getGamificationData(user.id),
    getAllChapterSkillScores(user.id),
    getChapterReportsData(user.id),
    getReportWeeklyData(user.id).catch(() => [0, 0, 0, 0, 0, 0, 0] as number[]),
    getRecentXPLogs(user.id, 15),
    getTodaysXPLogs(user.id),
  ])

  const skillScores = skillScoresResult.data ?? []
  const chapterReports = Array.isArray(chapterReportsResult) ? chapterReportsResult : []
  const weeklyXP = Array.isArray(weeklyXPResult) && weeklyXPResult.length === 7
    ? weeklyXPResult
    : [0, 0, 0, 0, 0, 0, 0]
  const recentXP = recentXPResult.data ?? []
  const todaysLogs = todaysXPResult.data ?? []
  const xpToday = todaysLogs.reduce((sum, log) => sum + (log.amount ?? 0), 0)

  const totalXP = Number(gamificationResult.data?.total_xp) ?? 0
  const reportsSkillImprovement =
    skillScores.reduce((s, r) => s + Math.max(0, r.improvement ?? 0), 0)

  const xpThisWeek = weeklyXP[6] ?? 0

  // Build comprehensive report rows from skill scores + chapter reports
  const xpByChapter: Record<number, number> = {}
  for (const cr of chapterReports) {
    const cid = (cr as { chapter_id?: number }).chapter_id ?? parseInt(String((cr as { title?: string }).title || '').replace('Chapter ', ''), 10)
    if (typeof cid === 'number' && !isNaN(cid)) xpByChapter[cid] = (cr as { xp?: number }).xp ?? 0
  }

  const skillByChapter: Record<number, { best_score: number | null; improvement: number | null }> = {}
  for (const s of skillScores) {
    skillByChapter[s.chapter_id] = {
      best_score: s.best_score ?? null,
      improvement: s.improvement ?? 0,
    }
  }

  const comprehensiveChapters = chapterReports.map((cr) => {
    const chapterId =
      (cr as { chapter_id?: number }).chapter_id ??
      parseInt(String((cr as { title?: string }).title || '').replace('Chapter ', ''), 10)
    const skill = skillByChapter[chapterId]
    return {
      chapterId,
      bestScore: skill?.best_score ?? null,
      improvement: Math.max(0, skill?.improvement ?? 0),
      xpEarned: xpByChapter[chapterId] ?? 0,
    }
  })

  const chapterIds = comprehensiveChapters
    .map((c) => c.chapterId)
    .filter((id) => Number.isFinite(id) && id > 0)
  const maxChapterInProgress = chapterIds.length > 0 ? Math.max(...chapterIds) : 1
  const targetFeaturedChapterId = Math.max(1, maxChapterInProgress - 1)

  // Featured chapter for Chapter Overall Score: latest completed chapter (n-1) fallback to highest available.
  let featuredChapterData = null

  const getChapterId = (cr: { title?: string; chapter_id?: number }) =>
    cr.chapter_id ?? parseInt(String(cr.title || '').replace('Chapter ', ''), 10)

  const fallbackChapterId =
    chapterIds.length > 0 ? Math.max(...chapterIds) : skillScores[0]?.chapter_id ?? 1
  const chapterId = chapterIds.includes(targetFeaturedChapterId)
    ? targetFeaturedChapterId
    : fallbackChapterId

  if (chapterId) {
    const skill = skillScores.find((s) => s.chapter_id === chapterId)
    const cr = chapterReports.find(
      (c) => getChapterId(c) === chapterId
    )
    const xpEarned = xpByChapter[chapterId] ?? cr?.xp ?? 0
    const isComplete =
      cr?.completedCount === 6 || cr?.completed === '6/6'

    const breakdownRaw = await getChapterXPBreakdown(user.id, chapterId)
    const xpBreakdown = Object.entries(breakdownRaw)
      .filter(([, amt]) => amt > 0)
      .map(([reason, amount]) => ({ reason, amount }))

    featuredChapterData = {
      chapterId,
      bestScore: skill?.best_score ?? null,
      scoreBefore: skill?.score_before ?? null,
      improvement: Math.max(0, skill?.improvement ?? 0),
      xpEarned,
      isComplete: !!isComplete,
      xpBreakdown,
    }
  }

  return (
    <div className="min-h-full">
      <div className="mx-auto max-w-[1400px] gap-6 px-6 py-6">
        <div className="mb-6">
          <h1 className="text-4xl font-bold text-slate-800 dark:text-white">
            Report
          </h1>
          <p className="mt-1 text-lg text-slate-600 dark:text-slate-400">
            See how far you&apos;ve come! Track your progress and improvement over
            time.
          </p>
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Left column */}
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
            <ChapterOverallScoreCard data={featuredChapterData} />
            <XPAndScoresCard
              weeklyXPData={weeklyXP}
              xpThisWeek={xpThisWeek}
              totalImprovement={reportsSkillImprovement}
              totalXPEarned={totalXP}
              chapterCount={chapterIds.length}
            />
          </div>

          {/* Right column */}
          <div className="col-span-12 flex flex-col gap-6 lg:col-span-4">
            <ComprehensiveReportCard
              chapters={comprehensiveChapters}
              totalXPEarned={totalXP}
            />
            <ReportRecentActivityCard recentXP={recentXP} xpToday={xpToday} />
          </div>
        </div>
      </div>
    </div>
  )
}
