'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface DuoCardProps {
  children: ReactNode
  className?: string
  delay?: number
  hover?: boolean
  borderColor?: 'amber' | 'blue' | 'red' | 'gray' | 'none'
}

/**
 * Duolingo-style card component with smooth animations
 * Used for feature cards, progress cards, etc.
 */
export function DuoCard({ 
  children, 
  className = '', 
  delay = 0,
  hover = true,
  borderColor = 'none'
}: DuoCardProps) {
  const borderColors = {
    amber: 'border-[var(--color-amber)]/30',
    blue: 'border-[var(--color-blue)]/30',
    red: 'border-[var(--color-red)]/30',
    gray: 'border-gray-200',
    none: 'border-transparent'
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={hover ? { scale: 1.02, y: -4 } : {}}
      className={`
        bg-white rounded-2xl shadow-lg border-2 ${borderColors[borderColor]}
        transition-all duration-300
        ${className}
      `}
    >
      {children}
    </motion.div>
  )
}
