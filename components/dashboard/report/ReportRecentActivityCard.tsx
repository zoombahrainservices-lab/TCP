'use client'

import Card from '../ui/Card'

export type XPLogRow = {
  id: number
  reason: string
  amount: number
  created_at: string
  chapter_id?: number | null
}

function formatReason(reason: string): string {
  const map: Record<string, string> = {
    daily_activity: 'Today',
    section_completion: 'Section Complete',
    chapter_completion: 'Chapter Complete',
    improvement: 'Improvement',
    streak_bonus: 'Streak Bonus',
    milestone: 'Milestone',
  }
  return map[reason] || reason.replace(/_/g, ' ')
}

function getReasonSuffix(reason: string, amount: number, chapterId?: number | null): string {
  if (reason === 'chapter_completion' && chapterId) return `Completed Chapter ${chapterId}`
  if (reason === 'streak_bonus') return 'Day Streak'
  if (reason === 'improvement') return 'Point Improvement!'
  if (reason === 'milestone') return 'Day Streak Milestone!'
  return ''
}

export default function ReportRecentActivityCard({
  recentXP,
  xpToday,
}: {
  recentXP: XPLogRow[]
  xpToday: number
}) {
  const displayLogs = recentXP.slice(0, 6)

  return (
    <Card className="overflow-hidden h-full">
      <div className="p-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
          Recent Activity
        </h2>

        <div className="mt-4 space-y-2">
          {xpToday > 0 && (
            <div className="flex items-center justify-between rounded-xl bg-amber-50 dark:bg-amber-900/20 px-4 py-3 ring-1 ring-amber-200/60">
              <span className="font-bold text-slate-800 dark:text-slate-100">
                +{xpToday} XP Today
              </span>
              <span className="text-sm font-black text-orange-500">+{xpToday} XP</span>
            </div>
          )}
          {displayLogs.length === 0 && xpToday === 0 ? (
            <div className="rounded-xl bg-slate-50 dark:bg-slate-800/50 p-4 ring-1 ring-slate-200/60">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                No activity yet. Complete steps to earn XP!
              </p>
            </div>
          ) : (
            displayLogs.map((log) => {
              const suffix = getReasonSuffix(log.reason, log.amount, log.chapter_id)
              const label =
                suffix && log.reason !== 'daily_activity'
                  ? `${formatReason(log.reason)} ${suffix}`
                  : formatReason(log.reason)
              return (
                <div
                  key={log.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50 dark:bg-slate-800/50 px-4 py-3 ring-1 ring-slate-200/60 dark:ring-slate-600/40"
                >
                  <div className="flex items-center gap-3">
                    {log.reason === 'chapter_completion' && (
                      <span className="text-green-500">✓</span>
                    )}
                    {log.reason === 'streak_bonus' && (
                      <span className="text-amber-500">⏱</span>
                    )}
                    {log.reason === 'improvement' && (
                      <span className="text-green-500">↑</span>
                    )}
                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                      +{log.amount} XP {label}
                    </span>
                  </div>
                  <span className="text-sm font-black text-orange-500">+{log.amount} XP</span>
                </div>
              )
            })
          )}
        </div>
      </div>
    </Card>
  )
}
