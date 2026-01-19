'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import Button from '@/components/ui/Button'
import type { LevelProgress } from '@/lib/xp'

interface SystemStatusPanelProps {
  level: number
  xp: number
  levelProgress: LevelProgress
  currentChapterId?: number | null
  currentZone?: number | null
  currentChapter?: number | null
  currentPhase?: number | null
  missionsCompleted?: number
  zonesMastered?: number
  className?: string
}

export default function SystemStatusPanel({
  level,
  xp,
  levelProgress,
  currentChapterId,
  currentZone,
  currentChapter,
  currentPhase,
  missionsCompleted = 0,
  zonesMastered = 0,
  className = '',
}: SystemStatusPanelProps) {
  const progressPercent = Math.round(levelProgress.progress * 100)
  const xpInCurrentLevel = xp - levelProgress.currentLevelXp
  const xpNeededForLevel = levelProgress.nextLevelXp - levelProgress.currentLevelXp

  return (
    <Card className={`bg-slate-900/70 text-white shadow-lg ring-1 ring-white/5 ${className}`}>
      <div className="space-y-6">
        {/* Header */}
        <div className="border-b border-slate-700 pb-4">
          <h3 className="text-lg font-semibold text-slate-300 uppercase tracking-wider text-sm">
            System Status
          </h3>
        </div>

        {/* Agent Level - Large and Prominent */}
        <div className="text-center py-4">
          <div className="text-slate-400 text-xs uppercase tracking-wider mb-2">
            Agent Level
          </div>
          <div className="text-6xl font-bold bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            {level}
          </div>
        </div>

        {/* XP Display */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl">⚡</span>
              <span className="text-sm font-semibold text-slate-300">Experience Points</span>
            </div>
            <span className="text-lg font-bold text-green-400">
              {xp.toLocaleString()}
            </span>
          </div>

          {/* Level Progress Bar */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>{xpInCurrentLevel.toLocaleString()} XP</span>
              <span>{progressPercent}% to Level {level + 1}</span>
              <span>{xpNeededForLevel.toLocaleString()} XP</span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden">
              <div
                className="bg-gradient-to-r from-green-400 to-cyan-400 h-3 rounded-full transition-all duration-500 relative"
                style={{ width: `${progressPercent}%` }}
              >
                {/* Shimmer effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
              </div>
            </div>
            <div className="text-center text-xs text-slate-500">
              {levelProgress.xpNeeded.toLocaleString()} XP needed for next level
            </div>
          </div>
        </div>

        {/* Current Mission Display */}
        {currentZone && currentChapter && currentPhase && (
          <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700">
            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1 text-center">
              Current Mission
            </div>
            <div className="text-sm text-white text-center font-semibold">
              Zone {currentZone} · Chapter {currentChapter} · Phase {currentPhase}
            </div>
          </div>
        )}

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-700">
          <div className="text-center">
            <div className="text-2xl font-bold text-cyan-400">{missionsCompleted}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Missions Complete
            </div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">{zonesMastered}</div>
            <div className="text-xs text-slate-400 uppercase tracking-wider mt-1">
              Zones Mastered
            </div>
          </div>
        </div>

        {/* CTA Button */}
        {currentChapterId ? (
          <Link href={`/student/chapter/${currentChapterId}`} className="block">
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white font-bold py-3"
            >
              🎯 Continue Mission
            </Button>
          </Link>
        ) : (
          <Link href="/student/zones" className="block">
            <Button
              variant="primary"
              className="w-full bg-gradient-to-r from-green-500 to-cyan-500 hover:from-green-600 hover:to-cyan-600 text-white font-bold py-3"
            >
              🚀 Start New Mission
            </Button>
          </Link>
        )}
      </div>

      {/* Add shimmer animation styles */}
      <style jsx>{`
        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </Card>
  )
}
