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
        sizes="(max-width: 1024px) 100vw, 50vw"
        onLoad={handleLoad}
        onError={handleError}
      />
    </>
  );
}
