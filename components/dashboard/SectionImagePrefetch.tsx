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
 * Aggressively prefetches the reading section image and route when dashboard loads.
 * Uses high-priority, non-deferred prefetch so image and route are ready before user clicks "Continue".
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

  // Prefetch the reading route bundle
  useEffect(() => {
    if (continueHref) {
      tryPrefetch(continueHref, () => {
        router.prefetch(continueHref);
      });
    }
  }, [router, continueHref]);

  return null;
}
