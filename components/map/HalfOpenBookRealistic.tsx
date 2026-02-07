import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  coverDark?: string
  paper?: string
  className?: string
}

export function HalfOpenBookRealistic({
  size = 120,
  cover = '#FF6A38',
  coverDark = '#F7B418',
  paper = '#F6F0DA',
  className,
}: Props) {
  const id = React.useId().replace(/:/g, '')
  const stroke = 'rgba(5,35,67,0.22)'

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 240 240"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <linearGradient id={`paper-ho-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EDE3C6" />
        </linearGradient>

        <linearGradient id={`edge-ho-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(5,35,67,0.16)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.02)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0.20)" />
        </linearGradient>

        <linearGradient id={`cover-ho-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <radialGradient id={`gutter-ho-${id}`} cx="50%" cy="50%" r="70%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.28)" />
          <stop offset="60%" stopColor="rgba(5,35,67,0.10)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>

        <linearGradient id={`spec-ho-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.65)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={`shadow-ho-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>
      </defs>

      <ellipse cx="120" cy="204" rx="86" ry="16" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-ho-${id})`}>
        <path
          d="M40 94 C68 72, 96 72, 120 82 V168 C96 158, 68 158, 40 180 Z"
          fill={`url(#paper-ho-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M40 180 C68 158, 96 158, 120 168 V188 C96 178, 68 178, 40 198 Z"
          fill={`url(#edge-ho-${id})`}
          opacity="0.65"
        />

        <path
          d="M124 86 C150 76, 176 80, 202 98 V172 C176 154, 150 150, 124 162 Z"
          fill={`url(#paper-ho-${id})`}
          opacity="0.85"
        />
        <path
          d="M132 96 C152 88, 170 90, 188 102 V166 C170 154, 152 152, 132 160 Z"
          fill="rgba(5,35,67,0.06)"
        />

        <path
          d="M120 78 C150 64, 184 70, 212 92 V182 C184 160, 150 154, 120 170 Z"
          fill={`url(#cover-ho-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M120 78 C132 74, 146 74, 160 78 V172 C146 168, 132 168, 120 170 Z"
          fill="rgba(255,255,255,0.10)"
          opacity="0.65"
        />

        <ellipse cx="120" cy="134" rx="18" ry="78" fill={`url(#gutter-ho-${id})`} opacity="0.48" />
        <path d="M120 70V194" stroke="rgba(5,35,67,0.14)" strokeWidth="4" strokeLinecap="round" />

        <path
          d="M156 108 C176 100, 194 102, 206 114 V126 C194 114, 176 112, 156 120 Z"
          fill={`url(#spec-ho-${id})`}
          opacity="0.45"
        />

        <path
          d="M58 112h46M58 126h52M58 140h44"
          stroke="rgba(5,35,67,0.14)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
