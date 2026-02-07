import * as React from 'react'

type RingState = 'current' | 'completed' | 'locked' | 'unlocked'

type Props = {
  size?: number
  state: RingState
  color?: string
  glowColor?: string
  className?: string
}

export function PedestalRing({
  size = 110,
  state,
  color = '#8B5CF6',
  glowColor = '#A78BFA',
  className,
}: Props) {
  const isActive = state === 'current'
  const isLocked = state === 'locked'
  const isCompleted = state === 'completed'

  const ringOpacity = isLocked ? 0.28 : isCompleted ? 0.55 : 0.75

  const glowOpacity = isActive ? 0.7 : isCompleted ? 0.22 : 0

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <radialGradient id={`ringGlow-${state}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor={glowColor} stopOpacity={glowOpacity} />
          <stop
            offset="65%"
            stopColor={glowColor}
            stopOpacity={glowOpacity * 0.25}
          />
          <stop offset="100%" stopColor={glowColor} stopOpacity="0" />
        </radialGradient>

        <linearGradient id={`ringStroke-${state}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={ringOpacity} />
          <stop offset="100%" stopColor={color} stopOpacity={ringOpacity * 0.75} />
        </linearGradient>

        <filter id="softShadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow
            dx="0"
            dy="8"
            stdDeviation="8"
            floodColor="rgba(0,0,0,0.25)"
          />
        </filter>
      </defs>

      {/* Outer glow */}
      <circle cx="60" cy="66" r="48" fill={`url(#ringGlow-${state})`} />

      {/* Base shadow */}
      <ellipse cx="60" cy="84" rx="34" ry="10" fill="rgba(0,0,0,0.18)" />

      {/* Outer ring */}
      <circle
        cx="60"
        cy="66"
        r="34"
        fill="none"
        stroke={`url(#ringStroke-${state})`}
        strokeWidth="10"
        filter="url(#softShadow)"
        strokeLinecap="round"
      />

      {/* Inner ring */}
      <circle
        cx="60"
        cy="66"
        r="22"
        fill="none"
        stroke={color}
        strokeOpacity={ringOpacity * 0.55}
        strokeWidth="6"
      />

      {/* Center plate */}
      <ellipse
        cx="60"
        cy="70"
        rx="18"
        ry="12"
        fill={isLocked ? 'rgba(255,255,255,0.18)' : 'rgba(255,255,255,0.45)'}
      />

      {/* Active shimmer line */}
      {isActive && (
        <path
          d="M30 62c10-10 50-10 60 0"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="4"
          strokeLinecap="round"
          opacity="0.9"
        />
      )}
    </svg>
  )
}
