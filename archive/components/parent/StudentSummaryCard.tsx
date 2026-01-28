'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'
import Badge from '@/components/ui/Badge'

interface StudentSummaryCardProps {
  id: string
  fullName: string
  currentDay: number
  completionPercentage: number
  lastActivity: string | null
}

export default function StudentSummaryCard({
  id,
  fullName,
  currentDay,
  completionPercentage,
  lastActivity,
}: StudentSummaryCardProps) {
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'No activity yet'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <Link href={`/parent/child/${id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">{fullName}</h3>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Current Day:</span>
                <Badge variant="info" size="sm">Day {currentDay}</Badge>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Progress:</span>
                <div className="flex-1 max-w-xs">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all"
                        style={{ width: `${completionPercentage}%` }}
                      />
                    </div>
                    <span className="text-sm font-medium text-gray-700">{completionPercentage}%</span>
                  </div>
                </div>
              </div>
              <div className="text-sm text-gray-500">
                Last activity: {formatDate(lastActivity)}
              </div>
            </div>
          </div>
          <div className="ml-4">
            <svg className="w-6 h-6 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </Card>
    </Link>
  )
}
