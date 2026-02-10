'use client'

import Image from 'next/image'
import Link from 'next/link'
import Card from '../ui/Card'

export type ChapterReportRow = {
  title: string
  completed: string
  completedCount: number
  totalSections: number
  xp: number
}

const CHAPTER_1_IMAGE = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg'

export default function ChapterProgressProfileCard({
  chapterReports,
}: {
  chapterReports: ChapterReportRow[]
}) {
  const totalSections = 6
  const totalChaptersInSystem = Math.max(chapterReports.length, 1)
  const totalCompletedSections = chapterReports.reduce((sum, c) => sum + c.completedCount, 0)
  const totalPossibleSections = chapterReports.reduce((sum, c) => sum + c.totalSections, 0) || totalSections
  const progress = totalPossibleSections > 0
    ? Math.round((totalCompletedSections / totalPossibleSections) * 100)
    : 0
  const chaptersWithProgress = chapterReports.filter((c) => c.completedCount > 0).length
  const fullyCompletedChapters = chapterReports.filter(
    (c) => c.completedCount === c.totalSections
  ).length

  const description =
    fullyCompletedChapters === 0
      ? 'Start your first chapter to see progress here.'
      : `You've completed ${fullyCompletedChapters} chapter${fullyCompletedChapters === 1 ? '' : 's'}.`

  const filledStars = Math.ceil((progress / 100) * 5)

  return (
    <Card className="overflow-hidden">
      <div className="flex flex-col lg:flex-row">
        <div className="relative h-[200px] w-full lg:h-auto lg:w-[240px] shrink-0 bg-gradient-to-br from-orange-300 via-orange-200 to-amber-100 overflow-hidden">
          <div className="absolute left-4 top-4 z-10">
            <span className="rounded-full bg-orange-500 px-3 py-1.5 text-xs font-black text-white shadow-sm">
              CHAPTERS
            </span>
          </div>
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 p-4">
            <div className="relative h-[120px] w-[120px] rounded-full overflow-hidden shadow-lg ring-2 ring-white/60">
              <Image
                src={CHAPTER_1_IMAGE}
                alt="Chapter 1"
                fill
                className="object-cover"
                sizes="120px"
              />
            </div>
            <span className="text-sm font-bold text-orange-800 drop-shadow-sm">
              {chaptersWithProgress} of {totalChaptersInSystem} chapter
              {totalChaptersInSystem !== 1 ? 's' : ''}
            </span>
          </div>
        </div>

        <div className="flex-1 p-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="rounded-full bg-orange-100 px-3 py-1 text-xs font-bold text-orange-600">
                PROGRESS
              </span>
              <span className="flex items-center gap-1 text-sm font-semibold text-slate-500 dark:text-slate-400">
                <span>📊</span> {progress}% complete
              </span>
            </div>
          </div>

          <h3 className="mt-4 text-xl font-black text-slate-800 dark:text-slate-100 leading-tight">
            Chapter Progress
          </h3>
          <p className="mt-2 text-slate-500 dark:text-slate-400">{description}</p>

          <div className="mt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3">
              <span className="text-sm font-semibold text-slate-600 dark:text-slate-400">
                Progress
              </span>
              <div className="h-2.5 w-[180px] overflow-hidden rounded-full bg-slate-200">
                <div
                  className="h-full rounded-full bg-gradient-to-r from-orange-400 to-orange-500 transition-all"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                />
              </div>
              <span className="text-sm font-black text-slate-700 dark:text-slate-200">
                {progress}%
              </span>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <span
                    key={i}
                    className={`text-lg ${
                      i <= filledStars ? 'text-amber-400' : 'text-slate-300 dark:text-slate-500'
                    }`}
                  >
                    ★
                  </span>
                ))}
              </div>
            </div>

            <Link
              href="/read/stage-star-silent-struggles"
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
