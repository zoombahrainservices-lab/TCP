'use client'

import { useEffect } from 'react'

interface CelebrationOverlayProps {
  open: boolean
  milestone: number        // 25, 50, 75, 100
  chapterTitle: string
  onClose: () => void
}

export default function CelebrationOverlay({ open, milestone, chapterTitle, onClose }: CelebrationOverlayProps) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose()
      }
    }

    window.addEventListener('keydown', handleEscape)
    return () => window.removeEventListener('keydown', handleEscape)
  }, [open, onClose])

  // Prevent body scroll when overlay is open
  useEffect(() => {
    if (open) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }

    return () => {
      document.body.style.overflow = ''
    }
  }, [open])

  if (!open) return null

  // Determine milestone message and emoji
  const getMilestoneData = () => {
    switch (milestone) {
      case 25:
        return { emoji: '🎯', color: 'from-blue-500 to-purple-500', message: 'Great start!' }
      case 50:
        return { emoji: '⭐', color: 'from-purple-500 to-pink-500', message: 'Halfway there!' }
      case 75:
        return { emoji: '🔥', color: 'from-pink-500 to-orange-500', message: 'Almost done!' }
      case 100:
        return { emoji: '🎉', color: 'from-green-500 to-teal-500', message: 'Chapter complete!' }
      default:
        return { emoji: '✨', color: 'from-blue-500 to-purple-500', message: 'Keep going!' }
    }
  }

  const { emoji, color, message } = getMilestoneData()

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="celebration-title"
    >
      {/* Backdrop with blur */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" />

      {/* Celebration Card */}
      <div
        className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-scaleIn"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Gradient header */}
        <div className={`inline-block px-4 py-2 rounded-full bg-gradient-to-r ${color} text-white text-sm font-semibold mb-4`}>
          MILESTONE UNLOCKED ✨
        </div>

        {/* Large emoji */}
        <div className="text-7xl mb-4 animate-bounce">
          {emoji}
        </div>

        {/* Percentage */}
        <h2 id="celebration-title" className="text-5xl font-bold text-gray-900 mb-2">
          {milestone}%
        </h2>
        <p className="text-2xl font-semibold text-gray-700 mb-6">
          {message}
        </p>

        {/* Message */}
        <p className="text-gray-600 mb-8 text-lg leading-relaxed">
          You've completed <span className="font-semibold text-gray-900">{milestone}%</span> of{' '}
          <span className="font-semibold text-gray-900">"{chapterTitle}"</span>
        </p>

        {/* Continue button */}
        <button
          onClick={onClose}
          className={`w-full py-4 px-6 rounded-xl bg-gradient-to-r ${color} text-white font-semibold text-lg hover:shadow-lg transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2`}
        >
          Continue Reading
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
          </svg>
        </button>

        {/* Fireworks/Confetti Animation for all milestones */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden rounded-2xl">
          {/* Fireworks particles */}
          {Array.from({ length: 20 }).map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full animate-fireworks"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#fbbf24', '#f472b6', '#60a5fa', '#34d399', '#f59e0b'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 2}s`,
                animationDuration: `${2 + Math.random()}s`,
              }}
            />
          ))}
          {/* Larger confetti pieces */}
          {Array.from({ length: 15 }).map((_, i) => (
            <div
              key={`large-${i}`}
              className="absolute w-3 h-3 animate-fireworks"
              style={{
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
                backgroundColor: ['#ef4444', '#8b5cf6', '#06b6d4', '#f59e0b', '#ec4899'][Math.floor(Math.random() * 5)],
                animationDelay: `${Math.random() * 1.5}s`,
                animationDuration: `${2.5 + Math.random()}s`,
                transform: `rotate(${Math.random() * 360}deg)`,
                clipPath: 'polygon(50% 0%, 0% 100%, 100% 100%)',
              }}
            />
          ))}
        </div>
      </div>

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.8) translateY(20px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        @keyframes confetti {
          0% {
            transform: translateY(0) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(400px) rotate(360deg);
            opacity: 0;
          }
        }

        @keyframes fireworks {
          0% {
            transform: translate(0, 0) scale(0) rotate(0deg);
            opacity: 1;
          }
          50% {
            opacity: 1;
          }
          100% {
            transform: translate(
              ${Math.random() * 200 - 100}px,
              ${Math.random() * 200 - 100}px
            ) scale(1.5) rotate(360deg);
            opacity: 0;
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.4s cubic-bezier(0.34, 1.56, 0.64, 1);
        }

        .animate-confetti {
          animation: confetti 2s ease-out infinite;
        }

        .animate-fireworks {
          animation: fireworks 2s ease-out forwards;
        }
      `}</style>
    </div>
  )
}
