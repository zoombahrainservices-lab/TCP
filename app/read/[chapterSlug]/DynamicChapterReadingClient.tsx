'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ReadingLayout from '@/components/content/ReadingLayout';
import BlockRenderer from '@/components/content/BlockRenderer';
import ChapterCoverPage from '@/components/content/ChapterCoverPage';
import AdminEditButton from '@/components/admin/AdminEditButton';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { celebrateSectionCompletion } from '@/lib/celebration/celebrate';
import { writeQueue } from '@/lib/queue/WriteQueue';
import { useClickSound } from '@/lib/hooks/useClickSound';
import { usePrefetchImage } from '@/lib/hooks/usePrefetchImage';

interface Props {
  chapter: Chapter;
  readingStep: Step;
  pages: Page[];
  nextStepSlug: string | null;
  initialAnswers?: Record<string, any>;
  isAdmin?: boolean;
}

export default function DynamicChapterReadingClient({ chapter, readingStep, pages, nextStepSlug, initialAnswers = {}, isAdmin = false }: Props) {
  const router = useRouter();
  // Start at -1 to show cover page first
  const [currentPage, setCurrentPage] = useState(-1);
  const [userResponses, setUserResponses] = useState<Record<string, any>>(initialAnswers);
  const [isProcessing, setIsProcessing] = useState(false);
  const completedPagesRef = useRef<Set<string>>(new Set());
  const readingContentRef = useRef<HTMLDivElement>(null);

  const canonicalNextUrl = nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : null;

  useEffect(() => {
    if (currentPage >= pages.length - 2) {
      if (canonicalNextUrl) router.prefetch(canonicalNextUrl);
      router.prefetch('/dashboard');
    }
  }, [currentPage, pages.length, router, chapter.slug, canonicalNextUrl]);

  // Jump to specific page from URL query param (?page=3)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const pageParam = params.get('page');
    if (!pageParam || pages.length === 0) return;

    const pageNumber = Number(pageParam);
    if (!Number.isFinite(pageNumber) || pageNumber < 0) return;

    // Page param is the actual array index
    if (pageNumber >= 0 && pageNumber < pages.length && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  }, [pages.length]); // Only run when pages load, not on currentPage change

  // Scroll to top when changing pages
  useEffect(() => {
    readingContentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
    window.scrollTo({ top: 0, behavior: 'instant' });
  }, [currentPage]);

  const handleResponseChange = (promptId: string, value: any) => {
    setUserResponses(prev => ({ ...prev, [promptId]: value }));
  };

  const handleNextCore = async () => {
    if (isProcessing) return;

    // If on cover page (-1), just move to first actual page (0)
    if (currentPage === -1) {
      setCurrentPage(0);
      return;
    }

    const currentPageData = pages[currentPage];
    
    // Record page completion - fully non-blocking with retry queue
    if (currentPageData && !completedPagesRef.current.has(currentPageData.id)) {
      completedPagesRef.current.add(currentPageData.id);
      
      // Use write queue for automatic retry
      writeQueue.enqueue(() => completeDynamicPage({
        chapterNumber: chapter.chapter_number,
        stepId: readingStep.id,
        pageId: currentPageData.id,
        stepType: readingStep.step_type,
      }));
    }

    // Last page: Complete section FIRST, show celebration, THEN navigate
    if (currentPage === pages.length - 1) {
      setIsProcessing(true);
      
      try {
        const sectionResult = await completeDynamicSection({
          chapterNumber: chapter.chapter_number,
          stepType: readingStep.step_type,
        });
        
        if (sectionResult.success) {
          // Trigger celebration FIRST
          celebrateSectionCompletion({
            xpResult: sectionResult.xpResult,
            reasonCode: sectionResult.reasonCode,
            streakResult: sectionResult.streakResult,
            chapterCompleted: (sectionResult as any).chapterCompleted,
            title: 'Reading Complete!',
          });

          // Small delay to ensure celebration starts, THEN navigate
          setTimeout(() => {
            if (canonicalNextUrl) {
              router.push(canonicalNextUrl);
            } else {
              router.push('/dashboard');
            }
            setIsProcessing(false);
          }, 500);
        } else {
          // If completion failed, still navigate
          if (canonicalNextUrl) {
            router.push(canonicalNextUrl);
          } else {
            router.push('/dashboard');
          }
          setIsProcessing(false);
        }
      } catch (error) {
        console.error('Error completing section:', error);
        // Still navigate on error
        if (canonicalNextUrl) {
          router.push(canonicalNextUrl);
        } else {
          router.push('/dashboard');
        }
        setIsProcessing(false);
      }
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handleNext = useClickSound(handleNextCore);

  const handlePreviousCore = () => {
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
    } else if (currentPage === 0) {
      // Go back to cover page
      setCurrentPage(-1);
    }
  };

  const handlePrevious = useClickSound(handlePreviousCore);

  const currentPageData = pages[currentPage >= 0 ? currentPage : 0];
  // Calculate progress (include cover page in calculation)
  const progress = currentPage === -1 ? 0 : Math.round(((currentPage + 1) / pages.length) * 100);

  const normalizeBlocks = (content: unknown): any[] => {
    if (Array.isArray(content)) return content;
    if (typeof content === 'string') {
      try {
        const parsed = JSON.parse(content);
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  const getSafeImageSrc = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
    // Ignore legacy placeholders; they caused broken images in reading.
    const normalized = trimmed.toLowerCase();
    if (
      normalized === '/placeholder.png' ||
      normalized.endsWith('/placeholder.png') ||
      normalized === 'placeholder.png'
    ) {
      return null;
    }
    return trimmed;
  };

  // Helper function to get hero image for any page
  const getHeroImageForPage = useCallback((pageIndex: number): string | null => {
    if (pageIndex < 0 || pageIndex >= pages.length) return null;
    
    const pageData = pages[pageIndex];
    const content = normalizeBlocks(pageData?.content);
    const pageHero = getSafeImageSrc((pageData as any)?.hero_image_url);
    const imageBlock = content.find(
      (b: any) => b && b.type === 'image' && b.src && typeof b.src === 'string'
    );
    const blockHero = getSafeImageSrc(imageBlock?.src);
    
    // Reading should prefer page-specific image first.
    if (pageHero) return pageHero;
    if (blockHero) return blockHero;
    if (getSafeImageSrc(readingStep.hero_image_url)) return getSafeImageSrc(readingStep.hero_image_url);
    if (getSafeImageSrc(chapter.hero_image_url)) return getSafeImageSrc(chapter.hero_image_url);
    if (getSafeImageSrc(chapter.thumbnail_url)) return getSafeImageSrc(chapter.thumbnail_url);
    
    // Legacy fallbacks
    if (chapter.chapter_number === 1) {
      return '/slider-work-on-quizz/chapter1/chaper1-1.jpeg';
    } else if (chapter.chapter_number === 2) {
      return '/chapter/chapter 2/Nightmare.png';
    }
    
    return null;
  }, [pages, chapter, readingStep]);

  // Hero image (only for content pages, not cover)
  const rawContent = normalizeBlocks(currentPageData?.content);
  const firstImageBlock = rawContent.find(
    (b: any) => b && b.type === 'image' && b.src && typeof b.src === 'string'
  ) as any | undefined;

  // Legacy local fallbacks only if no DB-driven hero exists
  let legacyFallback: string | null = null;
  const safeChapterHero = getSafeImageSrc(chapter.hero_image_url);
  const safeChapterThumb = getSafeImageSrc(chapter.thumbnail_url);
  const safeStepHero = getSafeImageSrc(readingStep.hero_image_url);
  const safePageHero = getSafeImageSrc((currentPageData as any)?.hero_image_url);
  const safeBlockHero = getSafeImageSrc(firstImageBlock?.src);

  if (!safeChapterHero && !safeChapterThumb && !safeStepHero && !safePageHero && !safeBlockHero) {
    if (chapter.chapter_number === 1) {
      legacyFallback = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg';
    } else if (chapter.chapter_number === 2) {
      legacyFallback = '/chapter/chapter 2/Nightmare.png';
    }
  }

  // Reading should use page image first, then chapter-level fallbacks.
  const heroImageSrc =
    safePageHero ||
    safeBlockHero ||
    safeStepHero ||
    safeChapterHero ||
    safeChapterThumb ||
    legacyFallback ||
    null;
  const [displayHeroImageSrc, setDisplayHeroImageSrc] = useState<string | null>(heroImageSrc);
  useEffect(() => {
    setDisplayHeroImageSrc(heroImageSrc);
  }, [heroImageSrc]);

  const handleHeroImageError = () => {
    // Hard fallback: if the selected image fails, don't keep broken image icon.
    setDisplayHeroImageSrc(null);
  };


  const heroImageAlt =
    (firstImageBlock?.alt as string | undefined) ||
    currentPageData?.title ||
    chapter.title;

  // Aggressively prefetch next page's hero image
  const nextPageIndex = currentPage + 1;
  const nextImageSrc = getHeroImageForPage(nextPageIndex);
  usePrefetchImage(nextImageSrc);

  const handleDownloadChapterPdf = () => {
    const pdfUrl = `/api/reports/chapter/${chapter.chapter_number}?answers=true`;
    window.open(pdfUrl, '_blank');
  };

  // Use ReadingLayout for consistent navigation across all chapters
  return (
    <ReadingLayout
      currentProgress={progress}
      onClose={() => router.push('/dashboard')}
      serverCurrentChapter={chapter.chapter_number}
      collapseSidebarByDefault={true}
      isAdmin={isAdmin}
    >
      {currentPage === -1 ? (
        // CHAPTER COVER PAGE
        <ChapterCoverPage
          chapterNumber={chapter.chapter_number}
          title={chapter.title}
          subtitle={chapter.subtitle}
          onContinue={handleNext}
          onDownload={handleDownloadChapterPdf}
          showDownloadButton={true}
        />
      ) : (
        // CONTENT SLIDES - Image left, Text right (mobile: stacked)
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
          <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden order-1">
            {displayHeroImageSrc ? (
              <img
                src={displayHeroImageSrc}
                alt={heroImageAlt}
                className="absolute inset-0 h-full w-full object-cover"
                loading="eager"
                decoding="async"
                onError={handleHeroImageError}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-[#F2E9D8] to-[#E8DBC0] dark:from-[#0f1b2d] dark:to-[#13233a]" />
            )}
          </div>
          <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0 overflow-hidden order-2">
            <div ref={readingContentRef} className="flex-1 p-6 sm:p-8 lg:p-12 min-h-0 reading-scroll">
              <motion.div
                key={currentPage}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className="max-w-3xl mx-auto"
              >
                {(() => {
                  const blocks = normalizeBlocks(currentPageData?.content);
                  const firstRenderedBlock = blocks.find((b: any) => b.type !== 'title_slide' && !(blocks.indexOf(b) === 0 && b.type === 'image'));
                  const firstBlockIsHeading = firstRenderedBlock && (firstRenderedBlock as any).type === 'heading';
                  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;
                  return showPageTitle ? (
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-6">
                      {currentPageData.title}
                    </h2>
                  ) : null;
                })()}
                {normalizeBlocks(currentPageData?.content).map((block: any, index: number) => {
                  if (block.type === 'title_slide') return null;
                  if (block.type === 'image') return null;
                  return (
                    <BlockRenderer
                      key={index}
                      block={block}
                      userResponses={userResponses}
                      onResponseChange={handleResponseChange}
                      chapterId={chapter.chapter_number}
                      stepId={readingStep.id}
                      pageId={currentPageData?.id}
                    />
                  );
                })}
              </motion.div>
            </div>
            {/* Bottom navigation - inside right panel */}
            <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-[#E5D5B0] dark:border-[#4A3B1E] bg-[#FFFAED] dark:bg-[#1A1410] safe-area-pb">
              <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
                {(currentPage > 0 || currentPage === 0) && (
                  <button
                    onClick={handlePrevious}
                    className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
                  >
                    Previous
                  </button>
                )}
                {currentPage >= 0 && currentPageData && chapter.id && (
                  <AdminEditButton
                    chapterId={chapter.id}
                    pageId={currentPageData.id}
                    stepId={readingStep.id}
                    returnUrl={`/read/${chapter.slug}?page=${currentPage}`}
                  />
                )}
                <button
                  onClick={handleNext}
                  onMouseEnter={() => {
                    // Preload next image on hover for instant feel
                    const nextImg = getHeroImageForPage(currentPage + 1);
                    if (nextImg) {
                      const img = new window.Image();
                      img.src = nextImg;
                    }
                  }}
                  onFocus={() => {
                    // Also preload on focus for keyboard navigation
                    const nextImg = getHeroImageForPage(currentPage + 1);
                    if (nextImg) {
                      const img = new window.Image();
                      img.src = nextImg;
                    }
                  }}
                  disabled={isProcessing}
                  className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-[#FF6B35] hover:bg-[#FF5722] text-white shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
                >
                  {currentPage === pages.length - 1 ? 'Complete' : 'Continue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </ReadingLayout>
  );
}
