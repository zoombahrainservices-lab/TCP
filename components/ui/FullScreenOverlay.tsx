import React from 'react'
import { motion } from 'framer-motion'
import { X } from 'lucide-react'
import Image from 'next/image'

interface FullScreenOverlayProps {
  progress?: number
  onClose?: () => void
  showLogo?: boolean
  children: React.ReactNode
  showBackgroundAnimation?: boolean
}

export default function FullScreenOverlay({
  progress = 0,
  onClose,
  showLogo = true,
  children,
  showBackgroundAnimation = true,
}: FullScreenOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 bg-gradient-to-br from-white via-gray-50/50 to-white dark:from-[#0a1628] dark:via-[#142A4A] dark:to-[#0a1628] overflow-hidden">
      {/* Progress bar */}
      {progress > 0 && (
        <div className="absolute top-0 left-0 right-0 h-3 bg-gray-200 dark:bg-gray-700 z-50">
          <motion.div
            className="h-full bg-[var(--color-blue)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.4 }}
          />
        </div>
      )}

      {/* Close button */}
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2.5 rounded-full bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm hover:bg-white dark:hover:bg-gray-700 transition-all shadow-lg z-50"
        >
          <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
        </button>
      )}

      {/* TCP Logo in bottom right corner */}
      {showLogo && (
        <div className="absolute bottom-8 right-8 z-10 opacity-30">
          <Image
            src="/TCP-Logo.svg"
            alt="TCP"
            width={200}
            height={60}
            className="w-48 h-auto"
          />
        </div>
      )}

      {/* Main content */}
      <div className="h-full w-full flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-5xl mb-28">{children}</div>
      </div>

      {/* Background decoration */}
      {showBackgroundAnimation && (
        <div className="absolute inset-0 pointer-events-none overflow-hidden -z-0">
          <motion.div
            animate={{
              scale: [1, 1.2, 1],
              rotate: [0, 90, 0],
              x: [0, 50, 0],
              y: [0, -30, 0],
            }}
            transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -top-1/4 -left-1/4 w-1/2 h-1/2 bg-gradient-to-br from-[#0073ba]/10 via-[#4bc4dc]/5 to-transparent rounded-full blur-3xl"
          />
          <motion.div
            animate={{
              scale: [1, 1.3, 1],
              rotate: [0, -90, 0],
              x: [0, -50, 0],
              y: [0, 30, 0],
            }}
            transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut' }}
            className="absolute -bottom-1/4 -right-1/4 w-1/2 h-1/2 bg-gradient-to-tl from-[#ff6a38]/10 via-[#ff8c63]/5 to-transparent rounded-full blur-3xl"
          />
        </div>
      )}
    </div>
  )
}
