'use client'

import { useEffect, useRef, useState } from 'react'
import type { CelebrationType } from '@/lib/celebration/types'

interface LottieIconProps {
  type: CelebrationType
  className?: string
}

const lottieFiles: Record<CelebrationType, string> = {
  section: '/lotties/section-burst.json',
  streak: '/lotties/streak-flame.json',
  levelup: '/lotties/levelup-shine.json',
  chapter: '/lotties/chapter-trophy.json'
}

const fallbackIcons: Record<CelebrationType, string> = {
  section: '✨',
  streak: '🔥',
  levelup: '🏆',
  chapter: '🎉'
}

export default function LottieIcon({ type, className = '' }: LottieIconProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const [hasError, setHasError] = useState(false)
  const lottieFile = lottieFiles[type]
  const fallbackIcon = fallbackIcons[type]

  useEffect(() => {
    if (!containerRef.current || hasError) return

    let animationInstance: any = null

    // Dynamically import lottie-web only on client
    import('lottie-web').then((lottie) => {
      if (!containerRef.current) return

      try {
        animationInstance = lottie.default.loadAnimation({
          container: containerRef.current,
          renderer: 'svg',
          loop: true,
          autoplay: true,
          path: lottieFile
        })
      } catch (error) {
        console.warn(`Failed to load Lottie for ${type}`, error)
        setHasError(true)
      }
    }).catch((error) => {
      console.warn(`Failed to import lottie-web for ${type}`, error)
      setHasError(true)
    })

    return () => {
      if (animationInstance) {
        animationInstance.destroy()
      }
    }
  }, [lottieFile, type, hasError])

  return (
    <div className={`relative ${className}`}>
      {hasError ? (
        <div className="absolute inset-0 flex items-center justify-center text-6xl">
          {fallbackIcon}
        </div>
      ) : (
        <div ref={containerRef} className="w-full h-full" />
      )}
    </div>
  )
}
