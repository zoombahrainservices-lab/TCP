import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  coverDark?: string
  paper?: string
  stroke?: string
  className?: string
}

export function RealisticHalfOpenBook({
  size = 120,
  cover = '#FF6A38',
  coverDark = '#F7B418',
  paper = '#FFFFFF',
  stroke = 'rgba(5,35,67,0.22)',
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
        <linearGradient id={`paper-ho-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EEF2F7" />
        </linearGradient>

        <linearGradient id={`edge-ho-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(5,35,67,0.10)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0.10)" />
        </linearGradient>

        <linearGradient id={`cover-ho-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <radialGradient id={`crease-ho-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.22)" />
          <stop offset="60%" stopColor="rgba(5,35,67,0.08)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>

        <linearGradient id={`spec-ho-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.70)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={`shadow-ho-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>

        <filter id={`inner-ho-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" />
        </filter>
      </defs>

      <ellipse cx="110" cy="188" rx="76" ry="16" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-ho-${id})`}>
        {/* Left page block (open) */}
        <path
          d="M34 70 C58 54, 86 54, 110 62 V160 C86 152, 58 152, 34 168 Z"
          fill={`url(#paper-ho-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Right side: cover (partially closed, angled) */}
        <path
          d="M186 72 C162 56, 132 56, 110 64 V162 C132 154, 162 154, 186 170 Z"
          fill={`url(#cover-ho-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        {/* Page thickness / edge shading (left only at spine) */}
        <path
          d="M34 168 C58 152, 86 152, 110 160 V176 C88 168, 60 168, 34 184 Z"
          fill={`url(#edge-ho-${id})`}
          opacity="0.75"
        />

        {/* Cover lip left (spine side) */}
        <path
          d="M34 168 C58 152, 86 152, 110 160 V176 C88 168, 60 168, 34 184 Z"
          fill={`url(#cover-ho-${id})`}
          opacity="0.95"
        />

        {/* Center crease shading */}
        <ellipse cx="110" cy="116" rx="20" ry="58" fill={`url(#crease-ho-${id})`} opacity="0.55" />
        <path d="M110 60 V174" stroke="rgba(5,35,67,0.12)" strokeWidth="4" strokeLinecap="round" />

        {/* Inner page shadow (left page) */}
        <path
          d="M44 78 C64 66, 88 66, 108 72 V154 C88 148, 64 148, 44 160 Z"
          fill="rgba(5,35,67,0.05)"
          filter={`url(#inner-ho-${id})`}
          opacity="0.65"
        />

        {/* Specular highlight left page */}
        <path
          d="M46 80 C70 66, 92 66, 108 72 V90 C92 84, 70 84, 46 98 Z"
          fill={`url(#spec-ho-${id})`}
          opacity="0.55"
        />

        {/* Specular on right cover */}
        <path
          d="M168 78 C148 66, 126 66, 112 72 V88 C126 82, 148 82, 168 96 Z"
          fill={`url(#spec-ho-${id})`}
          opacity="0.4"
        />

        {/* Light page lines (left only) */}
        <path
          d="M54 98h44M54 112h48M54 126h40"
          stroke="rgba(5,35,67,0.16)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
