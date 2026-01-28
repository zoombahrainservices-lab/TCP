'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'

export type Zone = {
  id: number
  name: string
  icon: string
  color: string
  bgColor: string
  borderColor: string
  days: [number, number] // [startDay, endDay]
  unlocked: boolean
  completed: number // number of days completed in zone
  total: number // total days in zone
}

interface ZoneMapProps {
  completedDays: number[]
  dayStatuses: Record<number, 'completed' | 'in-progress' | 'not-started'>
  className?: string
}

export default function ZoneMap({ completedDays, dayStatuses, className = '' }: ZoneMapProps) {
  const zones: Zone[] = [
    {
      id: 1,
      name: 'THE ATTENTION HEIST',
      icon: '🔴',
      color: 'text-red-600',
      bgColor: 'bg-red-50',
      borderColor: 'border-red-300',
      days: [1, 7],
      unlocked: true, // Zone 1 always unlocked
      completed: completedDays.filter(d => d >= 1 && d <= 7).length,
      total: 7
    },
    {
      id: 2,
      name: 'The Connection Hub',
      icon: '🟠',
      color: 'text-orange-600',
      bgColor: 'bg-orange-50',
      borderColor: 'border-orange-300',
      days: [8, 14],
      unlocked: completedDays.includes(7),
      completed: completedDays.filter(d => d >= 8 && d <= 14).length,
      total: 7
    },
    {
      id: 3,
      name: 'The Alliance Forge',
      icon: '🟡',
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-yellow-300',
      days: [15, 21],
      unlocked: completedDays.includes(14),
      completed: completedDays.filter(d => d >= 15 && d <= 21).length,
      total: 7
    },
    {
      id: 4,
      name: 'The Influence Vault',
      icon: '🟢',
      color: 'text-green-600',
      bgColor: 'bg-green-50',
      borderColor: 'border-green-300',
      days: [22, 28],
      unlocked: completedDays.includes(21),
      completed: completedDays.filter(d => d >= 22 && d <= 28).length,
      total: 7
    },
    {
      id: 5,
      name: 'The Mastery Peak',
      icon: '🔵',
      color: 'text-blue-600',
      bgColor: 'bg-blue-50',
      borderColor: 'border-blue-300',
      days: [29, 30],
      unlocked: completedDays.includes(28),
      completed: completedDays.filter(d => d >= 29 && d <= 30).length,
      total: 2
    }
  ]

  return (
    <div className={`grid grid-cols-5 gap-2 md:gap-4 ${className}`}>
      {zones.map((zone) => {
        const isFullyCompleted = zone.completed === zone.total
        const hasProgress = zone.completed > 0 || dayStatuses[zone.days[0]] === 'in-progress'

        return (
          <Link
            key={zone.id}
            href={zone.unlocked ? `/student/zone/${zone.id}` : '#'}
            className={zone.unlocked ? 'cursor-pointer' : 'cursor-not-allowed'}
          >
            <Card
              className={`relative text-center p-3 md:p-4 transition-all ${
                zone.unlocked
                  ? `hover:shadow-lg hover:scale-105 ${zone.bgColor} ${zone.borderColor} border-2`
                  : 'bg-gray-100 border-gray-300 border-2 opacity-50'
              } ${
                isFullyCompleted ? 'ring-2 ring-[var(--color-amber)]' : ''
              }`}
            >
              {/* Lock Icon for locked zones */}
              {!zone.unlocked && (
                <div className="absolute top-2 right-2 text-gray-400">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
              )}

              {/* Zone Icon */}
              <div className="text-3xl md:text-4xl mb-2">{zone.icon}</div>

              {/* Zone Name */}
              <div className={`text-xs md:text-sm font-semibold mb-2 ${zone.unlocked ? zone.color : 'text-gray-500'}`}>
                {zone.name}
              </div>

              {/* Day Range */}
              <div className="text-xs text-gray-600 mb-2">
                Days {zone.days[0]}-{zone.days[1]}
              </div>

              {/* Progress Indicator */}
              {zone.unlocked && (
                <div className="mt-2">
                  <div className="text-xs font-medium text-gray-700 mb-1">
                    {zone.completed}/{zone.total}
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full transition-all ${
                        isFullyCompleted ? 'bg-[var(--color-amber)]' : zone.bgColor.replace('50', '400')
                      }`}
                      style={{ width: `${(zone.completed / zone.total) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </Card>
          </Link>
        )
      })}
    </div>
  )
}
