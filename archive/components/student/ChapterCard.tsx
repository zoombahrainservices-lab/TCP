'use client'

import Link from 'next/link'
import type { ChapterProgress } from '@/app/actions/chapters'
import PhaseIcon from './PhaseIcon'

interface ChapterCardProps {
  chapterProgress: ChapterProgress
}

const phaseTypes = ['power-scan', 'secret-intel', 'visual-guide', 'field-mission', 'level-up'] as const

export default function ChapterCard({ chapterProgress }: ChapterCardProps) {
  const { chapter, totalPhases, completedPhases, currentPhase, isUnlocked, completionPercentage } = chapterProgress

  const isCompleted = completedPhases === totalPhases
  const isInProgress = completedPhases > 0 && !isCompleted

  return (
    <Link
      href={isUnlocked ? `/student/chapter/${chapter.id}` : '#'}
      className={isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
    >
      <div className={`bg-white border-2 rounded-lg p-4 transition-all ${
        isUnlocked
          ? 'hover:shadow-lg hover:border-blue-400'
          : 'bg-gray-50 border-gray-300 opacity-60'
      } ${
        isCompleted ? 'border-green-500' : isInProgress ? 'border-yellow-500' : ''
      }`}>
        
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="text-xs font-semibold text-gray-500 mb-1">
              Chapter {chapter.chapter_number}
            </div>
            <h3 className="text-base font-bold text-[var(--color-charcoal)] mb-1">
              {chapter.title}
            </h3>
            {chapter.subtitle && (
              <p className="text-xs text-gray-600">{chapter.subtitle}</p>
            )}
          </div>

          {/* Status Badge */}
          {isCompleted && (
            <div className="flex-shrink-0 ml-2">
              <div className="w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            </div>
          )}

          {!isUnlocked && (
            <div className="flex-shrink-0 ml-2 text-gray-400">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
            </div>
          )}
        </div>

        {/* Phase Progress Indicators */}
        {isUnlocked && (
          <>
            <div className="flex items-center justify-between gap-1 mb-2">
              {phaseTypes.map((phaseType, index) => {
                const phaseNumber = index + 1
                const isPhaseCompleted = phaseNumber <= completedPhases
                const isCurrentPhase = phaseNumber === currentPhase

                return (
                  <div key={phaseType} className="relative flex-1">
                    <PhaseIcon
                      phase={phaseType}
                      size="sm"
                      completed={isPhaseCompleted}
                      current={isCurrentPhase}
                    />
                  </div>
                )
              })}
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
              <div
                className={`h-2 rounded-full transition-all ${
                  isCompleted ? 'bg-green-500' : isInProgress ? 'bg-yellow-500' : 'bg-blue-500'
                }`}
                style={{ width: `${completionPercentage}%` }}
              />
            </div>

            {/* Progress Text */}
            <div className="text-xs text-center text-gray-600">
              {completedPhases}/{totalPhases} Phases Completed
              {isInProgress && currentPhase && (
                <span className="ml-1 font-semibold">· Phase {currentPhase} Next</span>
              )}
            </div>
          </>
        )}

        {!isUnlocked && (
          <div className="text-xs text-center text-gray-500 py-2">
            Complete previous chapter to unlock
          </div>
        )}
      </div>
    </Link>
  )
}
