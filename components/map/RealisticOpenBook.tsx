import * as React from 'react'

type Props = {
  size?: number
  cover?: string
  coverDark?: string
  paper?: string
  stroke?: string
  className?: string
}

export function RealisticOpenBook({
  size = 120,
  cover = '#4BC4DC',
  coverDark = '#0073BA',
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
        <linearGradient id={`paper-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={paper} />
          <stop offset="100%" stopColor="#EEF2F7" />
        </linearGradient>

        <linearGradient id={`edge-${id}`} x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="rgba(5,35,67,0.10)" />
          <stop offset="50%" stopColor="rgba(255,255,255,0.0)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0.10)" />
        </linearGradient>

        <linearGradient id={`cover-${id}`} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor={cover} />
          <stop offset="100%" stopColor={coverDark} />
        </linearGradient>

        <radialGradient id={`crease-${id}`} cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="rgba(5,35,67,0.22)" />
          <stop offset="60%" stopColor="rgba(5,35,67,0.08)" />
          <stop offset="100%" stopColor="rgba(5,35,67,0)" />
        </radialGradient>

        <linearGradient id={`spec-${id}`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="rgba(255,255,255,0.70)" />
          <stop offset="100%" stopColor="rgba(255,255,255,0)" />
        </linearGradient>

        <filter id={`shadow-${id}`} x="-40%" y="-40%" width="180%" height="200%">
          <feDropShadow dx="0" dy="18" stdDeviation="12" floodColor="rgba(0,0,0,0.28)" />
        </filter>

        <filter id={`inner-${id}`} x="-30%" y="-30%" width="160%" height="160%">
          <feOffset dx="0" dy="2" />
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="arithmetic" k2="-1" k3="1" />
        </filter>
      </defs>

      <ellipse cx="110" cy="188" rx="76" ry="16" fill="rgba(0,0,0,0.18)" />

      <g filter={`url(#shadow-${id})`}>
        <path
          d="M34 70 C58 54, 86 54, 110 62 V160 C86 152, 58 152, 34 168 Z"
          fill={`url(#paper-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M186 70 C162 54, 134 54, 110 62 V160 C134 152, 162 152, 186 168 Z"
          fill={`url(#paper-${id})`}
          stroke={stroke}
          strokeWidth="3"
          strokeLinejoin="round"
        />

        <path
          d="M34 168 C58 152, 86 152, 110 160 C134 152, 162 152, 186 168 V176 C160 160, 132 160, 110 168 C88 160, 60 160, 34 176 Z"
          fill={`url(#edge-${id})`}
          opacity="0.75"
        />

        <path
          d="M34 168 C58 152, 86 152, 110 160 V176 C88 168, 60 168, 34 184 Z"
          fill={`url(#cover-${id})`}
          opacity="0.95"
        />
        <path
          d="M186 168 C162 152, 134 152, 110 160 V176 C132 168, 160 168, 186 184 Z"
          fill={`url(#cover-${id})`}
          opacity="0.95"
        />

        <ellipse cx="110" cy="118" rx="22" ry="62" fill={`url(#crease-${id})`} opacity="0.55" />
        <path d="M110 58 V176" stroke="rgba(5,35,67,0.12)" strokeWidth="4" strokeLinecap="round" />

        <path
          d="M44 78 C64 66, 88 66, 108 72 V154 C88 148, 64 148, 44 160 Z"
          fill="rgba(5,35,67,0.05)"
          filter={`url(#inner-${id})`}
          opacity="0.65"
        />
        <path
          d="M176 78 C156 66, 132 66, 112 72 V154 C132 148, 156 148, 176 160 Z"
          fill="rgba(5,35,67,0.05)"
          filter={`url(#inner-${id})`}
          opacity="0.65"
        />

        <path
          d="M46 80 C70 66, 92 66, 108 72 V90 C92 84, 70 84, 46 98 Z"
          fill={`url(#spec-${id})`}
          opacity="0.55"
        />
        <path
          d="M174 80 C150 66, 128 66, 112 72 V90 C128 84, 150 84, 174 98 Z"
          fill={`url(#spec-${id})`}
          opacity="0.45"
        />

        <path
          d="M54 98h44M54 112h48M54 126h40"
          stroke="rgba(5,35,67,0.16)"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M122 98h44M118 112h48M126 126h36"
          stroke="rgba(5,35,67,0.16)"
          strokeWidth="3"
          strokeLinecap="round"
        />
      </g>
    </svg>
  )
}
