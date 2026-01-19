import { getRank } from '@/lib/ranking'
import Card from '@/components/ui/Card'
import type { LevelProgress } from '@/lib/xp'

interface AgentProfileProps {
  fullName: string
  completedDays: number
  xp?: number
  level?: number
  levelProgress?: LevelProgress
}

export default function AgentProfile({
  fullName,
  completedDays,
  xp = 0,
  level = 1,
  levelProgress,
}: AgentProfileProps) {
  const rank = getRank(completedDays)
  const firstName = fullName.split(' ')[0]
  const progress = levelProgress || {
    level,
    currentLevelXp: 0,
    nextLevelXp: 100,
    progress: 0,
    xpNeeded: 100,
  }
  const levelProgressPercent = Math.round(progress.progress * 100)

  return (
    <Card className="bg-slate-900/70 text-slate-50 shadow-lg ring-1 ring-white/5">
      <div className="flex items-center gap-4">
        {/* Avatar Placeholder */}
        <div className="w-16 h-16 md:w-20 md:h-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-2xl md:text-3xl font-bold flex-shrink-0">
          {firstName.charAt(0).toUpperCase()}
        </div>
        
        {/* Name, Level, and Rank */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h2 className="text-lg md:text-xl font-semibold text-white truncate">
              {firstName}
            </h2>
            <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-blue-500/20 border border-blue-500/30">
              <span className="text-xs font-semibold text-blue-300">Level {level}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{rank.icon}</span>
            <span className="text-sm md:text-base font-semibold text-slate-300">
              {rank.name}
            </span>
          </div>

          {/* XP Display */}
          <div className="mt-3 space-y-1">
            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-400">XP: {xp.toLocaleString()}</span>
              <span className="text-slate-400">
                {levelProgressPercent}% to Level {level + 1}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full transition-all"
                style={{ width: `${levelProgressPercent}%` }}
              />
            </div>
          </div>

          {/* Rank Progress */}
          {rank.nextRank && (
            <div className="mt-3 pt-3 border-t border-slate-700">
              <div className="text-xs text-slate-400 mb-1">
                {rank.progressToNext}% to {rank.nextRank}
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5">
                <div
                  className="bg-amber-400 h-1.5 rounded-full transition-all"
                  style={{ width: `${rank.progressToNext}%` }}
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </Card>
  )
}
