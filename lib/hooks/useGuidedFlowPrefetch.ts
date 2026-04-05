'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrefetchImage } from './usePrefetchImage';
import { tryPrefetch } from '@/lib/prefetch/clientPrefetchCache';

interface GuidedFlowPrefetchOptions {
  /** Current chapter number */
  chapterNumber: number;
  /** Canonical URL of next section */
  nextUrl: string | null;
  /** Hero image URL for next section */
  nextHeroImage: string | null;
  /** Whether to prefetch dashboard */
  prefetchDashboard?: boolean;
  /** Whether currently near the end of section */
  isNearEnd?: boolean;
}

/**
 * Unified prefetch hook for guided-book flow.
 * Handles route prefetching and next-section hero image warming.
 */
export function useGuidedFlowPrefetch({
  chapterNumber,
  nextUrl,
  nextHeroImage,
  prefetchDashboard = true,
  isNearEnd = false,
}: GuidedFlowPrefetchOptions) {
  const router = useRouter();

  // Prefetch next section route with global dedup
  useEffect(() => {
    if (nextUrl) {
      tryPrefetch(nextUrl, () => {
        router.prefetch(nextUrl);
      });
    }
  }, [router, nextUrl]);

  // Prefetch dashboard when near end with global dedup
  useEffect(() => {
    if (prefetchDashboard && isNearEnd) {
      tryPrefetch('/dashboard', () => {
        router.prefetch('/dashboard');
      });
    }
  }, [router, prefetchDashboard, isNearEnd]);

  // Aggressively prefetch next section hero image
  usePrefetchImage(nextHeroImage, {
    priority: 'high',
    usePreload: true,
    defer: false,
  });
}
