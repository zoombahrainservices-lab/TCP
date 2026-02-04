'use client'

import Link from 'next/link'
import Card from '../ui/Card'

export type ChapterReportRow = {
  title: string
  completed: string
  completedCount: number
  totalSections: number
  xp: number
}

export default function ProfileSummaryCard({
  totalXP,
  level,
  chapterReports = [],
}: {
  totalXP: number
  level: number
  chapterReports?: ChapterReportRow[]
}) {
  const totalCompletedSections = chapterReports.reduce((sum, c) => sum + c.completedCount, 0)
  const totalPossibleSections =
    chapterReports.reduce((sum, c) => sum + c.totalSections, 0) || 6
  const progressPercent =
    totalPossibleSections > 0
      ? Math.round((totalCompletedSections / totalPossibleSections) * 100)
      : 0
  const currentChapter = chapterReports.length > 0 ? chapterReports.length : 1
  const filledStars = Math.ceil((progressPercent / 100) * 5)

  return (
    <Card className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute right-20 top-0 h-48 w-48 rounded-full bg-blue-50/50 blur-3xl" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-5 p-6">
        <div className="flex items-start gap-4">
          <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30 shrink-0">
            <span className="text-3xl">👤</span>
          </div>

          <div>
            <h2 className="text-2xl font-black text-slate-800 dark:text-slate-100">
              Your Progress
            </h2>
            <div className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400">
              <span className="font-semibold text-slate-700 dark:text-slate-300">
                Level {level}
              </span>
              <span className="text-slate-300">·</span>
              <span>{totalXP} XP earned</span>
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-3">
              <div className="flex items-center gap-1.5 text-sm font-bold text-orange-500">
                <span>🏆</span>
                <span>Chapter {currentChapter}</span>
              </div>
              <div className="h-2.5 w-32 overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all"
                  style={{ width: `${Math.min(progressPercent, 100)}%` }}
                />
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i <= filledStars
                        ? 'text-amber-400'
                        : 'text-slate-300 dark:text-slate-500'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0">
          <Link
            href="/dashboard"
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3 text-sm font-black text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all"
          >
            Back to Dashboard →
          </Link>
          <div className="text-sm font-bold text-slate-500 dark:text-slate-400">
            {totalXP} XP Total
          </div>
        </div>
      </div>
    </Card>
  )
}
