'use client';

import { useEffect } from 'react';

interface Props {
  currentChapter: number;
}

/**
 * Syncs the server-computed current chapter from the dashboard
 * into localStorage so client-only components like DashboardNav
 * can read it even when the URL doesn't include a chapter number.
 */
export default function CurrentChapterSync({ currentChapter }: Props) {
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('tcpCurrentChapter', String(currentChapter));
    } catch {
      // ignore storage errors
    }
  }, [currentChapter]);

  return null;
}

