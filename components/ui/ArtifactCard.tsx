import React from 'react'
import Card from './Card'
import { Download, Eye, Edit2 } from 'lucide-react'

interface ArtifactCardProps {
  type: 'identity_card' | 'screen_time_baseline' | 'avoidance_pattern' | 'accountability' | 'substitutions' | 'later_phrase' | 'visual_tracker'
  title: string
  data: Record<string, any>
  onView?: () => void
  onEdit?: () => void
  onDownload?: () => void
  className?: string
}

export default function ArtifactCard({
  type,
  title,
  data,
  onView,
  onEdit,
  onDownload,
  className = '',
}: ArtifactCardProps) {
  const typeConfig = {
    identity_card: {
      icon: '🎯',
      color: 'orange',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
    },
    screen_time_baseline: {
      icon: '📱',
      color: 'blue',
      bgColor: 'bg-blue-50 dark:bg-blue-900/20',
      borderColor: 'border-blue-200 dark:border-blue-800',
    },
    avoidance_pattern: {
      icon: '🎭',
      color: 'purple',
      bgColor: 'bg-purple-50 dark:bg-purple-900/20',
      borderColor: 'border-purple-200 dark:border-purple-800',
    },
    accountability: {
      icon: '🤝',
      color: 'green',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
    },
    substitutions: {
      icon: '🔄',
      color: 'red',
      bgColor: 'bg-red-50 dark:bg-red-900/20',
      borderColor: 'border-red-200 dark:border-red-800',
    },
    later_phrase: {
      icon: '⏰',
      color: 'yellow',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
    },
    visual_tracker: {
      icon: '📊',
      color: 'indigo',
      bgColor: 'bg-indigo-50 dark:bg-indigo-900/20',
      borderColor: 'border-indigo-200 dark:border-indigo-800',
    },
  }

  const config = typeConfig[type]

  const renderContent = () => {
    switch (type) {
      case 'identity_card':
        return (
          <div className="space-y-2">
            <p className="text-lg font-medium">
              I am <span className="text-[var(--color-amber)] font-bold">{data.identity}</span>
            </p>
            <p className="text-base text-gray-600 dark:text-gray-400">
              who <span className="font-medium">{data.impact}</span>
            </p>
          </div>
        )
      case 'screen_time_baseline':
        return (
          <div>
            <p className="text-2xl font-bold text-[var(--color-charcoal)] dark:text-white">
              {data.range}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Daily average
            </p>
          </div>
        )
      case 'substitutions':
        return (
          <ul className="space-y-2">
            {data.substitutions?.map((sub: string, idx: number) => (
              <li key={idx} className="flex items-start gap-2">
                <span className="text-[var(--color-amber)] font-bold">{idx + 1}.</span>
                <span className="text-gray-700 dark:text-gray-300">{sub}</span>
              </li>
            ))}
          </ul>
        )
      case 'later_phrase':
        return (
          <blockquote className="italic text-lg text-gray-700 dark:text-gray-300 border-l-4 border-[var(--color-amber)] pl-4">
            "{data.phrase}"
          </blockquote>
        )
      default:
        return (
          <pre className="text-sm text-gray-600 dark:text-gray-400 overflow-auto">
            {JSON.stringify(data, null, 2)}
          </pre>
        )
    }
  }

  return (
    <Card className={`${config.bgColor} border-2 ${config.borderColor} ${className}`}>
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-3xl">{config.icon}</span>
            <h3 className="font-bold text-lg text-[var(--color-charcoal)] dark:text-white">
              {title}
            </h3>
          </div>
        </div>

        {/* Content */}
        <div className="py-2">
          {renderContent()}
        </div>

        {/* Actions */}
        {(onView || onEdit || onDownload) && (
          <div className="flex gap-2 pt-2 border-t border-gray-200 dark:border-gray-700">
            {onView && (
              <button
                onClick={onView}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Eye className="w-4 h-4" />
                View
              </button>
            )}
            {onEdit && (
              <button
                onClick={onEdit}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Edit2 className="w-4 h-4" />
                Edit
              </button>
            )}
            {onDownload && (
              <button
                onClick={onDownload}
                className="flex items-center gap-1 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:bg-white dark:hover:bg-gray-800 rounded transition-colors"
              >
                <Download className="w-4 h-4" />
                Download
              </button>
            )}
          </div>
        )}
      </div>
    </Card>
  )
}
