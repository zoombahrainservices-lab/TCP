'use client'

import { motion } from 'framer-motion'

interface ProgressCircleProps {
  progress: number // 0-100
  size?: number // diameter in pixels
  strokeWidth?: number
  color?: 'amber' | 'blue' | 'red' | 'green'
  showPercentage?: boolean
  icon?: string
  className?: string
}

/**
 * Duolingo-style circular progress indicator
 * Used for level progress, chapter completion, etc.
 */
export function ProgressCircle({
  progress,
  size = 120,
  strokeWidth = 8,
  color = 'amber',
  showPercentage = true,
  icon,
  className = ''
}: ProgressCircleProps) {
  const radius = (size - strokeWidth) / 2
  const circumference = radius * 2 * Math.PI
  const offset = circumference - (progress / 100) * circumference

  const colors = {
    amber: 'var(--color-amber)',
    blue: 'var(--color-blue)',
    red: 'var(--color-red)',
    green: '#4CAF50'
  }

  const strokeColor = colors[color]

  return (
    <div className={`relative inline-flex items-center justify-center ${className}`}>
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background circle */}
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="#e5e7eb"
          strokeWidth={strokeWidth}
          fill="transparent"
        />
        
        {/* Progress circle */}
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke={strokeColor}
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: offset }}
          transition={{ duration: 1, ease: 'easeInOut' }}
        />
      </svg>

      {/* Center content */}
      <div className="absolute inset-0 flex items-center justify-center">
        {icon ? (
          <span className="text-4xl">{icon}</span>
        ) : showPercentage ? (
          <span className="text-2xl font-bold text-[var(--color-charcoal)]">
            {Math.round(progress)}%
          </span>
        ) : null}
      </div>
    </div>
  )
}
