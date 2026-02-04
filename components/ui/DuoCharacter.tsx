'use client'

import { motion } from 'framer-motion'

export interface DuoCharacterProps {
  variant?: 'happy' | 'thinking' | 'celebrating' | 'working' | 'reading'
  size?: 'sm' | 'md' | 'lg' | 'xl'
  animate?: boolean
  className?: string
}

/**
 * Duolingo-style character avatar
 * Simple, friendly, colorful circular avatars
 */
export function DuoCharacter({
  variant = 'happy',
  size = 'md',
  animate = true,
  className = ''
}: DuoCharacterProps) {
  const sizes = {
    sm: 'w-12 h-12',
    md: 'w-20 h-20',
    lg: 'w-32 h-32',
    xl: 'w-48 h-48'
  }

  const gradients = {
    happy: 'from-[var(--color-amber)] to-[#f7c94b]',
    thinking: 'from-[var(--color-blue)] to-[#6BA8E8]',
    celebrating: 'from-[var(--color-red)] to-[#ff6b78]',
    working: 'from-purple-500 to-purple-400',
    reading: 'from-teal-500 to-teal-400'
  }

  const emojis = {
    happy: '😊',
    thinking: '🤔',
    celebrating: '🎉',
    working: '💪',
    reading: '📖'
  }

  const animationProps = animate ? {
    animate: {
      y: [0, -8, 0],
      rotate: [0, 2, -2, 0]
    },
    transition: {
      duration: 2,
      repeat: Infinity,
      ease: [0.42, 0, 0.58, 1] as const
    }
  } : {}

  return (
    <motion.div
      {...animationProps}
      className={`
        ${sizes[size]}
        rounded-full
        bg-gradient-to-br ${gradients[variant]}
        flex items-center justify-center
        shadow-lg
        relative
        overflow-hidden
        ${className}
      `}
    >
      {/* Subtle shine effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent"></div>
      
      {/* Character/Emoji */}
      <span className="text-4xl relative z-10">
        {emojis[variant]}
      </span>
      
      {/* Bottom accent */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-3/4 h-1/4 bg-white/10 rounded-full blur-sm"></div>
    </motion.div>
  )
}
