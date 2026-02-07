import * as React from 'react'

export type PedestalState = 'current' | 'completed' | 'locked' | 'unlocked'

export function PedestalUltra3D({
  size = 140,
  state,
  base = '#673067',
  ring = '#FF6A38',
}: {
  size?: number
  state: PedestalState
  base?: string
  ring?: string
}) {
  const id = React.useId().replace(/:/g, '')
  const isCurrent = state === 'current'
  const isLocked = state === 'locked'
  const isCompleted = state === 'completed'

  const baseOpacity = isLocked ? 0.32 : isCompleted ? 0.6 : 0.92
  const glowOpacity = isCurrent ? 0.95 : isCompleted ? 0.25 : 0

  return (
    <svg width={size} height={size} viewBox="0 0 220 220" aria-hidden="true">
      <defs>
        {/* Base cylinder shading */}
        <linearGradient id={`cyl-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.10)" />
          <stop offset="20%" stopColor={base} stopOpacity={baseOpacity * 0.95} />
          <stop offset="50%" stopColor={base} stopOpacity={baseOpacity} />
          <stop offset="80%" stopColor={base} stopOpacity={baseOpacity * 0.8} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.18)" />
        </linearGradient>

        {/* Top plate */}
        <radialGradient id={`top-${id}`} cx="50%" cy="35%" r="70%">
          <stop offset="0%" stopColor="rgba(255,255,255,0.80)" />
          <stop offset="55%" stopColor="rgba(255,255,255,0.25)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.12)" />
        </radialGradient>

        {/* Neon ring */}
        <linearGradient id={`neon-${id}`} x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={ring} stopOpacity="1" />
          <stop offset="100%" stopColor="rgba(255,255,255,0.85)" stopOpacity="0.85" />
        </linearGradient>

        {/* Outer bloom */}
        <radialGradient id={`bloom-${id}`} cx="50%" cy="55%" r="65%">
          <stop offset="0%" stopColor={ring} stopOpacity={glowOpacity} />
          <stop offset="55%" stopColor={ring} stopOpacity={glowOpacity * 0.25} />
          <stop offset="100%" stopColor={ring} stopOpacity="0" />
        </radialGradient>

        {/* Sweep highlight mask (only on neon ring band) */}
        <mask id={`ringMask-${id}`}>
          <rect width="220" height="220" fill="black" />
          <ellipse cx="110" cy="128" rx="76" ry="28" fill="white" />
          <ellipse cx="110" cy="128" rx="58" ry="20" fill="black" />
        </mask>

        <linearGradient id={`sweep-${id}`} x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="rgba(255,255,255,0)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.95)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="rgba(0,0,0,0.30)" />
        </filter>

        <filter id={`glow-${id}`} x="-80%" y="-80%" width="260%" height="260%">
          <feGaussianBlur stdDeviation="6" result="b" />
          <feMerge>
            <feMergeNode in="b" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      {/* Ground shadow */}
      <ellipse cx="110" cy="192" rx="92" ry="20" fill="rgba(0,0,0,0.22)" />

      {/* Bloom behind pedestal (current/completed) */}
      <ellipse
        cx="110"
        cy="132"
        rx="120"
        ry="50"
        fill={`url(#bloom-${id})`}
        className={isCurrent ? 'pBreath' : ''}
      />

      <g filter={`url(#shadow-${id})`} opacity={isLocked ? 0.78 : 1}>
        {/* Cylinder body */}
        <path
          d="M34 110
             C34 82, 70 62, 110 62
             C150 62, 186 82, 186 110
             V156
             C186 184, 150 204, 110 204
             C70 204, 34 184, 34 156
             Z"
          fill={`url(#cyl-${id})`}
        />

        {/* Top plate */}
        <ellipse cx="110" cy="110" rx="76" ry="28" fill={`url(#top-${id})`} />

        {/* Inner dish */}
        <ellipse cx="110" cy="118" rx="56" ry="20" fill="rgba(0,0,0,0.22)" opacity={0.35} />

        {/* Neon ring band */}
        <ellipse
          cx="110"
          cy="128"
          rx="76"
          ry="28"
          fill="none"
          stroke={`url(#neon-${id})`}
          strokeWidth="10"
          filter={isCurrent ? `url(#glow-${id})` : undefined}
          opacity={isLocked ? 0.25 : 0.9}
        />

        {/* Secondary ring */}
        <ellipse
          cx="110"
          cy="128"
          rx="60"
          ry="22"
          fill="none"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="4"
          opacity={isLocked ? 0.15 : 0.35}
        />

        {/* Moving sweep (current only) */}
        {isCurrent && (
          <g mask={`url(#ringMask-${id})`}>
            <rect x={-140} y={92} width={160} height={72} fill={`url(#sweep-${id})`} className="pSweep" />
          </g>
        )}
      </g>

      {/* Sparkles (current only) */}
      {isCurrent && (
        <>
          <circle cx="70" cy="92" r="2.5" fill="rgba(255,255,255,0.9)" className="pTwinkle" />
          <circle cx="148" cy="108" r="2.0" fill="rgba(255,255,255,0.8)" className="pTwinkle2" />
        </>
      )}

      <style>{`
        .pBreath { animation: pBreath 1.8s ease-in-out infinite; }
        @keyframes pBreath { 0%,100% { opacity: 0.95; } 50% { opacity: 0.55; } }

        .pSweep { animation: pSweep 1.15s linear infinite; }
        @keyframes pSweep { from { transform: translateX(0px); } to { transform: translateX(360px); } }

        .pTwinkle { animation: tw 1.2s ease-in-out infinite; }
        .pTwinkle2 { animation: tw 0.9s ease-in-out infinite; }
        @keyframes tw { 0%,100% { opacity: 0.2; } 50% { opacity: 1; } }
      `}</style>
    </svg>
  )
}
