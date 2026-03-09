'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import Image from 'next/image';
import ReadingLayout from '@/components/content/ReadingLayout';
import BlockRenderer from '@/components/content/BlockRenderer';
import ChapterCoverPage from '@/components/content/ChapterCoverPage';
import AdminEditButton from '@/components/admin/AdminEditButton';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { celebrateSectionCompletion } from '@/lib/celebration/celebrate';
import { writeQueue } from '@/lib/queue/WriteQueue';
import { useClickSound } from '@/lib/hooks/useClickSound';

interface Props {
  chapter: Chapter;
  readingStep: Step;
  pages: Page[];
  nextStepSlug: string | null;
  initialAnswers?: Record<string, any>;
}

export default function DynamicChapterReadingClient({ chapter, readingStep, pages, nextStepSlug, initialAnswers = {} }: Props) {
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

  // Hero image (only for content pages, not cover)
  const rawContent = (currentPageData?.content ?? []) as any[];
  const firstImageBlock = rawContent.find(
    (b: any) => b && b.type === 'image' && b.src && typeof b.src === 'string'
  ) as any | undefined;

  // Legacy local fallbacks only if no DB-driven hero exists
  let legacyFallback: string | null = null;
  if (!chapter.hero_image_url && !firstImageBlock?.src) {
    if (chapter.chapter_number === 1) {
      legacyFallback = '/slider-work-on-quizz/chapter1/chaper1-1.jpeg';
    } else if (chapter.chapter_number === 2) {
      legacyFallback = '/chapter/chapter 2/Nightmare.png';
    }
  }

  // Per-page images override chapter-level hero for that specific page
  const heroImageSrc =
    (firstImageBlock?.src as string | undefined) ||
    chapter.hero_image_url ||
    chapter.thumbnail_url ||
    legacyFallback ||
    '/placeholder.png';

  const heroImageAlt =
    (firstImageBlock?.alt as string | undefined) ||
    currentPageData?.title ||
    chapter.title;

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
            <motion.div
              key={currentPage}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.2 }}
              className="absolute inset-0 w-full h-full"
            >
              <Image
                src={heroImageSrc}
                alt={heroImageAlt}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                quality={85}
                className="object-cover"
              />
            </motion.div>
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
                  const blocks = currentPageData?.content && Array.isArray(currentPageData.content) ? currentPageData.content : [];
                  const firstRenderedBlock = blocks.find((b: any) => b.type !== 'title_slide' && !(blocks.indexOf(b) === 0 && b.type === 'image'));
                  const firstBlockIsHeading = firstRenderedBlock && (firstRenderedBlock as any).type === 'heading';
                  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;
                  return showPageTitle ? (
                    <h2 className="text-2xl sm:text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-6">
                      {currentPageData.title}
                    </h2>
                  ) : null;
                })()}
                {currentPageData?.content && Array.isArray(currentPageData.content) && currentPageData.content.map((block: any, index: number) => {
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
