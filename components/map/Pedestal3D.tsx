import * as React from 'react'

export type PedestalState = 'current' | 'completed' | 'locked' | 'unlocked'

export function Pedestal3D({
  size = 128,
  state,
  color = '#673067',
  glow = '#ff6a38',
  muted = false,
}: {
  size?: number
  state: PedestalState
  color?: string
  glow?: string
  muted?: boolean
}) {
  const id = React.useId().replace(/:/g, '')
  const isCurrent = state === 'current'
  const isLocked = state === 'locked'
  const isCompleted = state === 'completed'

  const topOpacity = isLocked ? 0.18 : isCompleted ? 0.5 : 0.82
  const rimOpacity = isLocked ? 0.26 : isCompleted ? 0.58 : 0.88
  const glowOpacity = isCurrent ? 0.82 : isCompleted ? 0.18 : 0

  const desat = muted || isLocked

  return (
    <svg width={size} height={size} viewBox="0 0 180 180" aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        {/* Top plate: 3D radial with highlight */}
        <radialGradient id={`top-${id}`} cx="48%" cy="38%" r="72%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.92)" />
          <stop offset="45%" stopColor="rgba(255,255,255,0.42)" />
          <stop offset="85%" stopColor="rgba(255,255,255,0.08)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </radialGradient>

        {/* Rim: top lighter, bottom darker for 3D cylinder */}
        <linearGradient id={`rim-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={color} stopOpacity={rimOpacity * 1.15} />
          <stop offset="35%" stopColor={color} stopOpacity={rimOpacity} />
          <stop offset="70%" stopColor={color} stopOpacity={rimOpacity * 0.7} />
          <stop offset="100%" stopColor={color} stopOpacity={rimOpacity * 0.45} />
        </linearGradient>

        {/* Rim highlight (top edge) */}
        <linearGradient id={`rimHighlight-${id}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.5)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        {/* Outer glow (current) */}
        <radialGradient id={`glow-${id}`} cx="50%" cy="52%" r="58%">
          <stop offset="0%" stopColor={glow} stopOpacity={glowOpacity} />
          <stop offset="55%" stopColor={glow} stopOpacity={glowOpacity * 0.22} />
          <stop offset="100%" stopColor={glow} stopOpacity="0" />
        </radialGradient>

        {/* Sweep highlight */}
        <linearGradient id={`sweep-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="48%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="52%" stopColor="rgba(255,255,255,0.9)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <mask id={`rimMask-${id}`}>
          <rect width="180" height="180" fill="black" />
          <ellipse cx="90" cy="108" rx="56" ry="22" fill="white" />
          <ellipse cx="90" cy="108" rx="42" ry="14" fill="black" />
        </mask>

        <filter id={`shadow-${id}`} x="-50%" y="-40%" width="200%" height="240%">
          <feDropShadow dx="0" dy="14" stdDeviation="10" floodColor="rgba(0,0,0,0.35)" />
        </filter>

        {/* Softer ground shadow blur */}
        <filter id={`groundShadow-${id}`} x="-60%" y="-20%" width="220%" height="160%">
          <feGaussianBlur in="SourceGraphic" stdDeviation="8" />
          <feOffset dx="0" dy="4" />
          <feFlood floodColor="rgba(0,0,0,0.4)" />
          <feComposite operator="in" in2="SourceAlpha" />
          <feMerge>
            <feMergeNode />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Big soft glow (current only) */}
      <ellipse
        cx="90"
        cy="108"
        rx="78"
        ry="40"
        fill={`url(#glow-${id})`}
        className={isCurrent ? 'pBreath' : ''}
      />

      {/* Ground shadow — elliptical, soft, realistic */}
      <ellipse cx="90" cy="142" rx="52" ry="14" fill="rgba(0,0,0,0.28)" />
      <ellipse cx="90" cy="140" rx="48" ry="12" fill="rgba(0,0,0,0.22)" />

      <g filter={`url(#shadow-${id})`} opacity={desat ? 0.75 : 1}>
        {/* Outer rim (3D ring) */}
        <ellipse
          cx="90"
          cy="108"
          rx="56"
          ry="22"
          fill="none"
          stroke={`url(#rim-${id})`}
          strokeWidth="12"
          strokeLinecap="round"
        />

        {/* Rim top highlight — thin inner arc */}
        <ellipse
          cx="90"
          cy="98"
          rx="50"
          ry="18"
          fill="none"
          stroke={`url(#rimHighlight-${id})`}
          strokeWidth="4"
          strokeLinecap="round"
          opacity={isLocked ? 0.2 : 0.5}
        />

        {/* Top plate (elliptical surface) */}
        <ellipse cx="90" cy="104" rx="44" ry="16" fill={`url(#top-${id})`} opacity={topOpacity} />

        {/* Inner ring (recessed) */}
        <ellipse
          cx="90"
          cy="108"
          rx="40"
          ry="15"
          fill="none"
          stroke={color}
          strokeOpacity={rimOpacity * 0.4}
          strokeWidth="5"
        />

        {/* Sweep on rim (current only) */}
        {isCurrent && (
          <g mask={`url(#rimMask-${id})`}>
            <rect
              x={-120}
              y={72}
              width={140}
              height={72}
              fill={`url(#sweep-${id})`}
              className="pSweep"
            />
          </g>
        )}
      </g>

      {isCurrent && (
        <>
          <circle cx="58" cy="92" r="2.2" fill="rgba(255,255,255,0.95)" className="pSpark" />
          <circle cx="124" cy="102" r="1.8" fill="rgba(255,255,255,0.85)" className="pSpark2" />
        </>
      )}
    </svg>
  )
}
