'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import ReadingLayout from '@/components/content/ReadingLayout';
import SectionLayout from '@/components/content/SectionLayout';
import PageNavigator from '@/components/content/PageNavigator';
import BlockRenderer from '@/components/content/BlockRenderer';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { submitAssessment, completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { showXPNotification } from '@/components/gamification/XPNotification';
import { useChapterCache } from '@/lib/cache/ChapterCacheContext';
import { writeQueue } from '@/lib/queue/WriteQueue';

interface Props {
  chapter: Chapter;
  step: Step;
  pages: Page[];
  nextStepSlug: string | null;
}

export default function DynamicStepClient({ chapter, step, pages, nextStepSlug }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const completedPagesRef = useRef<Set<string>>(new Set());

  const { prefetchStepPages } = useChapterCache();

  // Aggressive prefetching for instant navigation (route + data)
  useEffect(() => {
    if (currentPage >= pages.length - 2) {
      if (nextStepSlug) {
        router.prefetch(`/read/${chapter.slug}/${nextStepSlug}`);
        // Prefetch next step data
        prefetchStepPages(chapter.slug, nextStepSlug).catch(err => 
          console.error('[Prefetch] Next step data error:', err)
        );
      }
      router.prefetch('/dashboard');
    }
  }, [currentPage, pages.length, router, chapter.slug, nextStepSlug, prefetchStepPages]);

  const handleResponseChange = (promptId: string, value: any) => {
    setUserResponses(prev => ({ ...prev, [promptId]: value }));
  };

  const handleNext = async () => {
    const currentPageData = pages[currentPage];
    
    // Record page completion before moving to next page with retry queue
    if (currentPageData && !completedPagesRef.current.has(currentPageData.id)) {
      completedPagesRef.current.add(currentPageData.id);
      
      // Use write queue for automatic retry
      writeQueue.enqueue(() => completeDynamicPage({
        chapterNumber: chapter.chapter_number,
        stepId: step.id,
        pageId: currentPageData.id,
        stepType: step.step_type,
      }));
    }
    
    if (currentPage < pages.length - 1) setCurrentPage(currentPage + 1);
  };

  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleComplete = async () => {
    if (isProcessing) return;

    const lastPageData = pages[currentPage];
    
    // Navigate IMMEDIATELY - don't wait for DB operations
    if (nextStepSlug) {
      router.push(`/read/${chapter.slug}/${nextStepSlug}`);
    } else {
      router.push('/dashboard');
    }

    // All completions in background (non-blocking)
    const operations = [];

    // All completions go through write queue for automatic retry
    
    // Mark last page as complete
    if (lastPageData && !completedPagesRef.current.has(lastPageData.id)) {
      completedPagesRef.current.add(lastPageData.id);
      writeQueue.enqueue(() => completeDynamicPage({
        chapterNumber: chapter.chapter_number,
        stepId: step.id,
        pageId: lastPageData.id,
        stepType: step.step_type,
      }));
    }

    // If this is a self-check step, submit the assessment
    if (step.step_type === 'self_check') {
      const totalScore = Object.values(userResponses).reduce((sum: number, val: any) => {
        return sum + (typeof val === 'number' ? val : 0);
      }, 0);
      writeQueue.enqueue(() => submitAssessment(chapter.chapter_number, 'baseline', userResponses, totalScore));
    }

    // Complete the section (with XP notification)
    writeQueue.enqueue(async () => {
      const sectionResult = await completeDynamicSection({
        chapterNumber: chapter.chapter_number,
        stepType: step.step_type,
      });
      
      if (sectionResult && sectionResult.success) {
        const xp = (sectionResult as any).xpResult?.xpAwarded ?? 0;
        const sectionName = step.step_type === 'self_check' ? 'Self-Check' : step.title;
        if (xp > 0) {
          showXPNotification(xp, `${sectionName} Complete!`, { reasonCode: (sectionResult as any).reasonCode as any });
        } else if ((sectionResult as any).reasonCode === 'repeat_completion') {
          showXPNotification(0, '', { reasonCode: 'repeat_completion' });
        }
      }
    });
  };

  const currentPageData = pages[currentPage];
  const progress = pages.length ? ((currentPage + 1) / pages.length) * 100 : 0;

  // Derive hero image and content blocks so that image is on the LEFT
  // (like the original Chapter 1 framework/techniques/follow-through).
  // If a "Your Turn" page has no image, reuse the previous page's image
  // so S → S Your Turn, N → N Your Turn, etc. share the same art.
  const rawBlocks = (currentPageData?.content ?? []) as any[];
  const firstBlock = rawBlocks[0];

  let heroImageSrc: string = chapter.thumbnail_url || '/placeholder.png';
  let heroImageAlt: string = currentPageData?.title || step.title;
  let contentBlocks: any[] = rawBlocks;

  let imageFromCurrentPage = false;

  if (firstBlock && typeof firstBlock === 'object' && firstBlock.type === 'image' && firstBlock.src) {
    heroImageSrc = firstBlock.src;
    if (firstBlock.alt) {
      heroImageAlt = firstBlock.alt;
    }
    // Do NOT render the hero image again on the right side
    contentBlocks = rawBlocks.slice(1);
    imageFromCurrentPage = true;
  } else if (!firstBlock && currentPage > 0) {
    // No content blocks at all – fall back to previous page's hero image if it has one
    const previousPage = pages[currentPage - 1];
    const previousBlocks = (previousPage?.content ?? []) as any[];
    const previousFirst = previousBlocks[0];

    if (previousFirst && typeof previousFirst === 'object' && previousFirst.type === 'image' && previousFirst.src) {
      heroImageSrc = previousFirst.src;
      if (previousFirst.alt) {
        heroImageAlt = previousFirst.alt;
      }
    }
  } else if (!imageFromCurrentPage && currentPage > 0) {
    // Page has content but no image as the first block.
    // For "Your Turn" pages (prompt-only), reuse the previous page's image.
    const previousPage = pages[currentPage - 1];
    const previousBlocks = (previousPage?.content ?? []) as any[];
    const previousFirst = previousBlocks[0];

    if (previousFirst && typeof previousFirst === 'object' && previousFirst.type === 'image' && previousFirst.src) {
      heroImageSrc = previousFirst.src;
      if (previousFirst.alt) {
        heroImageAlt = previousFirst.alt;
      }
    }
  }

  // Avoid duplicate heading: if the first content block is already a heading, don't render page title as h1 (content will show it once).
  const firstContentBlock = contentBlocks[0];
  const firstBlockIsHeading =
    firstContentBlock &&
    typeof firstContentBlock === 'object' &&
    (firstContentBlock as { type?: string }).type === 'heading';
  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;

  return (
    <ReadingLayout currentProgress={progress} onClose={() => router.push('/dashboard')}>
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SectionLayout imageSrc={heroImageSrc} imageAlt={heroImageAlt}>
            <div className="space-y-6">
              <div className="mb-6">
                <p className="text-sm text-[#ff6a38] font-semibold uppercase tracking-wide mb-2">
                  {step.title}
                </p>
                {showPageTitle && (
                  <h1 className="text-3xl md:text-4xl font-bold text-[#2a2416] dark:text-white">
                    {currentPageData.title}
                  </h1>
                )}
              </div>
              {contentBlocks && Array.isArray(contentBlocks) && contentBlocks.map((block: any, index: number) => (
                <BlockRenderer
                  key={index}
                  block={block}
                  userResponses={userResponses}
                  onResponseChange={handleResponseChange}
                />
              ))}
            </div>
          </SectionLayout>
        </div>
        <div className="flex-shrink-0 p-6 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-t border-gray-200 dark:border-gray-800">
          <PageNavigator
            currentPage={currentPage}
            totalPages={pages.length}
            onPrevious={handlePrevious}
            onNext={handleNext}
            onComplete={handleComplete}
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>
    </ReadingLayout>
  );
}
