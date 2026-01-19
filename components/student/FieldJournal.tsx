'use client'

import { useState } from 'react'
import Link from 'next/link'

interface FieldJournalProps {
  records: Array<{
    day_number: number
    reflection_text: string | null
    updated_at: string
  }>
}

export default function FieldJournal({ records }: FieldJournalProps) {
  const reflections = records
    .filter(r => r.reflection_text && r.reflection_text.trim().length > 0)
    .sort((a, b) => b.day_number - a.day_number) // Most recent first

  const [expandedDay, setExpandedDay] = useState<number | null>(null)

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  const getZoneForDay = (day: number) => {
    if (day >= 1 && day <= 7) return { name: 'Focus Chamber', icon: '🔴' }
    if (day >= 8 && day <= 14) return { name: 'Connection Hub', icon: '🟠' }
    if (day >= 15 && day <= 21) return { name: 'Alliance Forge', icon: '🟡' }
    if (day >= 22 && day <= 28) return { name: 'Influence Vault', icon: '🟢' }
    return { name: 'Mastery Peak', icon: '🔵' }
  }

  if (reflections.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <div className="text-4xl mb-2">📓</div>
        <p className="text-sm mb-2">No journal entries yet</p>
        <p className="text-xs text-gray-400">Complete missions to see your reflections here</p>
      </div>
    )
  }

  return (
    <div className="space-y-3 max-h-[600px] overflow-y-auto">
      {reflections.map((record) => {
        const zone = getZoneForDay(record.day_number)
        const isExpanded = expandedDay === record.day_number
        const preview = record.reflection_text?.substring(0, 100) || ''
        const needsTruncation = (record.reflection_text?.length || 0) > 100

        return (
          <div
            key={record.day_number}
            className="border border-gray-200 rounded-lg p-4 hover:border-blue-300 transition-colors bg-white"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <span className="text-lg">{zone.icon}</span>
                <div>
                  <div className="font-semibold text-sm text-[var(--color-charcoal)]">
                    Day {record.day_number}: {zone.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    {formatDate(record.updated_at)}
                  </div>
                </div>
              </div>
              <Link
                href={`/student/day/${record.day_number}`}
                className="text-xs text-blue-600 hover:text-blue-700"
              >
                View →
              </Link>
            </div>

            {/* Reflection Text */}
            <div className="text-sm text-gray-700 leading-relaxed">
              {isExpanded ? (
                <div>{record.reflection_text}</div>
              ) : (
                <div>
                  {preview}
                  {needsTruncation && '...'}
                </div>
              )}
            </div>

            {/* Expand/Collapse Button */}
            {needsTruncation && (
              <button
                onClick={() => setExpandedDay(isExpanded ? null : record.day_number)}
                className="text-xs text-blue-600 hover:text-blue-700 mt-2"
              >
                {isExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>
        )
      })}
    </div>
  )
}
