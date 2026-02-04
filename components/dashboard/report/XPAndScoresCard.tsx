'use client'

import Card from '../ui/Card'

const WEEK_LABELS = ['6w ago', '5w ago', '4w ago', '3w ago', '2w ago', '1w ago', 'This Week']

export default function XPAndScoresCard({
  weeklyXPData,
  xpThisWeek,
  totalImprovement,
  totalXPEarned,
}: {
  weeklyXPData: number[]
  xpThisWeek: number
  totalImprovement: number
  totalXPEarned: number
}) {
  const maxXP = Math.max(...weeklyXPData, 1)
  const barHeights = weeklyXPData.map((xp) =>
    Math.max((xp / maxXP) * 100, 2)
  )

  // Line chart points (7 points for 7 weeks)
  const chartWidth = 400
  const chartHeight = 120
  const padding = 20
  const usableWidth = chartWidth - padding * 2
  const usableHeight = chartHeight - 20

  const linePoints = weeklyXPData
    .map((xp, i) => {
      const x = padding + (i * usableWidth) / 6
      const y = chartHeight - 10 - (xp / maxXP) * usableHeight
      return `${x},${y}`
    })
    .join(' ')

  return (
    <Card className="overflow-hidden h-full">
      <div className="p-6">
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">
          XP & Scores
        </h2>

        <div className="mt-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 p-4 ring-1 ring-slate-200/60 dark:ring-slate-600/40">
          <div className="mb-2 flex items-center justify-between text-xs font-semibold text-slate-400">
            {WEEK_LABELS.map((label) => (
              <span key={label}>{label}</span>
            ))}
          </div>

          <div className="relative h-36 rounded-xl bg-white dark:bg-slate-900/50 ring-1 ring-slate-200/60 overflow-hidden">
            <div className="absolute bottom-0 left-0 right-0 flex items-end justify-around gap-1 px-2 pb-1 h-full">
              {barHeights.map((h, i) => (
                <div
                  key={i}
                  className="flex-1 max-w-[24px] rounded-t bg-gradient-to-t from-orange-400 to-orange-300 transition-all"
                  style={{ height: `${h}%` }}
                  title={`${weeklyXPData[i]} XP`}
                />
              ))}
            </div>
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              preserveAspectRatio="none"
            >
              <polyline
                points={linePoints}
                fill="none"
                stroke="#3b82f6"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>

          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div className="rounded-xl bg-white dark:bg-slate-800/80 px-4 py-2 ring-1 ring-slate-200/60">
              <span className="font-bold text-orange-500">+{xpThisWeek}</span>
              <span className="ml-2 text-slate-600 dark:text-slate-400">This Week</span>
            </div>
            <div className="rounded-xl bg-white dark:bg-slate-800/80 px-4 py-2 ring-1 ring-slate-200/60">
              <span className="font-bold text-green-600">+{totalImprovement}</span>
              <span className="ml-2 text-slate-600 dark:text-slate-400">Score Improvement</span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between rounded-xl bg-blue-50 dark:bg-blue-900/20 px-4 py-3 ring-1 ring-blue-200/50">
            <div className="flex items-center gap-2">
              <span className="text-lg">🏆</span>
              <span className="text-sm font-bold text-slate-700 dark:text-slate-200">
                +{totalXPEarned.toLocaleString()} XP Earned
              </span>
            </div>
            <span className="text-sm font-bold text-green-600 dark:text-green-400">
              +{totalImprovement} Overall Score Improvement
            </span>
          </div>
        </div>
      </div>
    </Card>
  )
}
