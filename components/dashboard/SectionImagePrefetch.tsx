'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { usePrefetchImage } from '@/lib/hooks/usePrefetchImage';
import { getSectionImageUrlPrimary } from '@/lib/chapterImages';
import { tryPrefetch } from '@/lib/prefetch/clientPrefetchCache';

interface SectionImagePrefetchProps {
  currentChapter: number;
  continueHref: string;
}

/**
 * Aggressively prefetches the reading section when dashboard loads.
 * Uses high-priority image preload and route prefetch.
 */
export default function SectionImagePrefetch({ currentChapter, continueHref }: SectionImagePrefetchProps) {
  const router = useRouter();
  const readingImageUrl = getSectionImageUrlPrimary(currentChapter, 'read');
  
  // Prefetch the reading section image
  usePrefetchImage(readingImageUrl, {
    priority: 'high',
    usePreload: true,
    defer: false,
  });

  // Prefetch the reading route using the actual continueHref
  useEffect(() => {
    if (continueHref) {
      tryPrefetch(`route:${continueHref}`, () => {
        router.prefetch(continueHref);
      });
    }
  }, [router, continueHref]);

  return null;
}
