'use client';

import { useEffect, useMemo } from 'react';
import { tryPrefetch } from '@/lib/prefetch/clientPrefetchCache';

type PrefetchPriority = 'high' | 'low' | 'auto';

interface PrefetchOptions {
  priority?: PrefetchPriority;
  usePreload?: boolean;
  defer?: boolean;
}

interface ScheduledTask {
  run: () => void;
  cancel: () => void;
}

function scheduleTask(task: () => void, defer: boolean): ScheduledTask {
  if (!defer) {
    return {
      run: task,
      cancel: () => {},
    };
  }

  if (typeof window === 'undefined') {
    return {
      run: () => {},
      cancel: () => {},
    };
  }

  // At this point we know window exists
  if ('requestIdleCallback' in window) {
    const id = (window as any).requestIdleCallback(() => {
      task();
    });

    return {
      run: () => {},
      cancel: () => (window as any).cancelIdleCallback(id),
    };
  }

  // Fallback to setTimeout
  const id = (window as any).setTimeout(task, 120);

  return {
    run: () => {},
    cancel: () => (window as any).clearTimeout(id),
  };
}

function createImageRequest(src: string, priority: PrefetchPriority) {
  const img = new window.Image();
  img.decoding = 'async';
  (img as HTMLImageElement & { fetchPriority?: PrefetchPriority }).fetchPriority = priority;
  img.src = src;
  return img;
}

function getUniqueSrcs(srcs: (string | null | undefined)[]) {
  return Array.from(
    new Set(
      srcs
        .filter((src): src is string => typeof src === 'string' && src.trim().length > 0)
        .map((src) => src.trim())
    )
  );
}

/**
 * Aggressively preload an image before navigation.
 * Uses both <link rel="preload"> and Image() warm-up for maximum effect.
 * 
 * This hook should be called with the next page's hero image URL
 * to ensure it's already loaded when the user navigates.
 */
export function usePrefetchImage(src?: string | null, options?: PrefetchOptions) {
  const priority = options?.priority ?? 'high';
  const usePreload = options?.usePreload ?? true;
  const defer = options?.defer ?? false;

  useEffect(() => {
    if (!src || typeof window === 'undefined') return;

    let preload: HTMLLinkElement | null = null;

    // Use global dedup cache to avoid redundant prefetch across component instances
    tryPrefetch(src, () => {
      const scheduled = scheduleTask(() => {
        if (usePreload) {
          preload = document.createElement('link');
          preload.rel = 'preload';
          preload.as = 'image';
          preload.href = src;
          document.head.appendChild(preload);
        }

        createImageRequest(src, priority);
      }, defer);

      scheduled.run();
    });

    return () => {
      // Clean up preload link when component unmounts or src changes
      if (preload && document.head.contains(preload)) {
        document.head.removeChild(preload);
      }
    };
  }, [src, priority, usePreload, defer]);
}

/**
 * Preload multiple images at once (useful for prefetching next 2-3 pages).
 * Lower priority than single image prefetch.
 */
export function usePrefetchImages(srcs: (string | null | undefined)[], options?: PrefetchOptions) {
  const priority = options?.priority ?? 'low';
  const usePreload = options?.usePreload ?? false;
  const defer = options?.defer ?? true;
  const srcKey = getUniqueSrcs(srcs).join('|');
  const validSrcs = useMemo(() => getUniqueSrcs(srcs), [srcKey]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (validSrcs.length === 0) return;

    const preloadLinks: HTMLLinkElement[] = [];
    
    // Use global dedup cache for each image to avoid redundant prefetch
    validSrcs.forEach((src) => {
      tryPrefetch(src, () => {
        const scheduled = scheduleTask(() => {
          if (usePreload) {
            const preload = document.createElement('link');
            preload.rel = 'preload';
            preload.as = 'image';
            preload.href = src;
            document.head.appendChild(preload);
            preloadLinks.push(preload);
          }

          createImageRequest(src, priority);
        }, defer);

        scheduled.run();
      });
    });

    return () => {
      preloadLinks.forEach((preload) => {
        if (document.head.contains(preload)) {
          document.head.removeChild(preload);
        }
      });
    };
  }, [validSrcs, priority, usePreload, defer]);
}
