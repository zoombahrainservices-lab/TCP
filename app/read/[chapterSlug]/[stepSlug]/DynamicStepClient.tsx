'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import ReadingLayout from '@/components/content/ReadingLayout';
import BlockRenderer from '@/components/content/BlockRenderer';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { submitAssessment, completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { showXPNotification } from '@/components/gamification/XPNotification';
import { writeQueue } from '@/lib/queue/WriteQueue';

interface Props {
  chapter: Chapter;
  step: Step;
  pages: Page[];
  nextStepSlug: string | null;
}

// Steps that the server redirects — use canonical URL so we never trigger redirect → MPA → React #310. Proof always /chapter/1/proof (Ch2 redirects there).
function getCanonicalNextUrl(chapterNumber: number, nextStepSlug: string | null): string | null {
  if (!nextStepSlug) return null;
  if (nextStepSlug === 'assessment') return `/chapter/${chapterNumber}/assessment`;
  if (nextStepSlug === 'proof') return '/chapter/1/proof';
  return null;
}

export default function DynamicStepClient({ chapter, step, pages, nextStepSlug }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const completedPagesRef = useRef<Set<string>>(new Set());

  const nextUrl = getCanonicalNextUrl(chapter.chapter_number, nextStepSlug) ?? (nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : null);

  // Aggressive prefetching for instant navigation (route code only). Use canonical URL so we never trigger server redirect → MPA → #310.
  useEffect(() => {
    if (currentPage >= pages.length - 2) {
      if (nextUrl) router.prefetch(nextUrl);
      router.prefetch('/dashboard');
    }
  }, [currentPage, pages.length, router, nextUrl]);

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
    
    // Navigate IMMEDIATELY - don't wait for DB operations. Use canonical URL so server never redirects → avoids Next.js MPA path → React #310.
    if (nextUrl) {
      router.push(nextUrl);
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
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {/* Left side: Image */}
        <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full lg:min-h-[400px] flex-shrink-0 relative overflow-hidden bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
          <Image
            src={heroImageSrc}
            alt={heroImageAlt}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 50vw"
            priority
          />
        </div>

        {/* Right side: Content + Navigation */}
        <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0 overflow-hidden">
          {/* Content - scrollable on mobile */}
          <div className="flex-1 p-6 sm:p-8 lg:p-12 min-h-0 reading-scroll">
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
          </div>

          {/* Bottom navigation - inside right panel */}
          <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-[#E5D5B0] dark:border-[#4A3B1E] bg-[#FFFAED] dark:bg-[#1A1410] safe-area-pb">
            <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
              {currentPage > 0 && (
                <button
                  onClick={handlePrevious}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
                >
                  Previous
                </button>
              )}
              <button
                onClick={currentPage === pages.length - 1 ? handleComplete : handleNext}
                disabled={isProcessing}
                className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-[#FF6B35] hover:bg-[#FF5722] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
              >
                {currentPage === pages.length - 1 ? 'Complete' : 'Continue'}
              </button>
            </div>
          </div>
        </div>
      </div>
    </ReadingLayout>
  );
}
