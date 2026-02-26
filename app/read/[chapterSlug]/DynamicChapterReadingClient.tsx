'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Download } from 'lucide-react';
import Image from 'next/image';
import BlockRenderer from '@/components/content/BlockRenderer';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { showXPNotification } from '@/components/gamification/XPNotification';
import { writeQueue } from '@/lib/queue/WriteQueue';

interface Props {
  chapter: Chapter;
  readingStep: Step;
  pages: Page[];
  nextStepSlug: string | null;
  initialAnswers?: Record<string, any>;
}

export default function DynamicChapterReadingClient({ chapter, readingStep, pages, nextStepSlug, initialAnswers = {} }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>(initialAnswers);
  const [isProcessing, setIsProcessing] = useState(false);
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

  const handleNext = async () => {
    if (isProcessing) return;

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

    // Last page: INSTANT navigation (no waiting for anything)
    if (currentPage === pages.length - 1) {
      if (canonicalNextUrl) {
        router.push(canonicalNextUrl);
      } else {
        router.push('/dashboard');
      }

      // Complete section in background with retry queue
      writeQueue.enqueue(async () => {
        const sectionResult = await completeDynamicSection({
          chapterNumber: chapter.chapter_number,
          stepType: readingStep.step_type,
        });
        
        if (sectionResult.success) {
          const xp = sectionResult.xpResult?.xpAwarded ?? 0;
          if (xp > 0) {
            showXPNotification(xp, 'Reading complete!', { reasonCode: sectionResult.reasonCode });
          } else if (sectionResult.reasonCode === 'repeat_completion') {
            showXPNotification(0, '', { reasonCode: 'repeat_completion' });
          }
        }
      });
    } else {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePrevious = () => {
    if (currentPage > 0) setCurrentPage(currentPage - 1);
  };

  const handleClose = () => {
    router.push('/dashboard');
  };

  const currentPageData = pages[currentPage];
  const progress = pages.length ? ((currentPage + 1) / pages.length) * 100 : 0;

  // Check if current page is a title slide
  const firstBlock = currentPageData?.content?.[0];
  const isTitleSlide = firstBlock && (firstBlock as any).type === 'title_slide';

  // Hero image:
  // 1) Prefer explicit chapter.hero_image_url (set via admin at chapter level)
  // 2) Then FIRST image block anywhere in the page content (set per page in admin)
  // 3) Then chapter.thumbnail_url
  // 4) Then chapter-specific local fallback (for legacy Chapter 1/2 art)
  // 5) Finally a generic placeholder
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

  const pdfUrl = chapter.pdf_url;

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
          {isTitleSlide ? (
            // TITLE SLIDE
            <motion.div
              key="title-slide"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="min-h-full w-full bg-gradient-to-br from-[#1a1a1a] via-[#2a2a2a] to-[#1a1a1a] flex flex-col relative overflow-hidden"
            >
              {/* Decorative Hollow Dots Pattern */}
              <div className="absolute inset-0 opacity-20">
                {Array.from({ length: 20 }).map((_, i) => {
                  const seed = (i + 1) * 7919;
                  const w = 50 + (seed % 100);
                  const h = 50 + ((seed * 31) % 100);
                  const left = seed % 100;
                  const top = (seed * 17) % 100;
                  const opacity = 0.2 + ((seed % 30) / 100);
                  return (
                    <div
                      key={i}
                      className="absolute rounded-full border-2 border-gray-600"
                      style={{
                        width: `${w}px`,
                        height: `${h}px`,
                        left: `${left}%`,
                        top: `${top}%`,
                        opacity
                      }}
                    />
                  );
                })}
              </div>

              {/* Title Content */}
              <div className="flex-1 flex items-center justify-center relative z-10 py-12">
                <div className="text-center px-6 sm:px-12 max-w-4xl">
                  <div className="mb-6 sm:mb-8">
                    <span className="text-[var(--color-amber)] text-2xl sm:text-4xl font-bold tracking-widest">
                      CHAPTER {chapter.chapter_number}
                    </span>
                  </div>
                  <h1 className="text-white font-bold text-4xl sm:text-6xl lg:text-7xl leading-tight mb-8 sm:mb-12">
                    {chapter.title}
                  </h1>
                  <div className="flex items-center justify-center gap-3 mt-8 sm:mt-16">
                    {pages.map((_, i) => (
                      <div 
                        key={i}
                        className={`w-2 h-2 sm:w-3 sm:h-3 rounded-full ${
                          i === currentPage ? 'bg-[var(--color-amber)]' : 'bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Navigation + Download (PDF when chapter.pdf_url is set in DB) */}
              <div className="p-6 sm:p-8 border-t border-gray-700 bg-[#1a1a1a] relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                  {pdfUrl && (
                    <a
                      href={pdfUrl}
                      download
                      className="inline-flex items-center gap-2 rounded-2xl border border-gray-600 px-4 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-100 hover:bg-gray-800 transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      <span>Download chapter PDF</span>
                    </a>
                  )}
                  <button
                    onClick={handleNext}
                    disabled={isProcessing}
                    className="px-6 py-2.5 sm:px-8 sm:py-3 rounded-2xl font-bold text-xs sm:text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg disabled:opacity-50"
                  >
                    Continue
                  </button>
                </div>
              </div>
            </motion.div>
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
                    {currentPage > 0 && (
                      <button
                        onClick={handlePrevious}
                        className="px-6 sm:px-8 py-3 sm:py-3.5 rounded-full font-semibold text-sm sm:text-base transition-all bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 min-h-[48px] min-w-[120px] sm:min-w-[140px] touch-manipulation"
                      >
                        Previous
                      </button>
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
