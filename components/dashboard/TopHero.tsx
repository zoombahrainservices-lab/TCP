'use client'

import Link from 'next/link'
import Image from 'next/image'

function PillIcon({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-b from-amber-300 to-amber-500 shadow-md">
      <div className="grid h-9 w-9 place-items-center rounded-xl bg-white/70">
        {children}
      </div>
    </div>
  )
}

function LevelAvatar({ level }: { level: number }) {
  return (
    <div className="relative h-14 w-14 rounded-full bg-gradient-to-b from-amber-200 to-amber-400 p-[3px] shadow-md flex-shrink-0">
      <div className="h-full w-full rounded-full bg-white flex items-center justify-center overflow-hidden">
        <Image
          src="/slider-work-on-quizz/chapter1/chaper1-1.jpeg"
          alt="Avatar"
          width={52}
          height={52}
          className="rounded-full object-cover"
        />
      </div>
    </div>
  )
}

export default function TopHero({
  userName,
  totalXP,
  level,
  levelThreshold,
  continueHref = '/read/chapter-1',
  continueLabel = 'Continue Chapter 1 →',
}: {
  userName: string
  totalXP: number
  level: number
  levelThreshold: number
  continueHref?: string
  continueLabel?: string
}) {
  const nextThreshold = Math.floor(100 * Math.pow(level, 2.22)) || 100
  const currentThreshold = level > 1 ? Math.floor(100 * Math.pow(level - 1, 2.22)) : 0
  const progressInLevel = nextThreshold > currentThreshold
    ? ((totalXP - currentThreshold) / (nextThreshold - currentThreshold)) * 100
    : 0
  const progressPercent = Math.min(Math.max(progressInLevel, 0), 100)

  // Calculate which segments to fill (5 segments)
  const filledSegments = Math.ceil((progressPercent / 100) * 5)

  return (
    <section className="rounded-[26px] bg-white dark:bg-[#020617] shadow-[0_10px_35px_rgba(15,23,42,0.08)] ring-1 ring-slate-100 dark:ring-slate-800 transition-colors duration-300">
      <div className="relative overflow-hidden rounded-[26px] px-5 py-6">
        {/* Pink/Blue gradient background wash */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute -left-20 -top-20 h-80 w-80 rounded-full bg-gradient-to-br from-pink-200/60 to-pink-100/40 blur-3xl dark:opacity-20" />
          <div className="absolute left-1/3 top-0 h-60 w-60 rounded-full bg-blue-100/50 blur-3xl dark:opacity-10" />
          <div className="absolute right-0 top-0 h-48 w-48 rounded-full bg-amber-100/40 blur-3xl dark:opacity-10" />
        </div>

        <div className="relative flex flex-col lg:flex-row items-center gap-6">
          {/* Left: User XP Card with hero avatar */}
          <div className="flex w-full lg:w-auto lg:min-w-[320px] items-center gap-3 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 py-3 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 transition-colors duration-300">
            <LevelAvatar level={level} />
            <div className="flex-1 min-w-0">
              <div className="text-xl font-black text-slate-800 dark:text-slate-100 tracking-tight">{userName}</div>
              <div className="mt-1.5 flex items-center gap-3">
                <div className="text-sm font-bold text-slate-600 dark:text-slate-300">{totalXP} XP</div>
                <div className="h-2.5 flex-1 min-w-[100px] overflow-hidden rounded-full bg-slate-200 dark:bg-slate-700">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all"
                    style={{ width: `${progressPercent}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right: Level Progress + CTA */}
          <div className="flex w-full lg:w-auto lg:min-w-[340px] items-center justify-between gap-4 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm px-4 py-3 shadow-sm ring-1 ring-slate-200/60 dark:ring-slate-800 lg:ml-auto transition-colors duration-300">
            <div className="flex items-center gap-3">
              <PillIcon>
                <span className="text-xl">🏆</span>
              </PillIcon>
              <div>
                <div className="text-xl font-black text-slate-800 dark:text-slate-100">Level {level}</div>
                <div className="mt-1.5 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-bold text-slate-600 dark:text-slate-300">{totalXP} / {nextThreshold}</span>
                  <div className="flex gap-1">
                    {[0, 1, 2, 3, 4].map((i) => (
                      <span
                        key={i}
                        className={`h-2.5 w-5 rounded-full transition-colors ${
                          i < filledSegments
                            ? 'bg-gradient-to-r from-blue-500 to-blue-600'
                            : 'bg-slate-200'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <Link
              href={continueHref}
              className="rounded-xl bg-gradient-to-r from-orange-500 to-orange-400 px-5 py-2.5 text-xs sm:text-sm font-black text-white shadow-md hover:brightness-105 transition-all"
            >
              {continueLabel}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
