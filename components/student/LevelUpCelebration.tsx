'use client'

import { useEffect, useRef } from 'react'
import confetti from 'canvas-confetti'

interface LevelUpCelebrationProps {
  open: boolean
  newLevel: number
  oldLevel: number
  totalXP: number
  onClose: () => void
}

export default function LevelUpCelebration({ 
  open, 
  newLevel, 
  oldLevel,
  totalXP,
  onClose 
}: LevelUpCelebrationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)

  // Launch confetti celebration
  useEffect(() => {
    if (!open) return

    const colors = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444']
    
    // Multiple confetti bursts
    const launchConfetti = () => {
      // Left side burst
      confetti({
        particleCount: 100,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.6 },
        colors: colors,
        zIndex: 60,
      })

      // Right side burst
      confetti({
        particleCount: 100,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.6 },
        colors: colors,
        zIndex: 60,
      })

      // Center burst
      setTimeout(() => {
        confetti({
          particleCount: 150,
          spread: 80,
          origin: { x: 0.5, y: 0.5 },
          colors: colors,
          zIndex: 60,
        })
      }, 200)

      // Top burst
      setTimeout(() => {
        confetti({
          particleCount: 80,
          angle: 90,
          spread: 70,
          origin: { x: 0.5, y: 0 },
          colors: colors,
          zIndex: 60,
        })
      }, 400)
    }

    launchConfetti()

    // Repeat confetti after 1 second
    const repeatTimer = setTimeout(launchConfetti, 1000)

    return () => clearTimeout(repeatTimer)
  }, [open])

  // Auto-dismiss after 4 seconds
  useEffect(() => {
    if (!open) return

    const timer = setTimeout(() => {
      onClose()
    }, 4000)

    return () => clearTimeout(timer)
  }, [open, onClose])

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-labelledby="level-up-title"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" style={{ zIndex: 55 }} />

      {/* Celebration Card */}
      <div
        className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-purple-900 rounded-2xl shadow-2xl max-w-lg w-full p-8 text-center animate-scaleIn border-2 border-blue-500/50"
        onClick={(e) => e.stopPropagation()}
        style={{ zIndex: 60 }}
      >
        {/* Glow effect */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 blur-xl" />

        {/* Content */}
        <div className="relative z-10">
          {/* Badge */}
          <div className="inline-block px-4 py-2 rounded-full bg-gradient-to-r from-cyan-500 to-blue-500 text-white text-sm font-bold mb-4 animate-pulse">
            🎉 LEVEL UP! 🎉
          </div>

          {/* Large Shield Icon */}
          <div className="text-8xl mb-4 animate-bounce">
            🛡️
          </div>

          {/* Level Display */}
          <h2 id="level-up-title" className="text-6xl font-bold text-white mb-2">
            Level {newLevel}
          </h2>
          
          <p className="text-2xl font-semibold text-blue-300 mb-6">
            Agent Rank Increased!
          </p>

          {/* Stats */}
          <div className="bg-black/30 rounded-xl p-6 mb-6 space-y-3">
            <div className="flex items-center justify-between text-white">
              <span className="text-slate-300">Previous Level:</span>
              <span className="text-2xl font-bold">{oldLevel}</span>
            </div>
            <div className="flex items-center justify-between text-white">
              <span className="text-slate-300">New Level:</span>
              <span className="text-2xl font-bold text-green-400">{newLevel}</span>
            </div>
            <div className="flex items-center justify-between text-white pt-3 border-t border-slate-700">
              <span className="text-slate-300">XP Earned:</span>
              <span className="text-xl font-bold text-cyan-400">+{totalXP} XP</span>
            </div>
          </div>

          {/* Message */}
          <p className="text-slate-300 mb-8 text-lg leading-relaxed">
            Congratulations! Your dedication and hard work have paid off. 
            Keep pushing forward on your journey to mastery!
          </p>

          {/* Continue button */}
          <button
            onClick={onClose}
            className="w-full py-4 px-6 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 text-white font-bold text-lg hover:shadow-lg hover:shadow-blue-500/50 transform hover:scale-105 transition-all duration-200 flex items-center justify-center gap-2"
          >
            Continue Journey
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </button>

          {/* Tap to close hint */}
          <p className="text-slate-500 text-xs mt-4">
            Tap anywhere or press ESC to continue
          </p>
        </div>
      </div>

      {/* Canvas for confetti */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none"
        style={{ zIndex: 65 }}
      />

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
            transform: scale(0.8) translateY(30px);
          }
          to {
            opacity: 1;
            transform: scale(1) translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.3s ease-out;
        }

        .animate-scaleIn {
          animation: scaleIn 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      `}</style>
    </div>
  )
}
