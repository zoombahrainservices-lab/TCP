'use client'

import Link from 'next/link'
import { Lock, Check, Zap } from 'lucide-react'

type MissionStatus = 'complete' | 'current' | 'locked'

interface MissionCardProps {
  chapterId: number
  chapterNumber: number
  title: string
  isUnlocked: boolean
  isCompleted: boolean
  isCurrent: boolean
}

export default function MissionCard({
  chapterId,
  chapterNumber,
  title,
  isUnlocked,
  isCompleted,
  isCurrent,
}: MissionCardProps) {
  const isLocked = !isUnlocked
  
  // Determine status
  let status: MissionStatus = 'locked'
  let statusLabel = 'Locked'
  
  if (isCompleted) {
    status = 'complete'
    statusLabel = 'Complete'
  } else if (isCurrent && isUnlocked) {
    status = 'current'
    statusLabel = 'Current Mission'
  } else if (isLocked) {
    status = 'locked'
    statusLabel = 'Locked'
  }

  const missionNumber = `MISSION ${chapterNumber}`

  return (
    <Link
      href={isUnlocked ? `/student/chapter/${chapterId}` : '#'}
      onClick={(e) => {
        if (isLocked) {
          e.preventDefault()
        }
      }}
      className={`rounded-lg p-4 flex flex-col justify-between min-h-[140px] ${
        status === 'current'
          ? 'bg-[#E05A4E] text-white'
          : 'bg-[#6B6B6B] text-white'
      }`}
    >
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide opacity-90">
          {missionNumber}
        </p>
        <h3 className="text-sm font-bold uppercase mt-1 leading-tight">
          {title}
        </h3>
      </div>

      <div className="flex justify-center my-3">
        {status === 'locked' && <Lock className="w-8 h-8 opacity-80" />}
        {status === 'current' && <Zap className="w-8 h-8" />}
        {status === 'complete' && <Check className="w-8 h-8 opacity-80" />}
      </div>

      <div className="flex items-center gap-2">
        <span className="text-[10px] uppercase tracking-wide opacity-80">Status:</span>
        <div className="flex items-center gap-1">
          {(status === 'complete' || statusLabel.toLowerCase() === 'complete') && (
            <span className="w-4 h-4 bg-[#22C55E] rounded-full flex items-center justify-center">
              <Check className="w-3 h-3 text-white" />
            </span>
          )}
          <span className="text-xs font-medium">{statusLabel}</span>
        </div>
      </div>
    </Link>
  )
}
