import React from 'react'
import Card from './Card'
import { TrendingDown, TrendingUp, Minus } from 'lucide-react'

interface AssessmentCardProps {
  type: 'baseline' | 'after'
  score: number
  band: string
  delta?: number
  date: string
  className?: string
}

export default function AssessmentCard({
  type,
  score,
  band,
  delta,
  date,
  className = '',
}: AssessmentCardProps) {
  const getBandColor = (score: number) => {
    if (score <= 14) return { bg: 'bg-green-50 dark:bg-green-900/20', text: 'text-green-700 dark:text-green-300', border: 'border-green-200 dark:border-green-800' }
    if (score <= 28) return { bg: 'bg-yellow-50 dark:bg-yellow-900/20', text: 'text-yellow-700 dark:text-yellow-300', border: 'border-yellow-200 dark:border-yellow-800' }
    if (score <= 42) return { bg: 'bg-orange-50 dark:bg-orange-900/20', text: 'text-orange-700 dark:text-orange-300', border: 'border-orange-200 dark:border-orange-800' }
    return { bg: 'bg-red-50 dark:bg-red-900/20', text: 'text-red-700 dark:text-red-300', border: 'border-red-200 dark:border-red-800' }
  }

  const colors = getBandColor(score)

  const getDeltaDisplay = () => {
    if (!delta) return null
    
    if (delta < 0) {
      return (
        <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
          <TrendingDown className="w-5 h-5" />
          <span className="font-bold">{Math.abs(delta)} points</span>
          <span className="text-sm">improvement</span>
        </div>
      )
    } else if (delta > 0) {
      return (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400">
          <TrendingUp className="w-5 h-5" />
          <span className="font-bold">+{delta} points</span>
          <span className="text-sm">increase</span>
        </div>
      )
    } else {
      return (
        <div className="flex items-center gap-2 text-gray-600 dark:text-gray-400">
          <Minus className="w-5 h-5" />
          <span className="text-sm">No change</span>
        </div>
      )
    }
  }

  return (
    <Card className={`border-2 ${colors.border} ${colors.bg} ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
              {type === 'baseline' ? 'Baseline Assessment' : 'After Assessment'}
            </span>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {new Date(date).toLocaleDateString('en-US', { 
                month: 'short', 
                day: 'numeric', 
                year: 'numeric' 
              })}
            </p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold text-[var(--color-charcoal)] dark:text-white">
              {score}
            </div>
            <div className="text-sm text-gray-500 dark:text-gray-400">
              / 49
            </div>
          </div>
        </div>

        {/* Band */}
        <div className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${colors.text} bg-white dark:bg-gray-800`}>
          {band}
        </div>

        {/* Delta (for after assessment) */}
        {type === 'after' && delta !== undefined && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            {getDeltaDisplay()}
          </div>
        )}

        {/* Progress visualization */}
        <div className="pt-2">
          <div className="flex gap-1">
            {Array.from({ length: 7 }).map((_, i) => {
              const isActive = i < Math.ceil(score / 7)
              return (
                <div
                  key={i}
                  className={`h-2 flex-1 rounded-full transition-all ${
                    isActive ? colors.text.replace('text-', 'bg-') : 'bg-gray-200 dark:bg-gray-700'
                  }`}
                />
              )
            })}
          </div>
        </div>
      </div>
    </Card>
  )
}
