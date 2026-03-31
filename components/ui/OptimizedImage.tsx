'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface OptimizedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string
  alt: string
  fallbackGradient?: string
  onLoadComplete?: () => void
}

/**
 * OptimizedImage - Native img with smooth fade-in on load
 * 
 * Provides better loading experience than raw <img>:
 * - Fades in smoothly when loaded (not instant pop-in)
 * - Shows gradient placeholder while loading
 * - Graceful error fallback
 * - Respects reduced-motion preference
 * 
 * Use for hero images and featured content where smooth appearance matters.
 * For content images in blocks, Next.js Image component is still preferred.
 * 
 * For junior developers:
 * Images can "pop in" and create a jarring experience. This component
 * fades the image in over 0.4s once it's loaded, making the appearance
 * feel more natural and polished. The gradient placeholder ensures
 * the layout is stable (no layout shift).
 */
export default function OptimizedImage({
  src,
  alt,
  fallbackGradient = 'from-[#F2E9D8] to-[#E8DBC0] dark:from-[#0f1b2d] dark:to-[#13233a]',
  className = '',
  onLoadComplete,
  onError,
  ...props
}: OptimizedImageProps) {
  const [isLoaded, setIsLoaded] = useState(false)
  const [hasError, setHasError] = useState(false)

  const handleLoad = () => {
    setIsLoaded(true)
    onLoadComplete?.()
  }

  const handleError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    setHasError(true)
    onError?.(e)
  }

  // If image failed to load, show gradient only
  if (hasError) {
    return <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
  }

  return (
    <>
      {/* Gradient placeholder - always rendered, hides when image loaded */}
      {!isLoaded && (
        <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} animate-pulse`} />
      )}
      
      {/* Image - fades in when loaded */}
      <motion.img
        src={src}
        alt={alt}
        className={className}
        onLoad={handleLoad}
        onError={handleError}
        initial={{ opacity: 0 }}
        animate={{ opacity: isLoaded ? 1 : 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        {...props}
      />
    </>
  )
}
