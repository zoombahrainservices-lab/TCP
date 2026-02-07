import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  coverDark?: string
  paper?: string
  stroke?: string
  className?: string
}

const DEFAULTS = {
  size: 120,
  cover: '#4BC4DC',
  coverDark: '#0073BA',
  paper: '#F6F0DA',
  stroke: 'rgba(5,35,67,0.25)',
}

/**
 * CLOSED BOOK (upright)
 * 3D: spine, front cover, page edge, shadow + highlight
 */
export function ClosedBookUpright3D({
  size = DEFAULTS.size,
  cover = DEFAULTS.cover,
  coverDark = DEFAULTS.coverDark,
  paper = '#EFE7CC',
  stroke = DEFAULTS.stroke,
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 220 220"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`cov-upright-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <linearGradient id={`spine-upright-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={coverDark} />
          <stop offset="100%" stopColor="rgba(0,0,0,0.15)" />
        </linearGradient>

        <linearGradient id={`page-upright-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#E7DFC2" />
        </linearGradient>

        <filter id={`shadow-upright-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="16" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>
      </defs>

      <ellipse cx="118" cy="188" rx="62" ry="14" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-upright-${id})`}>
        <path
          d="M134 44 H168 C176 44 182 50 182 58 V162 C182 170 176 176 168 176 H134 Z"
          fill={`url(#page-upright-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M140 52H168"
          stroke="rgba(255,255,255,0.45)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.6"
        />

        <path
          d="M70 40 H140 C150 40 158 48 158 58 V162 C158 172 150 180 140 180 H70 C60 180 52 172 52 162 V58 C52 48 60 40 70 40 Z"
          fill={`url(#cov-upright-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M70 40 H86 V180 H70 C60 180 52 172 52 162 V58 C52 48 60 40 70 40 Z"
          fill={`url(#spine-upright-${id})`}
          opacity="0.95"
        />

        <path
          d="M64 58H150"
          stroke="rgba(255,255,255,0.35)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.55"
        />
      </g>
    </svg>
  )
}

/**
 * OPEN BOOK (front view)
 * 3D: thick pages, bottom cover lips, center crease, shadows + highlights
 */
export function OpenBookFront3D({
  size = DEFAULTS.size,
  cover = '#B45309',
  coverDark = '#7C2D12',
  paper = DEFAULTS.paper,
  stroke = DEFAULTS.stroke,
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`paper-open-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EDE3C6" />
        </linearGradient>

        <linearGradient id={`cover-open-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <radialGradient id={`crease-open-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.22)" />
          <stop offset="70%" stopColor="rgba(5,35,67,0.08)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>

        <filter id={`shadow-open-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>
      </defs>

      <ellipse cx="120" cy="206" rx="92" ry="18" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-open-${id})`}>
        <path
          d="M36 84 C62 64, 92 64, 120 74 V168 C92 158, 62 158, 36 178 Z"
          fill={`url(#paper-open-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M204 84 C178 64, 148 64, 120 74 V168 C148 158, 178 158, 204 178 Z"
          fill={`url(#paper-open-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M36 178 C62 158, 92 158, 120 168 V190 C92 180, 62 180, 36 200 Z"
          fill={`url(#cover-open-${id})`}
          opacity="0.95"
        />
        <path
          d="M204 178 C178 158, 148 158, 120 168 V190 C148 180, 178 180, 204 200 Z"
          fill={`url(#cover-open-${id})`}
          opacity="0.95"
        />

        <ellipse cx="120" cy="130" rx="22" ry="78" fill={`url(#crease-open-${id})`} opacity="0.55" />
        <path d="M120 66V196" stroke="rgba(5,35,67,0.14)" strokeWidth="4" strokeLinecap="round" />

        <path
          d="M56 98C78 84, 96 84, 112 90"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.45"
        />
        <path
          d="M184 98C162 84, 144 84, 128 90"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.35"
        />
      </g>
    </svg>
  )
}

/**
 * HALF-OPEN BOOK (partially open)
 * Left side open pages, right side cover mostly closed.
 */
export function HalfOpenBook3D({
  size = DEFAULTS.size,
  cover = '#FF6A38',
  coverDark = '#F7B418',
  paper = DEFAULTS.paper,
  stroke = DEFAULTS.stroke,
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 240 240" className={className} aria-hidden="true" style={{ overflow: 'visible' }}>
      <defs>
        <linearGradient id={`paper-half-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EDE3C6" />
        </linearGradient>

        <linearGradient id={`cover-half-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <radialGradient id={`crease-half-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.22)" />
          <stop offset="70%" stopColor="rgba(5,35,67,0.08)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>

        <filter id={`shadow-half-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>
      </defs>

      <ellipse cx="120" cy="206" rx="90" ry="18" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-half-${id})`}>
        <path
          d="M38 92 C64 72, 94 72, 120 82 V166 C94 156, 64 156, 38 176 Z"
          fill={`url(#paper-half-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M120 78 C150 66, 178 70, 204 90 V176 C178 156, 150 152, 120 166 Z"
          fill={`url(#cover-half-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M132 92 C152 84, 170 86, 190 100 V164 C170 150, 152 148, 132 156 Z"
          fill="rgba(255,255,255,0.18)"
        />

        <path
          d="M38 176 C64 156, 94 156, 120 166 V190 C94 180, 64 180, 38 200 Z"
          fill={`url(#cover-half-${id})`}
          opacity="0.28"
        />

        <ellipse cx="120" cy="134" rx="18" ry="76" fill={`url(#crease-half-${id})`} opacity="0.45" />
        <path d="M120 70V200" stroke="rgba(5,35,67,0.14)" strokeWidth="4" strokeLinecap="round" />

        <path
          d="M152 104C170 98, 184 100, 198 110"
          stroke="rgba(255,255,255,0.55)"
          strokeWidth="6"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    </svg>
  )
}
