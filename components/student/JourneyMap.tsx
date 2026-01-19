'use client'

import Link from 'next/link'
import type { ZoneProgress } from '@/app/actions/zones'
import styles from './JourneyMap.module.css'

interface JourneyMapProps {
  zones: ZoneProgress[]
  currentZoneId: number | null
  currentChapterId: number | null
  onZoneClick?: (zoneId: number) => void
  className?: string
}

const ZONE_COLORS: Record<number, string> = {
  1: '#ff4444', // Red - Focus Chamber
  2: '#ff9f2d', // Orange - Connection Hub  
  3: '#ffd93b', // Yellow - Alliance Forge
  4: '#4cd964', // Green - Influence Vault
  5: '#21b2ff', // Blue - Mastery Peak
}

const LOCK_COLOR = '#C7CBD1'

// Zone color classes mapping
const ZONE_CLASSES: Record<number, string> = {
  1: styles.zoneRed,
  2: styles.zoneOrange,
  3: styles.zoneYellow,
  4: styles.zoneGreen,
  5: styles.zoneBlue,
}

export default function JourneyMap({ 
  zones, 
  currentZoneId, 
  currentChapterId,
  onZoneClick,
  className = '' 
}: JourneyMapProps) {
  return (
    <div className={`relative ${className}`}>
      {/* Horizontal Journey Map */}
      <div className="relative flex items-center justify-center gap-8 px-8 py-8">
        {zones.map((zoneProgress, index) => {
          const { zone, completedChapters, totalChapters, completionPercentage, isUnlocked } = zoneProgress
          const isFullyCompleted = completedChapters === totalChapters
          const isCurrent = zone.id === currentZoneId
          const zoneColor = ZONE_COLORS[zone.zone_number] || zone.color || '#3b82f6'

          const zoneClass = isUnlocked 
            ? (ZONE_CLASSES[zone.zone_number] || styles.zoneGrey)
            : styles.zoneGrey
          
          const isActive = isCurrent || (isUnlocked && zone.zone_number === 1)
          const delayClass = styles[`zoneDelay${index}` as keyof typeof styles] || ''
          
          return (
            <div key={zone.id} className="flex items-center">
              {/* Zone Node */}
              <div 
                className={`flex flex-col items-center ${styles.zone} ${zoneClass} ${
                  isCurrent ? styles.zoneCurrent : ''
                } ${isActive ? styles.zoneActive : ''} ${
                  !isActive && isUnlocked && zone.zone_number > 1 ? styles.zoneActivating : ''
                } ${delayClass}`}
                style={{
                  '--zone-delay': `${index * 1.2}s`,
                } as React.CSSProperties}
              >
                <Link
                  href={isUnlocked ? `/student/zone/${zone.id}` : '#'}
                  className={`relative ${isUnlocked ? 'cursor-pointer' : 'cursor-not-allowed'}`}
                  onClick={(e) => {
                    if (!isUnlocked) {
                      e.preventDefault()
                    } else if (onZoneClick) {
                      e.preventDefault()
                      onZoneClick(zone.id)
                    }
                  }}
                >
                  {/* Zone Circle */}
                  <div
                    className={`${styles.zoneCircle} relative w-24 h-24 rounded-full flex flex-col items-center justify-center border-4 transition-all duration-300 ${
                      isUnlocked ? 'hover:scale-110' : 'opacity-50'
                    } ${isFullyCompleted ? 'shadow-lg shadow-amber-500/50' : ''}`}
                    style={{
                      backgroundColor: isUnlocked ? `${zoneColor}20` : '#1e293b',
                    }}
                  >
                    {/* Lock Icon for locked zones */}
                    {!isUnlocked && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <svg className="w-8 h-8 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                    )}

                    {/* Zone Icon */}
                    {isUnlocked && (
                      <div className="text-4xl mb-1">{zone.icon || '🔷'}</div>
                    )}

                    {/* Completion Badge */}
                    {isFullyCompleted && (
                      <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-amber-500 flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                    )}

                    {/* Current Mission Badge */}
                    {isCurrent && isUnlocked && (
                      <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 translate-y-full">
                        <div className="mt-2 px-2 py-1 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-xs font-bold whitespace-nowrap">
                          🎯 Current
                        </div>
                      </div>
                    )}
                  </div>
                </Link>

                {/* Zone Info */}
                <div className="mt-8 text-center">
                  <div className="text-xs font-semibold text-slate-500 mb-1">
                    Zone {zone.zone_number}
                  </div>
                  <div
                    className="text-sm font-bold mb-2 max-w-[120px]"
                    style={{ color: isUnlocked ? zoneColor : LOCK_COLOR }}
                  >
                    {zone.name}
                  </div>

                  {/* Progress Bar */}
                  {isUnlocked && (
                    <div className="w-24">
                      <div className="w-full bg-slate-800 rounded-full h-1.5 mb-1">
                        <div
                          className="h-1.5 rounded-full transition-all"
                          style={{
                            width: `${completionPercentage}%`,
                            backgroundColor: isFullyCompleted ? '#f59e0b' : zoneColor,
                          }}
                        />
                      </div>
                      <div className="text-xs text-slate-400">
                        {completionPercentage}%
                      </div>
                    </div>
                  )}

                  {/* Locked Message */}
                  {!isUnlocked && (
                    <div className="text-xs text-slate-500 max-w-[120px]">
                      Complete Zone {zone.zone_number - 1}
                    </div>
                  )}
                </div>
              </div>

              {/* Connector Line */}
              {index < zones.length - 1 && (
                <div 
                  className={`h-1 w-8 relative ${isUnlocked && zones[index + 1].isUnlocked ? styles.connectorActive : styles.connectorLine}`}
                  style={{ 
                    marginTop: '-80px',
                    '--zone-color': zoneColor,
                    '--zone-delay': `${index * 2}s`,
                  } as React.CSSProperties}
                >
                  {/* Base line - now handled by connectorActive/connectorLine classes */}
                  
                  {/* Arrow */}
                  {isUnlocked && zones[index + 1].isUnlocked && (
                    <div
                      className="absolute right-0 top-1/2 transform translate-x-1/2 -translate-y-1/2 z-10"
                      style={{ color: zoneColor }}
                    >
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
