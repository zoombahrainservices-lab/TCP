import * as React from 'react'

type BookProps = {
  size?: number
  cover?: string
  coverDark?: string
  paper?: string
  className?: string
}

const STROKE = 'rgba(5,35,67,0.22)'

/** OPEN BOOK (front view) */
export function BookOpenUltra3D({
  size = 140,
  cover = '#FF6A38',
  coverDark = '#F7B418',
  paper = '#F7F0DA',
  className,
}: BookProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EDE3C6" />
        </linearGradient>
        <linearGradient id={`edge-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(0,0,0,0.12)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0.16)" />
        </linearGradient>
        <linearGradient id={`cov-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>
        <radialGradient id={`gutter-${id}`} cx="50%" cy="50%" r="65%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.26)" />
          <stop offset="70%" stopColor="rgba(5,35,67,0.10)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="rgba(0,0,0,0.30)" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${id})`}>
        {/* pages */}
        <path
          d="M40 92 C72 66, 104 66, 130 78 V176 C104 164, 72 164, 40 190 Z"
          fill={`url(#pg-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        <path
          d="M220 92 C188 66, 156 66, 130 78 V176 C156 164, 188 164, 220 190 Z"
          fill={`url(#pg-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* thick bottom page edge */}
        <path
          d="M40 190 C72 164, 104 164, 130 176 C156 164, 188 164, 220 190 V206
             C188 182, 156 182, 130 192 C104 182, 72 182, 40 206 Z"
          fill={`url(#edge-${id})`}
          opacity="0.75"
        />

        {/* cover lips */}
        <path d="M40 190 C72 164, 104 164, 130 176 V206 C104 194, 72 194, 40 220 Z" fill={`url(#cov-${id})`} opacity="0.95" />
        <path d="M220 190 C188 164, 156 164, 130 176 V206 C156 194, 188 194, 220 220 Z" fill={`url(#cov-${id})`} opacity="0.95" />

        {/* gutter */}
        <ellipse cx="130" cy="146" rx="22" ry="88" fill={`url(#gutter-${id})`} opacity="0.55" />
        <path d="M130 70V214" stroke="rgba(5,35,67,0.14)" strokeWidth="5" strokeLinecap="round" />

        {/* highlights */}
        <path d="M62 110 C86 92, 106 92, 122 98" stroke="rgba(255,255,255,0.55)" strokeWidth="7" strokeLinecap="round" opacity="0.5" />
        <path d="M198 110 C174 92, 154 92, 138 98" stroke="rgba(255,255,255,0.55)" strokeWidth="7" strokeLinecap="round" opacity="0.4" />
      </g>
    </svg>
  )
}

/** HALF-OPEN BOOK (current; cover partially closed, thick pages visible) */
export function BookHalfOpenUltra3D({
  size = 140,
  cover = '#FF6A38',
  coverDark = '#F7B418',
  paper = '#F7F0DA',
  className,
}: BookProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EDE3C6" />
        </linearGradient>
        <linearGradient id={`cov-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>
        <radialGradient id={`hinge-${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.26)" />
          <stop offset="70%" stopColor="rgba(5,35,67,0.10)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="rgba(0,0,0,0.30)" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${id})`}>
        {/* left open pages */}
        <path
          d="M44 98 C76 72, 106 72, 130 82 V172 C106 162, 76 162, 44 188 Z"
          fill={`url(#pg-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* right page block behind cover (thickness) */}
        <path
          d="M134 88 C162 78, 190 82, 216 102 V178 C190 160, 162 156, 134 168 Z"
          fill={`url(#pg-${id})`}
          opacity="0.85"
        />
        <path
          d="M146 98 C166 90, 184 92, 202 106 V170 C184 156, 166 154, 146 160 Z"
          fill="rgba(5,35,67,0.06)"
        />

        {/* right cover (partially closed) */}
        <path
          d="M130 80 C164 66, 198 74, 228 96 V190 C198 168, 164 160, 130 178 Z"
          fill={`url(#cov-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />

        {/* hinge/gutter */}
        <ellipse cx="130" cy="146" rx="18" ry="86" fill={`url(#hinge-${id})`} opacity="0.50" />
        <path d="M130 72V214" stroke="rgba(5,35,67,0.14)" strokeWidth="5" strokeLinecap="round" />

        {/* cover highlight */}
        <path
          d="M170 116 C194 108, 212 112, 224 124"
          stroke="rgba(255,255,255,0.60)"
          strokeWidth="7"
          strokeLinecap="round"
          opacity="0.45"
        />
      </g>
    </svg>
  )
}

/** CLOSED BOOK (locked; upright-ish, muted) */
export function BookClosedUltra3D({
  size = 140,
  cover = '#9CA3AF',
  coverDark = '#052343',
  paper = '#E9E3D0',
  className,
}: BookProps) {
  const id = React.useId().replace(/:/g, '')
  return (
    <svg width={size} height={size} viewBox="0 0 260 260" className={className} aria-hidden="true">
      <defs>
        <linearGradient id={`cov-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>
        <linearGradient id={`pg-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#DDD6BF" />
        </linearGradient>
        <filter id={`shadow-${id}`} x="-50%" y="-50%" width="200%" height="220%">
          <feDropShadow dx="0" dy="18" stdDeviation="14" floodColor="rgba(0,0,0,0.30)" />
        </filter>
      </defs>

      <g filter={`url(#shadow-${id})`}>
        {/* page block */}
        <path
          d="M152 64 H206 C216 64 224 72 224 82 V198 C224 208 216 216 206 216 H152 Z"
          fill={`url(#pg-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* cover */}
        <path
          d="M76 58 H164 C176 58 186 68 186 80 V200 C186 212 176 222 164 222 H76 C64 222 54 212 54 200 V80 C54 68 64 58 76 58 Z"
          fill={`url(#cov-${id})`}
          stroke={STROKE}
          strokeWidth="3.5"
          strokeLinejoin="round"
        />
        {/* spine */}
        <path
          d="M76 58 H96 V222 H76 C64 222 54 212 54 200 V80 C54 68 64 58 76 58 Z"
          fill={coverDark}
          opacity="0.9"
        />
        {/* highlight */}
        <path d="M70 86 H176" stroke="rgba(255,255,255,0.35)" strokeWidth="8" strokeLinecap="round" opacity="0.5" />
      </g>
    </svg>
  )
}
