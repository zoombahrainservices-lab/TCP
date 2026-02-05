'use client'

import Card from '../ui/Card'

export default function StreakCard({
  currentStreak = 0,
  longestStreak = 0,
}: {
  currentStreak?: number
  longestStreak?: number
}) {
  return (
    <Card className="relative overflow-hidden">
      {/* Subtle gradient wash */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute right-0 top-0 h-32 w-32 rounded-full bg-amber-100/50 blur-2xl" />
      </div>

      {/* Large faded fire emoji in background */}
      <div className="pointer-events-none absolute right-4 top-4 text-6xl opacity-20">
        🔥
      </div>

      <div className="relative p-6">
        {/* Header */}
        <div className="flex items-center gap-3">
          <div className="grid h-12 w-12 place-items-center rounded-2xl bg-gradient-to-br from-amber-100 to-amber-200 ring-1 ring-amber-300/30">
            <span className="text-2xl">🔥</span>
          </div>
          <div>
            <h2 className="text-2xl font-black text-slate-800">Streak</h2>
            <div className="mt-0.5 flex items-center gap-1.5 text-sm font-semibold text-slate-500">
              <span>🔥</span>
              <span>Day {currentStreak} Streak</span>
            </div>
          </div>
        </div>

        {/* Stats boxes */}
        <div className="mt-5 grid grid-cols-2 gap-3">
          <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
            <div className="text-lg mb-1">🔥</div>
            <div className="text-xl font-black text-slate-800">{currentStreak} Days</div>
          </div>
          <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-200/60">
            <div className="text-lg mb-1">🔥</div>
            <div className="text-xl font-black text-slate-800">{longestStreak} Days</div>
          </div>
        </div>
      </div>
    </Card>
  )
}
