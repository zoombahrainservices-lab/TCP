'use client'

import { motion } from 'framer-motion'
import { ReactNode } from 'react'

interface DuoButtonProps {
  children: ReactNode
  variant?: 'primary' | 'secondary' | 'outline' | 'success' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  fullWidth?: boolean
  onClick?: () => void
  disabled?: boolean
  className?: string
}

/**
 * Duolingo-style button component
 * Bright, friendly, with smooth hover animations
 */
export function DuoButton({
  children,
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  onClick,
  disabled = false,
  className = ''
}: DuoButtonProps) {
  const variants = {
    primary: 'bg-[var(--color-amber)] hover:bg-[#d49f01] text-white shadow-md',
    secondary: 'bg-[var(--color-blue)] hover:bg-[#3a7bc8] text-white shadow-md',
    outline: 'bg-white border-3 border-[var(--color-charcoal)] hover:bg-[var(--color-charcoal)] text-[var(--color-charcoal)] hover:text-white',
    success: 'bg-green-500 hover:bg-green-600 text-white shadow-md',
    danger: 'bg-[var(--color-red)] hover:bg-[#d32f3c] text-white shadow-md'
  }

  const sizes = {
    sm: 'px-4 py-2 text-sm rounded-xl',
    md: 'px-6 py-3 text-base rounded-2xl',
    lg: 'px-8 py-4 text-lg rounded-2xl'
  }

  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.02 } : {}}
      whileTap={!disabled ? { scale: 0.98 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={`
        ${variants[variant]}
        ${sizes[size]}
        ${fullWidth ? 'w-full' : ''}
        font-bold uppercase tracking-wide
        transition-all duration-200
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      {children}
    </motion.button>
  )
}
