'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

interface PageTransitionProps {
  children: ReactNode
  className?: string
}

/**
 * PageTransition - Adds a subtle fade-in effect to page content
 * 
 * Wraps page content with a lightweight transition that:
 * - Fades in from 0 to 1 opacity (subtle, not jarring)
 * - Slides up slightly (10px) for depth perception
 * - Completes in 0.3s (fast enough to feel instant)
 * - Respects reduced-motion preference via Framer Motion's built-in support
 * 
 * Usage:
 * ```tsx
 * <PageTransition>
 *   <YourPageContent />
 * </PageTransition>
 * ```
 * 
 * For junior developers:
 * This makes page navigation feel smoother by avoiding the "hard cut" effect.
 * Instead of content instantly appearing, it fades in gracefully.
 * The animation is subtle enough that most users won't consciously notice it,
 * but they'll feel the app is more polished.
 */
export default function PageTransition({ children, className = '' }: PageTransitionProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.3,
        ease: 'easeOut',
      }}
      className={className}
    >
      {children}
    </motion.div>
  )
}
