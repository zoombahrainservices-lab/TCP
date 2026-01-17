'use client'

import { useEffect, useState } from 'react'
import confetti from 'canvas-confetti'

interface MilestoneToastProps {
  open: boolean
  milestone: number        // 25, 50, 75, 100
  chapterTitle: string
  onClose: () => void
}

export default function MilestoneToast({ open, milestone, chapterTitle, onClose }: MilestoneToastProps) {
  const [isVisible, setIsVisible] = useState(false)
  const [isExiting, setIsExiting] = useState(false)
  
  // Trigger confetti when milestone is achieved
  useEffect(() => {
    if (open) {
      // Fire confetti from the center of the screen
      const fireConfetti = async () => {
        try {
          await confetti({
            particleCount: 100,
            spread: 70,
            origin: { y: 0.5, x: 0.5 }, // Center of screen
            colors: ['#F5B301', '#4A90E2', '#E63946', '#111111'], // TCP brand colors
          })
        } catch (error) {
          console.error('Confetti error:', error)
        }
      }
      
      fireConfetti()
    }
  }, [open])

  // Handle enter animation
  useEffect(() => {
    if (open) {
      setIsExiting(false)
      // Small delay to trigger animation
      setTimeout(() => setIsVisible(true), 10)
    } else {
      setIsVisible(false)
    }
  }, [open])

  // Auto-dismiss after 2 seconds (confetti shows for 1-2 seconds)
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      handleClose()
    }, 2000) // 2 seconds

    return () => clearTimeout(timer)
  }, [open])

  const handleClose = () => {
    setIsExiting(true)
    setTimeout(() => {
      onClose()
      setIsExiting(false)
    }, 300) // Match animation duration
  }

  // Get milestone message
  const getMilestoneMessage = () => {
    switch (milestone) {
      case 25:
        return 'Great start!'
      case 50:
        return 'Halfway there!'
      case 75:
        return 'Almost done!'
      case 100:
        return 'Chapter complete!'
      default:
        return 'Nice work!'
    }
  }

  // Get milestone emoji
  const getMilestoneEmoji = () => {
    switch (milestone) {
      case 25:
        return '🎯'
      case 50:
        return '⭐'
      case 75:
        return '🔥'
      case 100:
        return '🎉'
      default:
        return '✨'
    }
  }

  if (!open && !isExiting) return null

  return (
    <div
      className={`fixed bottom-4 right-4 md:right-4 left-4 md:left-auto max-w-sm z-50 transition-all duration-300 ${
        isVisible && !isExiting
          ? 'opacity-100 translate-y-0'
          : 'opacity-0 translate-y-2 pointer-events-none'
      }`}
      onClick={handleClose}
      role="alert"
      aria-live="polite"
    >
      <div className="bg-white rounded-lg shadow-2xl border border-gray-200 p-4 cursor-pointer hover:shadow-3xl transition-shadow">
        {/* Badge */}
        <div className="flex items-center gap-2 mb-3">
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-gradient-to-r from-blue-500 to-purple-500 text-white">
            MILESTONE UNLOCKED {getMilestoneEmoji()}
          </span>
        </div>

        {/* Large percentage */}
        <div className="flex items-baseline gap-2 mb-2">
          <span className="text-4xl font-bold text-gray-900">{milestone}%</span>
        </div>

        {/* Message */}
        <p className="text-lg font-semibold text-gray-700 mb-2">
          {getMilestoneMessage()}
        </p>

        {/* Chapter title */}
        <p className="text-xs text-gray-500 leading-relaxed">
          You've completed {milestone}% of "{chapterTitle}"
        </p>

        {/* Close button (optional, click anywhere also closes) */}
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleClose()
          }}
          className="absolute top-2 right-2 text-gray-400 hover:text-gray-600 transition-colors"
          aria-label="Close notification"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  )
}
