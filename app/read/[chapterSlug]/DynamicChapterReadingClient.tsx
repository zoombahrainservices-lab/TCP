'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Download, Menu } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
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
  const pathname = usePathname();
  // Start at -1 to show cover page first
  const [currentPage, setCurrentPage] = useState(-1);
  const [userResponses, setUserResponses] = useState<Record<string, any>>(initialAnswers);
  const [isProcessing, setIsProcessing] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const completedPagesRef = useRef<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  const readingContentRef = useRef<HTMLDivElement>(null);

  const canonicalNextUrl = nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : null;

  useEffect(() => {
    if (currentPage >= pages.length - 2) {
      if (canonicalNextUrl) router.prefetch(canonicalNextUrl);
      router.prefetch('/dashboard');
    }
  }, [currentPage, pages.length, router, chapter.slug, canonicalNextUrl]);

  // Scroll to top when changing pages
  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'instant' });
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

  const handleCloseCore = () => {
    router.push('/dashboard');
  };

  const handleClose = useClickSound(handleCloseCore);

  const currentPageData = pages[currentPage >= 0 ? currentPage : 0];
  // Include cover page in progress calculation
  const totalPages = pages.length + 1; // +1 for cover page
  const currentPageIndex = currentPage + 1; // currentPage is -1 for cover, so +1 makes it 0-indexed for progress
  const progress = totalPages ? ((currentPageIndex + 1) / totalPages) * 100 : 0;

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

  const pdfUrl = `/api/reports/chapter/${chapter.chapter_number}?answers=true`;

  const handleDownloadChapterPdf = () => {
    if (!pdfUrl) return;
    // Open in new tab so browser download dialog can appear
    window.open(pdfUrl, '_blank');
  };

  // Unified reading layout for all chapters (Chapter 1 style + mobile-friendly)
  return (
    <div
      className="fixed inset-0 w-full bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col"
      style={{ height: '100dvh', maxHeight: '-webkit-fill-available' }}
    >
      {/* Top navbar - white bg, logo left, close right */}
      <header className="flex-shrink-0 w-full bg-white dark:bg-[#0a1628] border-b border-gray-100 dark:border-gray-800 shadow-sm z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
          <div className="relative h-9 sm:h-10 w-auto">
            <Image
              src="/TCP-logo.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-9 sm:h-10 w-auto dark:hidden"
              priority
            />
            <Image
              src="/TCP-logo-white.png"
              alt="The Communication Protocol"
              width={180}
              height={40}
              className="object-contain h-9 sm:h-10 w-auto hidden dark:block"
              priority
            />
          </div>
          <button
            onClick={handleClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-all min-w-[44px] min-h-[44px] flex items-center justify-center touch-manipulation"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
          </button>
        </div>
      </header>

      {/* Progress bar */}
      <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
        <motion.div
          className="h-full bg-[#ff6a38]"
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>

      {/* Content - scrollable on mobile */}
      <div ref={contentRef} className="flex-1 min-h-0 overflow-hidden flex flex-col">
          {currentPage === -1 ? (
            // CHAPTER COVER PAGE + Download button
            <div className="flex-1 flex flex-col">
              <ChapterCoverPage
                chapterNumber={chapter.chapter_number}
                title={chapter.title}
                subtitle={chapter.subtitle}
                onContinue={handleNext}
              />
              <div className="mt-6 mb-8 flex justify-center">
                <button
                  type="button"
                  onClick={handleDownloadChapterPdf}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-[#1f2937] hover:bg-[#0f172a] text-white text-sm font-semibold shadow-md transition-colors"
                >
                  <Download className="w-4 h-4" />
                  Download Chapter Report
                </button>
              </div>
            </div>
          ) : (
            // CONTENT SLIDES - Image left, Text right (mobile: stacked, same as Ch1)
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
                      // All images are used as hero or decorative art on the left;
                      // reading column should be text-only.
                      if (block.type === 'image') return null;
                      if (block.type === 'story') {
                        return (
                          <div key={index} className="text-lg leading-relaxed text-gray-900 dark:text-gray-100 whitespace-pre-wrap">
                            {block.text}
                          </div>
                        );
                      }
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
      </div>
    </div>
  );
}
