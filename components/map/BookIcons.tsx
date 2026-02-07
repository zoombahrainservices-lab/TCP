import * as React from 'react'

type BookIconProps = {
  size?: number
  primary?: string
  accent?: string
  className?: string
}

/** Open book icon (completed, current) */
export function OpenBookIcon({
  size = 86,
  primary = '#FFFFFF',
  accent = '#FF6A38',
  className,
}: BookIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 86 86"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="bookGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="10" stdDeviation="10" floodColor="rgba(0,0,0,0.3)" />
        </filter>
      </defs>

      {/* Book shadow */}
      <ellipse cx="43" cy="72" rx="32" ry="8" fill="rgba(0,0,0,0.15)" />

      {/* Left page */}
      <path
        d="M 20 25 Q 20 45 43 45 L 43 65 Q 20 65 20 85 Z"
        fill={primary}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
        filter="url(#bookGlow)"
      />

      {/* Right page */}
      <path
        d="M 43 45 Q 66 45 66 25 L 66 85 Q 66 65 43 65 Z"
        fill={primary}
        fillOpacity="0.92"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
        filter="url(#bookGlow)"
      />

      {/* Spine */}
      <rect
        x="41"
        y="45"
        width="4"
        height="20"
        fill={accent}
        rx="1"
      />

      {/* Spine highlight */}
      <line
        x1="43"
        y1="45"
        x2="43"
        y2="65"
        stroke="rgba(255,255,255,0.5)"
        strokeWidth="1"
      />

      {/* Page lines */}
      <line x1="25" y1="52" x2="38" y2="52" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      <line x1="25" y1="58" x2="38" y2="58" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      <line x1="48" y1="52" x2="61" y2="52" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
      <line x1="48" y1="58" x2="61" y2="58" stroke="rgba(0,0,0,0.06)" strokeWidth="0.8" />
    </svg>
  )
}

/** Closed book icon (locked) */
export function ClosedBookIcon({
  size = 86,
  primary = '#E5E7EB',
  accent = '#052343',
  className,
}: BookIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 86 86"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="bookShadow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* Book shadow */}
      <ellipse cx="43" cy="72" rx="28" ry="6" fill="rgba(0,0,0,0.12)" />

      {/* Book cover */}
      <rect
        x="24"
        y="30"
        width="38"
        height="36"
        rx="2"
        fill={primary}
        stroke="rgba(0,0,0,0.1)"
        strokeWidth="1"
        filter="url(#bookShadow)"
      />

      {/* Spine */}
      <rect x="41" y="30" width="4" height="36" fill={accent} />

      {/* Spine highlight */}
      <line
        x1="43"
        y1="30"
        x2="43"
        y2="66"
        stroke="rgba(255,255,255,0.3)"
        strokeWidth="0.8"
      />
    </svg>
  )
}

/** Half-open book icon (unlocked but not current) */
export function HalfOpenBookIcon({
  size = 86,
  primary = '#FFFFFF',
  accent = '#4BC4DC',
  className,
}: BookIconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 86 86"
      className={className}
      aria-hidden="true"
      style={{ overflow: 'visible' }}
    >
      <defs>
        <filter id="halfBookGlow" x="-50%" y="-50%" width="200%" height="200%">
          <feDropShadow dx="0" dy="8" stdDeviation="8" floodColor="rgba(0,0,0,0.25)" />
        </filter>
      </defs>

      {/* Book shadow */}
      <ellipse cx="43" cy="70" rx="30" ry="7" fill="rgba(0,0,0,0.14)" />

      {/* Left page (flatter) */}
      <path
        d="M 22 32 Q 22 48 43 48 L 43 64 Q 22 64 22 80 Z"
        fill={primary}
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
        filter="url(#halfBookGlow)"
      />

      {/* Right page (less open) */}
      <path
        d="M 43 48 Q 60 48 64 32 L 64 80 Q 60 64 43 64 Z"
        fill={primary}
        fillOpacity="0.9"
        stroke="rgba(0,0,0,0.08)"
        strokeWidth="1"
        filter="url(#halfBookGlow)"
      />

      {/* Spine */}
      <rect x="41.5" y="48" width="3" height="16" fill={accent} rx="0.5" />
    </svg>
  )
}
