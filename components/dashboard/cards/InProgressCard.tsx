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
        <div className="relative h-[200px] w-full lg:h-auto lg:w-[260px] shrink-0 overflow-hidden">
          <Image
            src={chapterImage}
            alt={`Chapter ${chapterNumber}`}
            fill
            className="object-cover"
            sizes="260px"
          />
          {/* Soft gradient overlay for better text/badge contrast */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-black/25 via-black/10 to-transparent" />

          {/* IN PROGRESS badge */}
          <div className="absolute left-4 top-4 z-10">
            <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">
              IN PROGRESS
            </span>
          </div>
        </div>

        {/* Right: Content */}
        <div className="flex-1 p-6">
          {/* Top row: badges */}
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                IN PROGRESS
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-slate-500">
                <span>⏱</span> {readTime} min
              </span>
            </div>
            <div className="flex items-center gap-1 text-sm font-semibold text-slate-500">
              <span>📁</span> {xpAward} XP
            </div>
          </div>

          {/* Title */}
          <h3 className="mt-4 text-xl font-black text-slate-800 leading-tight">
            Chapter {chapterNumber}: {title}
          </h3>
          
          {/* Subtitle */}
          <p className="mt-2 text-slate-500">{subtitle}</p>

          {/* Progress row */}
          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600">Progress</span>
              <div className="h-2.5 w-[180px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-sm font-black text-slate-700">{progress}%</span>
              <span className="text-slate-300 mx-1">·</span>
              {/* Stars */}
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-lg ${i <= 3 ? 'text-amber-400' : 'text-slate-300'}`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <Link
              href={targetHref}
              className="rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-black text-white hover:bg-slate-800 transition-colors"
            >
              Continue →
            </Link>
          </div>
        </div>
      </div>
    </Card>
  )
}
