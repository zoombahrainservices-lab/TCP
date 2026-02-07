import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  coverDark?: string
  stroke?: string
  className?: string
}

export function RealisticClosedBook({
  size = 120,
  cover = '#9CA3AF',
  coverDark = '#052343',
  stroke = 'rgba(5,35,67,0.28)',
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
        <linearGradient id={`cover-cl-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <linearGradient id={`spine-cl-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor={coverDark} />
          <stop offset="50%" stopColor="rgba(5,35,67,0.9)" />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <linearGradient id={`edge-cl-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(5,35,67,0.12)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0.12)" />
        </linearGradient>

        <linearGradient id={`spec-cl-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.45)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={`shadow-cl-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>
      </defs>

      <ellipse cx="110" cy="188" rx="72" ry="14" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-cl-${id})`}>
        {/* Front cover block */}
        <path
          d="M56 52 L168 52 C176 52 182 58 182 66 L182 158 C182 166 176 172 168 172 L56 172 C48 172 42 166 42 158 L42 66 C42 58 48 52 56 52 Z"
          fill={`url(#cover-cl-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Spine (left edge) */}
        <path
          d="M56 52 L42 66 L42 158 L56 172 L56 52 Z"
          fill={`url(#spine-cl-${id})`}
          stroke={stroke}
          strokeWidth="2"
          strokeLinejoin="round"
        />

        {/* Page edge (right side of block) */}
        <path
          d="M68 60 L158 60 C164 60 168 64 168 70 L168 160 C168 166 164 170 158 170 L68 170 L68 60 Z"
          fill="rgba(255,255,255,0.12)"
        />

        {/* Top edge highlight */}
        <path
          d="M56 56 L168 56"
          stroke={`url(#spec-cl-${id})`}
          strokeWidth="5"
          strokeLinecap="round"
          opacity="0.6"
        />
      </g>
    </svg>
  )
}
