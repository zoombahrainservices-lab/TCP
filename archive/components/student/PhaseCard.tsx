'use client'

import Link from 'next/link'
import Card from '@/components/ui/Card'

interface PhaseCardProps {
  phaseId: number
  chapterId: number
  phaseType: string
  phaseNumber: number
  phaseLabel: string
  content: string | null
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent: boolean
  borderColor: string
  bgColor: string
  icon: string
}

export default function PhaseCard({
  phaseId,
  chapterId,
  phaseType,
  phaseNumber,
  phaseLabel,
  content,
  isUnlocked,
  isCompleted,
  isCurrent,
  borderColor,
  bgColor,
  icon,
}: PhaseCardProps) {
  const isLocked = !isUnlocked

  return (
    <Link
      href={isLocked ? '#' : `/student/chapter/${chapterId}/${phaseType}`}
      className={`block ${isLocked ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'}`}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault()
        }
      }}
    >
      <Card className={`border-4 ${borderColor} ${bgColor} transition-all ${
        isLocked ? '' : 'hover:shadow-xl'
      }`}>
        <div className="p-6">
          {/* Phase Header */}
          <div className="flex items-center gap-4 mb-4">
            <div className="text-4xl">{icon}</div>
            <div className="flex-1">
              <div className="text-sm font-semibold text-slate-600 mb-1">
                PHASE {phaseNumber}: {phaseLabel.toUpperCase()}
              </div>
              {content && (
                <p className="text-sm text-slate-700">
                  {content.substring(0, 100)}...
                </p>
              )}
            </div>
            {isCompleted && (
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
            )}
            {isCurrent && !isCompleted && (
              <div className="flex-shrink-0">
                <span className="px-3 py-1 bg-blue-500 text-white text-xs font-bold rounded-full">
                  CURRENT
                </span>
              </div>
            )}
            {isLocked && (
              <div className="flex-shrink-0">
                <svg className="w-8 h-8 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </div>

          {/* Phase Content Preview */}
          {content && (
            <div className="text-slate-600 text-sm line-clamp-3">
              {content}
            </div>
          )}
        </div>
      </Card>
    </Link>
  )
}
