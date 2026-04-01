'use client';

import { usePrefetchImage } from '@/lib/hooks/usePrefetchImage';
import { getSectionImageUrlPrimary } from '@/lib/chapterImages';

interface SectionImagePrefetchProps {
  currentChapter: number;
}

/**
 * Aggressively prefetches the reading section image when dashboard loads.
 * Uses high-priority, non-deferred prefetch so image is ready before user clicks "Continue".
 */
export default function SectionImagePrefetch({ currentChapter }: SectionImagePrefetchProps) {
  const readingImageUrl = getSectionImageUrlPrimary(currentChapter, 'read');
  
  usePrefetchImage(readingImageUrl, {
    priority: 'high',
    usePreload: true,
    defer: false,
  });

  return null;
}
