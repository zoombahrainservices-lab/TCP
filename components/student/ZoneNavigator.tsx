'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import type { ZoneProgress } from '@/app/actions/zones'

interface ZoneNavigatorProps {
  zones: ZoneProgress[]
  className?: string
}

export default function ZoneNavigator({ zones, className = '' }: ZoneNavigatorProps) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 ${className}`}>
      {zones.map((zoneProgress) => {
        const { zone, totalChapters, completedChapters, totalPhases, completedPhases, isUnlocked, completionPercentage } = zoneProgress
        const isFullyCompleted = completedChapters === totalChapters

        return (
          <Link
            key={zone.id}
            href={isUnlocked ? `/student/zone/${zone.id}` : '#'}
            className={isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
          >
            <Card
              className={`relative text-center p-4 transition-all h-full ${
                isUnlocked
                  ? `hover:shadow-lg hover:scale-105 border-2`
                  : 'bg-gray-100 border-2 border-gray-300 opacity-50'
              } ${
                isFullyCompleted ? 'ring-2 ring-[var(--color-amber)]' : ''
              }`}
              style={{
                backgroundColor: isUnlocked && zone.color ? `${zone.color}10` : undefined,
                borderColor: isUnlocked && zone.color ? zone.color : undefined,
              }}
            >
              {/* Lock Icon for locked zones */}
              {!isUnlocked && (
                <div className="absolute top-2 right-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}

              {/* Completion Badge */}
              {isFullyCompleted && (
                <div className="absolute top-2 right-2 text-[var(--color-amber)]">
                  <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
              )}

              {/* Zone Icon */}
              <div className="text-5xl mb-3">{zone.icon || '🔷'}</div>

              {/* Zone Number */}
              <div className="text-xs font-semibold text-gray-500 mb-1">
                Zone {zone.zone_number}
              </div>

              {/* Zone Name */}
              <div
                className="text-sm font-bold mb-3 min-h-[2.5rem] flex items-center justify-center"
                style={{ color: isUnlocked && zone.color ? zone.color : undefined }}
              >
                {zone.name}
              </div>

              {/* Progress Info */}
              {isUnlocked && (
                <div className="mt-3">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    {completedChapters}/{totalChapters} Chapters
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div
                      className={`h-2 rounded-full transition-all`}
                      style={{
                        width: `${completionPercentage}%`,
                        backgroundColor: isFullyCompleted ? 'var(--color-amber)' : zone.color || '#3b82f6',
                      }}
                    />
                  </div>
                  <div className="text-xs text-gray-600">
                    {completedPhases}/{totalPhases} Phases
                  </div>
                </div>
              )}

              {/* Locked Message */}
              {!isUnlocked && (
                <div className="mt-3 text-xs text-gray-500">
                  Complete previous zone to unlock
                </div>
              )}
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
