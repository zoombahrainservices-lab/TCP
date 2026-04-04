import Card from '../ui/Card'
import Link from 'next/link'

export default function SimplifiedReportsCard({
  xpThisWeek,
  chaptersCompleted = 0,
  currentStreak,
}: {
  xpThisWeek: number
  chaptersCompleted?: number
  currentStreak: number
}) {
  return (
    <Card className="overflow-hidden">
      <div className="relative p-5">
        {/* Subtle gradient wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-8 top-8 h-40 w-40 rounded-full bg-blue-50/50 dark:bg-blue-900/10 blur-2xl" />
        </div>

        {/* Header */}
        <div className="relative flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="grid h-11 w-11 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 dark:from-amber-900/40 dark:to-amber-800/40 ring-1 ring-amber-300/30 dark:ring-amber-700/30">
              <span className="text-xl">📊</span>
            </div>
            <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">Quick Stats</h2>
          </div>
          <Link
            href="/dashboard/progress"
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors"
          >
            View All →
          </Link>
        </div>

        {/* Stats: XP, chapters, streak (skill improvement removed for dashboard) */}
        <div className="relative grid grid-cols-1 gap-3 sm:grid-cols-3">
          <div className="rounded-xl bg-gradient-to-br from-orange-50/80 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 px-4 py-3.5 ring-1 ring-orange-200/50 dark:ring-orange-700/30">
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400">{xpThisWeek}</div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              XP This Week
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-blue-50/80 to-blue-100/50 dark:from-blue-900/20 dark:to-blue-800/10 px-4 py-3.5 ring-1 ring-blue-200/50 dark:ring-blue-700/30">
            <div className="text-2xl font-black text-blue-600 dark:text-blue-400">{chaptersCompleted}</div>
            <div className="text-[11px] font-semibold text-slate-600 dark:text-slate-300 mt-0.5">
              Chapters Done
            </div>
          </div>

          <div className="rounded-xl bg-gradient-to-br from-orange-50/80 to-orange-100/50 dark:from-orange-900/20 dark:to-orange-800/10 px-4 py-3.5 ring-1 ring-orange-200/50 dark:ring-orange-700/30">
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-orange-600 dark:text-orange-400">{currentStreak}</span>
              <span className="text-base" aria-hidden>
                🔥
              </span>
            </div>
            <div className="text-[11px] font-semibold text-orange-700/90 dark:text-orange-300/90 mt-0.5">
              Day Streak
            </div>
          </div>
        </div>

        <Link
          href="/dashboard/progress"
          className="mt-4 block w-full rounded-xl bg-gradient-to-r from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-700 hover:from-slate-200 hover:to-slate-100 dark:hover:from-slate-700 dark:hover:to-slate-600 px-4 py-2.5 text-center text-sm font-bold text-slate-700 dark:text-slate-200 transition-all ring-1 ring-slate-200/60 dark:ring-slate-600"
        >
          View Full Report
        </Link>
      </div>
    </Card>
  )
}
