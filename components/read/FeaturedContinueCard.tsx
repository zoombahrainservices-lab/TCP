'use client'

import Image from 'next/image'
import Link from 'next/link'

export function FeaturedContinueCard({
  title,
  chapterNumber,
  href,
  imageSrc,
}: {
  title: string
  chapterNumber: number
  href: string
  imageSrc?: string | null
}) {
  return (
    <Link
      href={href}
      className="group block overflow-hidden rounded-3xl border border-slate-200/70 dark:border-slate-800/80 bg-white/90 dark:bg-gray-900/70 ring-1 ring-black/5 dark:ring-white/5 shadow-sm hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30 transition-all hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60"
    >
      <div className="grid grid-cols-1 md:grid-cols-[1.25fr_1fr]">
        <div className="relative aspect-[16/9] md:aspect-auto md:min-h-[220px] bg-slate-100 dark:bg-slate-800">
          {imageSrc ? (
            <Image
              src={imageSrc}
              alt={`Chapter ${chapterNumber}`}
              fill
              priority
              sizes="(min-width: 768px) 60vw, 100vw"
              className="object-cover opacity-95"
            />
          ) : (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/35 via-black/0 to-black/0 md:bg-gradient-to-r md:from-black/25 md:via-black/0 md:to-black/0" />
          <div className="absolute left-5 bottom-5">
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide bg-white/20 text-white ring-1 ring-white/20 backdrop-blur">
              Continue Reading
            </span>
          </div>
        </div>

        <div className="p-6 md:p-7 flex flex-col justify-between gap-5">
          <div className="space-y-2">
            <p className="text-xs font-bold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
              Chapter {chapterNumber}
            </p>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white leading-tight">
              {title}
            </h2>
            <p className="text-sm text-slate-600 dark:text-slate-400">
              Pick up right where you left off.
            </p>
          </div>

          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
              Your current chapter
            </span>
            <span className="inline-flex items-center rounded-full px-4 py-2 text-sm font-extrabold bg-orange-50 text-orange-700 ring-1 ring-orange-200 group-hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800/50 transition-colors">
              Continue →
            </span>
          </div>
        </div>
      </div>
    </Link>
  )
}

