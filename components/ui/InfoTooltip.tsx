import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Info } from 'lucide-react'

interface InfoTooltipProps {
  content: string | React.ReactNode
  position?: 'top' | 'bottom' | 'left' | 'right'
  size?: 'sm' | 'md' | 'lg'
}

export default function InfoTooltip({
  content,
  position = 'top',
  size = 'md',
}: InfoTooltipProps) {
  const [showTooltip, setShowTooltip] = useState(false)

  const iconSizes = {
    sm: 'w-3 h-3',
    md: 'w-4 h-4',
    lg: 'w-5 h-5',
  }

  const tooltipWidth = {
    sm: 'w-48',
    md: 'w-72',
    lg: 'w-96',
  }

  const positionStyles = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  }

  const animationDirection = {
    top: { initial: { y: 10 }, animate: { y: 0 }, exit: { y: 10 } },
    bottom: { initial: { y: -10 }, animate: { y: 0 }, exit: { y: -10 } },
    left: { initial: { x: 10 }, animate: { x: 0 }, exit: { x: 10 } },
    right: { initial: { x: -10 }, animate: { x: 0 }, exit: { x: -10 } },
  }

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShowTooltip(true)}
        onMouseLeave={() => setShowTooltip(false)}
        className="cursor-help"
      >
        <Info
          className={`${iconSizes[size]} text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-400 transition-colors`}
        />
      </div>

      <AnimatePresence>
        {showTooltip && (
          <motion.div
            initial={{ opacity: 0, ...animationDirection[position].initial }}
            animate={{ opacity: 1, ...animationDirection[position].animate }}
            exit={{ opacity: 0, ...animationDirection[position].exit }}
            className={`absolute ${positionStyles[position]} ${tooltipWidth[size]} p-3 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 z-50`}
          >
            {typeof content === 'string' ? (
              <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                {content}
              </p>
            ) : (
              content
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
