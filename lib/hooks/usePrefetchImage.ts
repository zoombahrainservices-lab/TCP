'use client';

import { useEffect } from 'react';

/**
 * Aggressively preload an image before navigation.
 * Uses both <link rel="preload"> and Image() warm-up for maximum effect.
 * 
 * This hook should be called with the next page's hero image URL
 * to ensure it's already loaded when the user navigates.
 */
export function usePrefetchImage(src?: string | null) {
  useEffect(() => {
    if (!src || typeof window === 'undefined') return;

    // Method 1: Preload link tag (browser recognizes this early)
    const preload = document.createElement('link');
    preload.rel = 'preload';
    preload.as = 'image';
    preload.href = src;
    // Add to head for immediate processing
    document.head.appendChild(preload);

    // Method 2: Image() object with high priority hint
    const img = new window.Image();
    img.decoding = 'async';
    // @ts-ignore - fetchPriority is supported but not in all type definitions
    img.fetchPriority = 'high';
    img.src = src;

    return () => {
      // Clean up preload link when component unmounts or src changes
      if (document.head.contains(preload)) {
        document.head.removeChild(preload);
      }
    };
  }, [src]);
}

/**
 * Preload multiple images at once (useful for prefetching next 2-3 pages).
 * Lower priority than single image prefetch.
 */
export function usePrefetchImages(srcs: (string | null | undefined)[]) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const validSrcs = srcs.filter((src): src is string => Boolean(src));
    if (validSrcs.length === 0) return;

    const images: HTMLImageElement[] = [];
    
    validSrcs.forEach((src) => {
      const img = new window.Image();
      img.decoding = 'async';
      img.src = src;
      images.push(img);
    });

    // No cleanup needed for Image() objects
  }, [srcs]);
}
