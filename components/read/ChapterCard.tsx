'use client'

import Image from 'next/image'
import Link from 'next/link'

export type ChapterCardState = 'locked' | 'normal' | 'current' | 'completed'

export type ChapterCardProps = {
  chapterNumber: number
  title: string
  href: string
  state: ChapterCardState
  imageSrc?: string | null
  subtitle?: string | null
}

function Badge({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      className={[
        'inline-flex items-center rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide ring-1',
        className,
      ].join(' ')}
    >
      {children}
    </span>
  )
}

export function ChapterCard({
  chapterNumber,
  title,
  href,
  state,
  imageSrc,
  subtitle,
}: ChapterCardProps) {
  const isLocked = state === 'locked'
  const isCurrent = state === 'current'
  const isCompleted = state === 'completed'

  const container =
    'group relative overflow-hidden rounded-2xl border bg-white/90 dark:bg-gray-900/70 ring-1 ring-black/5 dark:ring-white/5 transition-all'

  const borderTone = isCurrent
    ? 'border-orange-200/70 dark:border-orange-500/30'
    : isCompleted
      ? 'border-emerald-200/70 dark:border-emerald-500/30'
      : 'border-slate-200/70 dark:border-slate-800/80'

  const hoverTone = isLocked
    ? ''
    : 'hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5 dark:hover:shadow-black/30'

  const inner = (
    <div className={[container, borderTone, hoverTone].join(' ')}>
      {/* Thumbnail */}
      <div className="relative w-full aspect-[16/9] bg-slate-100 dark:bg-slate-800">
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt={`Chapter ${chapterNumber}`}
            fill
            sizes="(min-width: 1024px) 33vw, (min-width: 640px) 50vw, 100vw"
            className={[
              'object-cover',
              isLocked ? 'grayscale opacity-70' : 'opacity-95',
            ].join(' ')}
            priority={isCurrent}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900" />
        )}
        <div className="absolute inset-0 ring-1 ring-inset ring-black/5 dark:ring-white/5" />

        {/* Top badges */}
        <div className="absolute left-3 top-3 flex items-center gap-2">
          <Badge className="bg-white/80 text-slate-800 ring-white/40 dark:bg-black/30 dark:text-slate-100 dark:ring-white/10 backdrop-blur">
            Chapter {chapterNumber}
          </Badge>
          {isCurrent && (
            <Badge className="bg-orange-50/90 text-orange-700 ring-orange-200/70 dark:bg-orange-900/30 dark:text-orange-300 dark:ring-orange-500/30 backdrop-blur">
              Current
            </Badge>
          )}
          {isCompleted && (
            <Badge className="bg-emerald-50/90 text-emerald-700 ring-emerald-200/70 dark:bg-emerald-900/30 dark:text-emerald-300 dark:ring-emerald-500/30 backdrop-blur">
              Completed
            </Badge>
          )}
          {isLocked && (
            <Badge className="bg-slate-100/90 text-slate-700 ring-slate-200/70 dark:bg-slate-900/40 dark:text-slate-300 dark:ring-slate-700/50 backdrop-blur">
              Locked
            </Badge>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="px-5 py-5">
        <div className="space-y-1.5">
          <h3 className="text-[15px] sm:text-base font-extrabold text-slate-900 dark:text-white leading-snug line-clamp-2">
            {title}
          </h3>
          {subtitle ? (
            <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-1">{subtitle}</p>
          ) : (
            <p className="text-sm text-slate-600 dark:text-slate-400">
              {isLocked ? 'Complete previous chapters to unlock' : 'Open chapter'}
            </p>
          )}
        </div>

        <div className="mt-4 flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {isLocked ? 'Locked' : isCompleted ? 'Done' : isCurrent ? 'Continue' : 'Start'}
          </span>
          <span
            className={[
              'inline-flex items-center rounded-full px-3 py-1 text-xs font-bold ring-1 transition-colors',
              isLocked
                ? 'bg-slate-100 text-slate-400 ring-slate-200 dark:bg-slate-900/40 dark:text-slate-500 dark:ring-slate-800'
                : 'bg-orange-50 text-orange-700 ring-orange-200 hover:bg-orange-100 dark:bg-orange-900/20 dark:text-orange-300 dark:ring-orange-800/50 dark:hover:bg-orange-900/30',
            ].join(' ')}
          >
            {isLocked ? 'Locked' : isCurrent ? 'Continue →' : 'Open →'}
          </span>
        </div>
      </div>

      {isLocked && <div className="absolute inset-0 cursor-not-allowed" aria-hidden="true" />}
    </div>
  )

  if (isLocked) return <div aria-disabled="true">{inner}</div>

  return (
    <Link href={href} className="block focus:outline-none focus-visible:ring-2 focus-visible:ring-orange-400/60 rounded-2xl">
      {inner}
    </Link>
  )
}

