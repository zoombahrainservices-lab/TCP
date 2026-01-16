'use client'

import { useEffect, useState } from 'react'

interface TaskDeadlineProps {
  taskDueAt: string
}

export default function TaskDeadline({ taskDueAt }: TaskDeadlineProps) {
  const [timeRemaining, setTimeRemaining] = useState('')
  const [urgency, setUrgency] = useState<'safe' | 'warning' | 'urgent'>('safe')

  useEffect(() => {
    const calculateTimeRemaining = () => {
      const now = new Date().getTime()
      const due = new Date(taskDueAt).getTime()
      const diff = due - now

      if (diff <= 0) {
        setTimeRemaining('Overdue')
        setUrgency('urgent')
        return
      }

      const hours = Math.floor(diff / (1000 * 60 * 60))
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

      if (hours < 4) {
        setUrgency('urgent')
      } else if (hours < 12) {
        setUrgency('warning')
      } else {
        setUrgency('safe')
      }

      if (hours >= 24) {
        const days = Math.floor(hours / 24)
        const remainingHours = hours % 24
        setTimeRemaining(`${days}d ${remainingHours}h remaining`)
      } else if (hours > 0) {
        setTimeRemaining(`${hours}h ${minutes}m remaining`)
      } else {
        setTimeRemaining(`${minutes}m remaining`)
      }
    }

    calculateTimeRemaining()
    const interval = setInterval(calculateTimeRemaining, 60000) // Update every minute

    return () => clearInterval(interval)
  }, [taskDueAt])

  const colorClasses = {
    safe: 'bg-green-50 border-green-200 text-green-800',
    warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
    urgent: 'bg-red-50 border-red-200 text-red-800',
  }

  const iconEmoji = {
    safe: '✅',
    warning: '⚠️',
    urgent: '🔥',
  }

  return (
    <div className={`border-2 rounded-lg p-4 ${colorClasses[urgency]}`}>
      <div className="flex items-center gap-3">
        <span className="text-2xl">{iconEmoji[urgency]}</span>
        <div className="flex-1">
          <div className="font-semibold text-sm">Task Deadline</div>
          <div className="text-lg font-bold">{timeRemaining}</div>
          <div className="text-xs opacity-75 mt-1">
            Due: {new Date(taskDueAt).toLocaleString()}
          </div>
        </div>
      </div>
    </div>
  )
}
