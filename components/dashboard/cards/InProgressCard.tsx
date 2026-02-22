'use client'

import Image from 'next/image'
import Link from 'next/link'
import Card from '../ui/Card'

export default function InProgressCard({
  chapterNumber = 1,
  title = 'From Stage Star to Silent Struggles',
  subtitle = "You'll learn why habits feel impossible.",
  readTime = 7,
  xpAward = 20,
  progress = 20,
  chapterImage = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
  continueHref,
}: {
  chapterNumber?: number
  title?: string
  subtitle?: string
  readTime?: number
  xpAward?: number
  progress?: number
  chapterImage?: string
  continueHref?: string
}) {
  const targetHref = continueHref ?? `/read/chapter-${chapterNumber}`
  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        {/* Left: Full-bleed chapter image */}
        <div className="relative h-[clamp(160px,30vw,200px)] w-full lg:h-auto lg:w-[260px] shrink-0 overflow-hidden">
          <Image
            src={chapterImage}
            alt={`Chapter ${chapterNumber}`}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 260px"
          />
          {/* Soft gradient overlay for better text/badge contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-transparent" />

          {/* IN PROGRESS badge */}
          <div className="absolute left-3 top-3 sm:left-4 sm:top-4 z-10">
            <span className="rounded-full bg-orange-500 px-2.5 py-1 sm:px-3 sm:py-1.5 text-[clamp(10px,1.8vw,12px)] font-black text-white shadow-sm">
              IN PROGRESS
            </span>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-[clamp(16px,3vw,24px)]">
          {/* Top row: badges */}
          <div className="flex items-center justify-between gap-3 sm:gap-4 flex-wrap">
            <div className="flex items-center gap-2 sm:gap-3">
              <span className="rounded-full bg-orange-100 dark:bg-orange-900/30 px-2.5 py-1 sm:px-3 text-[clamp(10px,1.8vw,12px)] font-bold text-orange-600 dark:text-orange-400">
                IN PROGRESS
              </span>
              <span className="flex items-center gap-1 text-[clamp(12px,2vw,14px)] font-semibold text-slate-500 dark:text-slate-400">
                <span>⏱</span> {readTime} min
              </span>
            </div>
            <div className="flex items-center gap-1 text-[clamp(12px,2vw,14px)] font-semibold text-slate-500 dark:text-slate-400">
              <span>📁</span> {xpAward} XP
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-3 sm:mt-4 text-[clamp(1rem,3vw,1.25rem)] font-black text-slate-800 dark:text-slate-100 leading-tight">
            Chapter {chapterNumber}: {title}
          </h3>
          
          {/* Subtitle */}
          <p className="mt-2 text-[clamp(13px,2vw,14px)] text-slate-500 dark:text-slate-400 line-clamp-2">{subtitle}</p>

          {/* Progress row */}
          <div className="mt-4 sm:mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4">
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="text-[clamp(12px,2vw,14px)] font-semibold text-slate-600 dark:text-slate-300">Progress</span>
              <div className="h-2.5 w-full max-w-[180px] sm:w-[180px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-[clamp(12px,2vw,14px)] font-black text-slate-700 dark:text-slate-200">{progress}%</span>
              <span className="text-slate-300 dark:text-slate-600 mx-1 hidden sm:inline">·</span>
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-base sm:text-lg ${i <= 3 ? 'text-amber-400' : 'text-slate-300 dark:text-slate-600'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={targetHref}
              className="rounded-xl bg-slate-900 dark:bg-slate-700 px-[clamp(16px,3vw,20px)] py-[clamp(8px,1.5vh,10px)] text-[clamp(12px,2vw,14px)] font-black text-white hover:bg-slate-800 dark:hover:bg-slate-600 transition-colors whitespace-nowrap w-full sm:w-auto text-center"
            >
              Continue →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
