import Link from 'next/link'
import Image from 'next/image'
import Card from '../ui/Card'
import { getChapterSlug } from '@/lib/guided-book/navigation'

export default function TodaysFocusCard({
  chapterNumber = 1,
  title = 'Chapter Title',
  subtitle = 'Chapter subtitle',
  readTime = 7,
  progress = 0,
  xpAward = 70,
  continueHref,
  chapterImage = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
}: {
  chapterNumber?: number
  title?: string
  subtitle?: string
  readTime?: number
  progress?: number
  xpAward?: number
  continueHref?: string
  chapterImage?: string
}) {
  const href = continueHref ?? `/read/${getChapterSlug(chapterNumber)}`
  return (
    <Card className="relative overflow-hidden">
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-16 -top-16 h-56 w-56 rounded-full bg-amber-100/60 dark:bg-amber-900/20 blur-3xl" />
        <div className="absolute right-20 top-0 h-48 w-48 rounded-full bg-blue-50/50 dark:bg-blue-900/10 blur-3xl" />
      </div>

      <div className="relative">
        {/* Top section: Chapter image + main info */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-5 p-[clamp(16px,3vw,24px)] pb-4">
          {/* Chapter image thumbnail */}
          <div className="relative h-24 w-24 sm:h-28 sm:w-28 rounded-2xl overflow-hidden shrink-0 ring-2 ring-slate-200 dark:ring-slate-700">
            <Image
              src={
                chapterImage.endsWith('.jpeg') || chapterImage.endsWith('.jpg')
                  ? chapterImage.replace(/\.(jpeg|jpg)$/, '-sm.webp')
                  : chapterImage
              }
              alt={`Chapter ${chapterNumber}`}
              fill
              className="object-cover"
              sizes="112px"
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📖</span>
              <h2 className="text-[clamp(1.25rem,3.5vw,1.75rem)] font-black text-slate-800 dark:text-slate-100">
                Today&apos;s Focus
              </h2>
            </div>

            <h3 className="text-[clamp(1rem,2.5vw,1.25rem)] font-bold text-slate-700 dark:text-slate-200 leading-tight">
              Chapter {chapterNumber}: {title}
            </h3>

            {subtitle && (
              <p className="mt-1.5 text-[clamp(13px,2vw,14px)] text-slate-500 dark:text-slate-400 line-clamp-2">
                {subtitle}
              </p>
            )}

            <div className="mt-3 flex flex-wrap items-center gap-3 text-[clamp(12px,2vw,14px)]">
              <div className="flex items-center gap-1.5 font-semibold text-slate-600 dark:text-slate-300">
                <span>⏱</span>
                <span>{readTime} min</span>
              </div>
              <span className="text-slate-300 dark:text-slate-600">·</span>
              <div className="flex items-center gap-1.5 font-semibold text-orange-600 dark:text-orange-400">
                <span>🔥</span>
                <span>+{xpAward} XP</span>
              </div>
            </div>
          </div>
        </div>

        {/* Progress bar section */}
        <div className="px-[clamp(16px,3vw,24px)] pb-5">
          <div className="flex items-center justify-between gap-3 mb-2">
            <span className="text-[clamp(12px,2vw,13px)] font-semibold text-slate-600 dark:text-slate-300">
              Progress
            </span>
            <span className="text-[clamp(13px,2vw,15px)] font-black text-slate-700 dark:text-slate-200">
              {progress}%
            </span>
          </div>
          <div className="h-3 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
            <div
              className="h-full rounded-full bg-gradient-to-r from-green-400 to-green-500 transition-all duration-500"
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>

          {/* Stars */}
          <div className="flex items-center justify-center gap-1 mt-3">
            {[1, 2, 3, 4, 5].map((i) => (
              <span
                key={i}
                className={`text-xl sm:text-2xl transition-all ${
                  i <= Math.ceil((progress / 100) * 5)
                    ? 'text-amber-400 scale-110'
                    : 'text-slate-300 dark:text-slate-600'
                }`}
              >
                ★
              </span>
            ))}
          </div>
        </div>

        {/* CTA section - full width */}
        <div className="bg-gradient-to-r from-orange-500/5 to-orange-400/5 dark:from-orange-500/10 dark:to-orange-400/10 border-t border-slate-200/60 dark:border-slate-700 px-[clamp(16px,3vw,24px)] py-4">
          <Link
            href={href}
            className="block w-full rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-3.5 text-center text-[clamp(14px,2.5vw,16px)] font-black text-white shadow-md hover:shadow-lg hover:brightness-105 transition-all"
          >
            Continue Chapter {chapterNumber} →
          </Link>
          <p className="mt-2 text-center text-[clamp(11px,2vw,12px)] text-slate-500 dark:text-slate-400">
            Pick up where you left off
          </p>
        </div>
      </div>
    </Card>
  )
}
