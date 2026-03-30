'use client'

import { useEffect, useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import type { CelebrationPayload, SectionKey } from '@/lib/celebration/types'

// Lazy-load LottieIcon component
const LottieIcon = dynamic(() => import('./LottieIcon'), {
  loading: () => <div className="w-24 h-24" />,
  ssr: false
});

interface FullscreenCelebrationProps {
  payload: CelebrationPayload
  onClose: () => void
}

// Per-section theming
const sectionThemes: Record<SectionKey, string> = {
  reading: 'from-blue-500/20 to-cyan-500/20',
  assessment: 'from-purple-500/20 to-pink-500/20',
  framework: 'from-teal-500/20 to-green-500/20',
  techniques: 'from-green-500/20 to-emerald-500/20',
  proof: 'from-orange-500/20 to-amber-500/20',
  follow_through: 'from-yellow-500/20 to-gold-500/20',
}

// Check if user prefers reduced motion
function prefersReducedMotion(): boolean {
  if (typeof window === 'undefined') return false
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

export default function FullscreenCelebration({ payload, onClose }: FullscreenCelebrationProps) {
  const [xpDisplay, setXpDisplay] = useState(0)
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined)
  const reducedMotion = prefersReducedMotion()

  // Count-up animation for XP
  useEffect(() => {
    if (!payload.xp) return

    const targetXp = payload.xp
    const duration = 800
    const steps = 30
    const increment = targetXp / steps
    const stepDuration = duration / steps

    let current = 0
    const interval = setInterval(() => {
      current += increment
      if (current >= targetXp) {
        setXpDisplay(targetXp)
        clearInterval(interval)
      } else {
        setXpDisplay(Math.floor(current))
      }
    }, stepDuration)

    return () => clearInterval(interval)
  }, [payload.xp])

  // Trigger confetti
  useEffect(() => {
    if (reducedMotion) return

    const particleCount = payload.intensity === 'mega' ? 150 : 
                         payload.intensity === 'big' ? 100 : 40
    
    const spread = payload.intensity === 'mega' ? 90 : 
                   payload.intensity === 'big' ? 70 : 55
    
    const startVelocity = payload.intensity === 'mega' ? 30 : 
                         payload.intensity === 'big' ? 25 : 18

    // Dynamically import confetti only when needed
    import('canvas-confetti').then((module) => {
      const confetti = module.default
      
      confetti({
        particleCount,
        spread,
        startVelocity,
        origin: { y: 0.85 },
        scalar: payload.intensity === 'micro' ? 0.8 : 1,
      })

      // For mega celebrations, add a second burst
      if (payload.intensity === 'mega') {
        setTimeout(() => {
          confetti({
            particleCount: 100,
            spread: 70,
            startVelocity: 25,
            origin: { y: 0.85 },
          })
        }, 250)
      }
    })
  }, [payload.intensity, reducedMotion])

  // Play sound
  useEffect(() => {
    // Dynamically import sound library only when needed
    import('@/lib/celebration/sounds').then((module) => {
      module.playSound(payload.type)
    })
  }, [payload.type])

  // Auto-close timer
  useEffect(() => {
    const closeMs = payload.autoCloseMs ?? 5000
    timerRef.current = setTimeout(() => {
      onClose()
    }, closeMs)

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [payload.autoCloseMs, onClose])

  // ESC key to close
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [onClose])

  // Get theme gradient
  const themeGradient = payload.sectionKey 
    ? sectionThemes[payload.sectionKey] 
    : 'from-purple-500/20 to-blue-500/20'

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        className="fixed inset-0 z-50 flex items-center justify-center"
        onClick={onClose}
        role="dialog"
        aria-modal="true"
        aria-labelledby="celebration-title"
      >
        {/* Backdrop */}
        <motion.div
          initial={{ backdropFilter: 'blur(0px)' }}
          animate={{ backdropFilter: 'blur(8px)' }}
          exit={{ backdropFilter: 'blur(0px)' }}
          className={`absolute inset-0 bg-gradient-to-br ${themeGradient} bg-black/40`}
        />

        {/* Card */}
        <motion.div
          initial={{ scale: reducedMotion ? 1 : 0.92, y: reducedMotion ? 0 : 20, opacity: 0 }}
          animate={{ scale: 1, y: 0, opacity: 1 }}
          exit={{ scale: reducedMotion ? 1 : 0.95, opacity: 0 }}
          transition={{ 
            type: 'spring', 
            stiffness: 300, 
            damping: 30,
            duration: 0.3
          }}
          className="relative z-10 bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 max-w-md w-full mx-4 overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Shine sweep for level-up */}
          {payload.type === 'levelup' && !reducedMotion && (
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: '200%' }}
              transition={{ duration: 1.2, ease: 'easeInOut' }}
              className="absolute inset-0 bg-gradient-to-r from-transparent via-yellow-300/30 to-transparent"
              style={{ width: '50%' }}
            />
          )}

          {/* Glow pulse for streak */}
          {payload.type === 'streak' && !reducedMotion && (
            <motion.div
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
              className="absolute inset-0 bg-orange-500/10 rounded-2xl"
            />
          )}

          {/* Content */}
          <div className="relative z-10 flex flex-col items-center text-center space-y-4">
            {/* Lottie Animation */}
            <div className="w-24 h-24">
              <LottieIcon type={payload.type} className="w-full h-full" />
            </div>

            {/* Title */}
            <motion.h2
              id="celebration-title"
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.3 }}
              className="text-3xl font-bold text-gray-900 dark:text-white"
            >
              {payload.title}
            </motion.h2>

            {/* Subtitle */}
            {payload.subtitle && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-lg text-gray-600 dark:text-gray-400"
              >
                {payload.subtitle}
              </motion.p>
            )}

            {/* XP Display */}
            {payload.xp !== undefined && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-5xl font-bold text-purple-600 dark:text-purple-400"
              >
                +{xpDisplay} XP
              </motion.div>
            )}

            {/* Bonus XP for streaks */}
            {payload.bonusXp !== undefined && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.3, duration: 0.3 }}
                className="text-4xl font-bold text-orange-600 dark:text-orange-400"
              >
                +{payload.bonusXp} XP Bonus
              </motion.div>
            )}

            {/* Progress ring for chapter completion */}
            {payload.type === 'chapter' && (
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.4, duration: 0.3 }}
                className="relative w-32 h-32"
              >
                <svg className="w-full h-full" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    className="text-gray-200 dark:text-gray-700"
                  />
                  <motion.circle
                    cx="50"
                    cy="50"
                    r="45"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="8"
                    strokeLinecap="round"
                    className="text-green-500"
                    initial={{ pathLength: 0 }}
                    animate={{ pathLength: 1 }}
                    transition={{ duration: 1.5, ease: 'easeInOut' }}
                    style={{
                      transformOrigin: 'center',
                      transform: 'rotate(-90deg)',
                    }}
                  />
                </svg>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl font-bold text-green-600 dark:text-green-400">
                    6/6
                  </span>
                </div>
              </motion.div>
            )}

            {/* Tap to continue hint */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.6 }}
              transition={{ delay: 0.8, duration: 0.5 }}
              className="text-sm text-gray-500 dark:text-gray-500 pt-4"
            >
              Tap anywhere to continue
            </motion.p>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
