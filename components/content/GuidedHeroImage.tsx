'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface GuidedHeroImageProps {
  src: string | null;
  alt: string;
  fallbackGradient?: string;
  priority?: boolean;
  className?: string;
  onError?: () => void;
}

/**
 * Shared hero image component for guided-book flow.
 * Uses next/image for optimization with fallback gradient.
 * 
 * Optimized for fast loading:
 * - Correct sizes attribute (hero images are full-width)
 * - loading="eager" for current page (priority=true)
 * - Smooth fade-in transition
 * - Gradient placeholder prevents layout shift
 */
export default function GuidedHeroImage({
  src,
  alt,
  fallbackGradient = 'from-[#F2E9D8] to-[#E8DBC0] dark:from-[#0f1b2d] dark:to-[#13233a]',
  priority = false,
  className = '',
  onError,
}: GuidedHeroImageProps) {
  const [hasError, setHasError] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Reset error state when src changes
  useEffect(() => {
    setHasError(false);
    setIsLoaded(false);
  }, [src]);

  const handleError = () => {
    setHasError(true);
    onError?.();
  };

  const handleLoad = () => {
    setIsLoaded(true);
  };

  // Show gradient if no src or error
  if (!src || hasError) {
    return (
      <div className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient}`} />
    );
  }

  return (
    <>
      {/* Gradient placeholder - shown while loading */}
      {!isLoaded && (
        <div
          className={`absolute inset-0 bg-gradient-to-br ${fallbackGradient} animate-pulse`}
        />
      )}

      {/* Optimized image */}
      <Image
        src={src}
        alt={alt}
        fill
        className={`object-cover transition-opacity duration-300 ${className} ${
          isLoaded ? 'opacity-100' : 'opacity-0'
        }`}
        priority={priority}
        loading={priority ? 'eager' : 'lazy'}
        // FIXED: Hero images are full-width, not 50vw
        // This ensures next/image selects correct width (1080-1200 on desktop, 640-750 on mobile)
        sizes="100vw"
        // Quality 80 matches next.config.ts (was implicit 75)
        quality={80}
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
