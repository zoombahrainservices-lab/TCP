'use client';

import { createContext, useContext, useState, useCallback } from 'react';
import type { Page } from '@/lib/content/types';

interface CacheEntry {
  pages: Page[];
  timestamp: number;
}

interface ChapterCache {
  prefetchStepPages: (chapterSlug: string, stepSlug: string) => Promise<void>;
  getCachedPages: (stepId: string) => Page[] | null;
  clearCache: () => void;
}

const ChapterCacheContext = createContext<ChapterCache | null>(null);

export function ChapterCacheProvider({ children }: { children: React.ReactNode }) {
  const [cache, setCache] = useState<Map<string, CacheEntry>>(new Map());

  const prefetchStepPages = useCallback(async (chapterSlug: string, stepSlug: string) => {
    const key = `${chapterSlug}/${stepSlug}`;
    
    // Don't refetch if cached within last 5 minutes
    const existing = cache.get(key);
    if (existing && Date.now() - existing.timestamp < 300000) {
      return;
    }

    try {
      const response = await fetch(`/api/content/step-pages?chapter=${chapterSlug}&step=${stepSlug}`);
      if (!response.ok) {
        console.error('[Cache] Prefetch failed:', response.status);
        return;
      }
      
      const data = await response.json();
      
      setCache(prev => new Map(prev).set(key, {
        pages: data.pages || [],
        timestamp: Date.now()
      }));
      
      console.log(`[Cache] Prefetched ${key}`);
    } catch (error) {
      console.error('[Cache] Prefetch error:', error);
    }
  }, [cache]);

  const getCachedPages = useCallback((stepId: string) => {
    for (const [key, entry] of cache.entries()) {
      if (entry.pages[0]?.step_id === stepId) {
        return entry.pages;
      }
    }
    return null;
  }, [cache]);

  const clearCache = useCallback(() => {
    setCache(new Map());
  }, []);

  return (
    <ChapterCacheContext.Provider value={{ prefetchStepPages, getCachedPages, clearCache }}>
      {children}
    </ChapterCacheContext.Provider>
  );
}

export function useChapterCache() {
  const context = useContext(ChapterCacheContext);
  if (!context) {
    throw new Error('useChapterCache must be used within ChapterCacheProvider');
  }
  return context;
}
