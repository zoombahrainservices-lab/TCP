import React from 'react'
import Card from './Card'

interface ProgressCardProps {
  title: string
  current: number
  total: number
  percentage: number
  variant?: 'default' | 'framework' | 'chapter'
  className?: string
}

export default function ProgressCard({
  title,
  current,
  total,
  percentage,
  variant = 'default',
  className = '',
}: ProgressCardProps) {
  const variantStyles = {
    default: {
      barColor: 'bg-[var(--color-blue)]',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20',
      textColor: 'text-blue-700 dark:text-blue-300',
    },
    framework: {
      barColor: 'bg-[var(--color-amber)]',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20',
      textColor: 'text-orange-700 dark:text-orange-300',
    },
    chapter: {
      barColor: 'bg-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20',
      textColor: 'text-green-700 dark:text-green-300',
    },
  }

  const styles = variantStyles[variant]

  return (
    <Card className={className}>
      <div className="space-y-4">
        {/* Title */}
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-[var(--color-charcoal)] dark:text-white">
            {title}
          </h3>
          <span className={`text-sm font-mono font-medium ${styles.textColor}`}>
            {current}/{total}
          </span>
        </div>

        {/* Progress Bar */}
        <div>
          <div className={`w-full h-3 ${styles.bgColor} rounded-full overflow-hidden`}>
            <div
              className={`h-full ${styles.barColor} transition-all duration-500 ease-out`}
              style={{ width: `${percentage}%` }}
            />
          </div>
          <div className="flex justify-between items-center mt-2">
            <span className="text-sm text-gray-600 dark:text-gray-400">
              {percentage}% complete
            </span>
            {percentage === 100 && (
              <span className="text-sm font-medium text-green-600 dark:text-green-400 flex items-center gap-1">
                ✓ Completed
              </span>
            )}
          </div>
        </div>

        {/* Steps remaining */}
        {current < total && (
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {total - current} {total - current === 1 ? 'step' : 'steps'} remaining
          </p>
        )}
      </div>
    </Card>
  )
}
