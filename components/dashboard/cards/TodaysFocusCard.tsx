'use client'

import Link from 'next/link'
import Card from '../ui/Card'

export default function TodaysFocusCard({
  chapterNumber = 1,
  readTime = 7,
  progress = 55,
  xpAward = 70,
  continueHref = `/read/chapter-${chapterNumber}`,
}: {
  chapterNumber?: number
  readTime?: number
  progress?: number
  xpAward?: number
  continueHref?: string
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-100/60 blur-3xl" />
        <div className="absolute right-20 top-0 h-48 w-48 rounded-full bg-blue-50/50 blur-3xl" />
      </div>

      <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-5 p-[clamp(16px,3vw,24px)]">
        {/* Left: Icon + Info */}
        <div className="flex items-start gap-3 sm:gap-4 flex-1 min-w-0">
          {/* Book icon */}
          <div className="grid h-12 w-12 sm:h-14 sm:w-14 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30 shrink-0">
            <span className="text-2xl sm:text-3xl">📖</span>
          </div>

          <div className="flex-1 min-w-0">
            <h2 className="text-[clamp(1.25rem,3.5vw,1.5rem)] font-black text-slate-800 dark:text-slate-100">Today&apos;s Focus</h2>
            <div className="mt-1 flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[clamp(13px,2vw,14px)]">
              <span className="font-semibold text-slate-700 dark:text-slate-300">Chapter {chapterNumber}</span>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <span>{readTime} min read</span>
            </div>

            {/* Daily XP + Progress + Stars */}
            <div className="mt-3 sm:mt-4 flex flex-wrap items-center gap-2 sm:gap-3">
              <div className="flex items-center gap-1.5 text-[clamp(12px,2vw,14px)] font-bold text-orange-500">
                <span>🔥</span>
                <span className="whitespace-nowrap">+5 Daily XP</span>
              </div>
              <div className="h-2.5 w-24 sm:w-32 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              {/* 5 Stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span key={i} className="text-amber-400 text-base sm:text-lg">★</span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right: CTA + XP */}
        <div className="flex flex-col items-start sm:items-end gap-2 shrink-0 w-full sm:w-auto">
          <Link
            href={continueHref}
            className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-[clamp(16px,3vw,24px)] py-[clamp(10px,2vh,12px)] text-[clamp(12px,2vw,14px)] font-black text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all whitespace-nowrap w-full sm:w-auto text-center"
          >
            Continue Chapter {chapterNumber} →
          </Link>
          <div className="text-[clamp(12px,2vw,14px)] font-bold text-slate-500 dark:text-slate-400 w-full sm:w-auto text-left sm:text-right">+ {xpAward} XP</div>
        </div>
      </div>
    </Card>
  )
}
