import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  accent?: string
  page?: string
  className?: string
}

export function BookOpen3D({
  size = 96,
  cover = '#4bc4dc',
  accent = '#0073ba',
  page = '#ffffff',
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={page} />
          <stop offset="0.5" stopColor="#f8fafc" />
          <stop offset="1" stopColor="#eef2f7" />
        </linearGradient>
        <linearGradient id={`cv-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cover} />
          <stop offset="0.6" stopColor={accent} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`spine-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="0.5" stopColor={cover} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <filter id={`bs-${id}`} x="-50%" y="-40%" width="200%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      {/* Book shadow on ground */}
      <ellipse cx="80" cy="136" rx="48" ry="10" fill="rgba(0,0,0,0.2)" />

      <g filter={`url(#bs-${id})`}>
        {/* Left page — with subtle gradient for curve */}
        <path
          d="M 22 48 Q 22 80 42 85 L 42 122 Q 22 118 22 88 Z"
          fill={`url(#pg-${id})`}
          stroke="rgba(5,35,67,0.2)"
          strokeWidth="2"
        />
        {/* Right page */}
        <path
          d="M 42 85 Q 138 80 138 48 L 138 88 Q 138 118 42 122 Z"
          fill={`url(#pg-${id})`}
          fillOpacity="0.96"
          stroke="rgba(5,35,67,0.2)"
          strokeWidth="2"
        />
        {/* Left cover lip (bottom) */}
        <path d="M 22 118 Q 22 128 42 122 v 12 Q 22 138 22 128 Z" fill={`url(#cv-${id})`} />
        {/* Right cover lip */}
        <path d="M 138 88 Q 138 128 42 122 v 12 q 96 -6 96 -46 Z" fill={`url(#cv-${id})`} />
        {/* Spine (center binding) — 3D strip */}
        <path d="M 40 48 v 88 q -18 -4 -18 -44 0 -40 18 -44 z" fill={`url(#spine-${id})`} />
        <path d="M 42 48 v 88" stroke="rgba(255,255,255,0.4)" strokeWidth="2" opacity="0.8" />
        {/* Crease */}
        <path d="M 80 44 v 88" stroke="rgba(5,35,67,0.12)" strokeWidth="3" strokeLinecap="round" />
        {/* Page highlight (left) */}
        <path d="M 28 62 q 8 -4 14 2" stroke="rgba(255,255,255,0.6)" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Page highlight (right) */}
        <path d="M 132 62 q -8 -4 -14 2" stroke="rgba(255,255,255,0.5)" strokeWidth="4" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

export function BookHalfOpen3D({
  size = 96,
  cover = '#ff6a38',
  accent = '#f7b418',
  page = '#ffffff',
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`pg2-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={page} />
          <stop offset="1" stopColor="#eef2f7" />
        </linearGradient>
        <linearGradient id={`cv2-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cover} />
          <stop offset="0.5" stopColor={accent} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`spine2-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="0.5" stopColor={cover} />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <filter id={`bs2-${id}`} x="-50%" y="-40%" width="200%" height="180%">
          <feDropShadow dx="0" dy="14" stdDeviation="9" floodColor="rgba(0,0,0,0.32)" />
        </filter>
      </defs>

      <ellipse cx="80" cy="136" rx="50" ry="10" fill="rgba(0,0,0,0.2)" />

      <g filter={`url(#bs2-${id})`}>
        {/* Left open pages */}
        <path
          d="M 26 52 Q 26 82 44 86 L 44 120 Q 26 116 26 90 Z"
          fill={`url(#pg2-${id})`}
          stroke="rgba(5,35,67,0.22)"
          strokeWidth="2"
        />
        {/* Right cover (partially closed, angled) */}
        <path
          d="M 44 86 Q 134 78 136 50 L 136 92 Q 134 120 44 120 Z"
          fill={`url(#cv2-${id})`}
          stroke="rgba(5,35,67,0.25)"
          strokeWidth="2"
        />
        {/* Inner page peek (right side) */}
        <path d="M 92 58 Q 128 56 132 62 v 48 Q 128 116 92 112 Z" fill="rgba(255,255,255,0.25)" />
        {/* Spine */}
        <path d="M 42 50 v 72 q -16 -2 -16 -36 0 -34 16 -36 z" fill={`url(#spine2-${id})`} />
        <path d="M 44 50 v 70" stroke="rgba(255,255,255,0.35)" strokeWidth="1.5" opacity="0.9" />
        <path d="M 80 46 v 88" stroke="rgba(5,35,67,0.14)" strokeWidth="2.5" strokeLinecap="round" />
        {/* Highlight on right cover */}
        <path d="M 98 72 q 12 -2 20 4" stroke="rgba(255,255,255,0.55)" strokeWidth="4" strokeLinecap="round" fill="none" />
        {/* Left page highlight */}
        <path d="M 32 68 q 10 -4 16 2" stroke="rgba(255,255,255,0.5)" strokeWidth="3" strokeLinecap="round" fill="none" />
      </g>
    </svg>
  )
}

export function BookClosed3D({
  size = 96,
  cover = '#9ca3af',
  accent = '#052343',
  className,
}: Omit<Props, 'page'>) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 160 160" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`cv3-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={cover} />
          <stop offset="0.5" stopColor="#6b7280" />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <linearGradient id={`spine3-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor={accent} />
          <stop offset="0.5" stopColor="#0f172a" />
          <stop offset="1" stopColor={accent} />
        </linearGradient>
        <filter id={`bs3-${id}`} x="-50%" y="-40%" width="200%" height="180%">
          <feDropShadow dx="0" dy="12" stdDeviation="8" floodColor="rgba(0,0,0,0.35)" />
        </filter>
      </defs>

      <ellipse cx="80" cy="136" rx="46" ry="10" fill="rgba(0,0,0,0.22)" />

      <g filter={`url(#bs3-${id})`}>
        {/* Cover — rounded rect with 3D feel */}
        <path
          d="M 54 42 h 52 c 6 0 10 5 10 10 v 56 c 0 5 -4 10 -10 10 H 54 c -6 0 -10 -5 -10 -10 V 52 c 0 -5 4 -10 10 -10 z"
          fill={`url(#cv3-${id})`}
          stroke="rgba(5,35,67,0.3)"
          strokeWidth="2"
        />
        {/* Spine (left edge) — thicker for closed book */}
        <path d="M 54 42 v 76 h 10 v -76 Z" fill={`url(#spine3-${id})`} />
        <path d="M 62 42 v 84" stroke="rgba(255,255,255,0.2)" strokeWidth="1" opacity="0.8" />
        {/* Page edge (right side) */}
        <path
          d="M 68 50 h 44 c 5 0 8 4 8 8 v 44 c 0 4 -3 8 -8 8 H 68 V 50 z"
          fill="rgba(255,255,255,0.12)"
        />
        {/* Top edge highlight */}
        <path d="M 62 52 h 52" stroke="rgba(255,255,255,0.35)" strokeWidth="4" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  )
}
