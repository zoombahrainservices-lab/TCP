'use client'

import type { StudentOverallProgress } from '@/app/actions/progress'

interface ProgressDisplayProps {
  progress: StudentOverallProgress
  variant?: 'full' | 'compact'
}

export default function ProgressDisplay({ progress, variant = 'full' }: ProgressDisplayProps) {
  const {
    completedPhases,
    totalPhases,
    completionPercentage,
    completedChapters,
    totalChapters,
    completedZones,
    totalZones,
  } = progress

  if (variant === 'compact') {
    return (
      <div className="flex items-center gap-3">
        <div className="flex-1">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-[var(--color-charcoal)]">
              {completionPercentage}%
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-3">
            <div
              className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {completedPhases} / {totalPhases} phases completed
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Overall Progress */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <span className="text-lg font-semibold text-[var(--color-charcoal)]">
            Overall Progress
          </span>
          <span className="text-2xl font-bold text-[var(--color-charcoal)]">
            {completionPercentage}%
          </span>
        </div>
        <div className="w-full bg-gray-200 rounded-full h-4 mb-2">
          <div
            className="bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 h-4 rounded-full transition-all"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
        <div className="text-center text-base text-gray-700 font-medium">
          {completedPhases} / {totalPhases} Learning Phases Completed
        </div>
      </div>

      {/* Breakdown Stats */}
      <div className="grid grid-cols-3 gap-4 pt-4 border-t border-gray-200">
        {/* Zones */}
        <div className="text-center">
          <div className="text-3xl font-bold text-red-600 mb-1">
            {completedZones}/{totalZones}
          </div>
          <div className="text-sm text-gray-600">Zones</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((completedZones / totalZones) * 100)}% Complete
          </div>
        </div>

        {/* Chapters */}
        <div className="text-center">
          <div className="text-3xl font-bold text-orange-600 mb-1">
            {completedChapters}/{totalChapters}
          </div>
          <div className="text-sm text-gray-600">Chapters</div>
          <div className="text-xs text-gray-500 mt-1">
            {Math.round((completedChapters / totalChapters) * 100)}% Complete
          </div>
        </div>

        {/* Phases */}
        <div className="text-center">
          <div className="text-3xl font-bold text-purple-600 mb-1">
            {completedPhases}/{totalPhases}
          </div>
          <div className="text-sm text-gray-600">Phases</div>
          <div className="text-xs text-gray-500 mt-1">
            {completionPercentage}% Complete
          </div>
        </div>
      </div>

      {/* Current Position */}
      {progress.currentZone && progress.currentChapter && progress.currentPhase && (
        <div className="pt-4 border-t border-gray-200">
          <div className="text-sm text-gray-600 mb-1">Current Position:</div>
          <div className="text-base font-semibold text-[var(--color-charcoal)]">
            Zone {progress.currentZone} • Chapter {progress.currentChapter} • Phase {progress.currentPhase}
          </div>
        </div>
      )}
    </div>
  )
}
