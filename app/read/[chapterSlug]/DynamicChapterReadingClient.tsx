'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { X, Download, ChevronLeft, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import ReadingLayout from '@/components/content/ReadingLayout';
import SectionLayout from '@/components/content/SectionLayout';
import PageNavigator from '@/components/content/PageNavigator';
import BlockRenderer from '@/components/content/BlockRenderer';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection, hasAssessmentForChapter } from '@/app/actions/chapters';
import { showXPNotification } from '@/components/gamification/XPNotification';
import { useChapterCache } from '@/lib/cache/ChapterCacheContext';
import { writeQueue } from '@/lib/queue/WriteQueue';

interface Props {
  chapter: Chapter;
  readingStep: Step;
  pages: Page[];
  nextStepSlug: string | null;
}

export default function DynamicChapterReadingClient({ chapter, readingStep, pages, nextStepSlug }: Props) {
  const router = useRouter();
  const [currentPage, setCurrentPage] = useState(0);
  const [userResponses, setUserResponses] = useState<Record<string, any>>({});
  const [isProcessing, setIsProcessing] = useState(false);
  const [hasCompletedAssessment, setHasCompletedAssessment] = useState<boolean | null>(null);
  const completedPagesRef = useRef<Set<string>>(new Set());
  const contentRef = useRef<HTMLDivElement>(null);
  const readingContentRef = useRef<HTMLDivElement>(null);

  // Check if Chapter 1 to determine UI style
  const isChapter1 = chapter.chapter_number === 1;

  // Load assessment completion state for Chapter 1 routing logic
  useEffect(() => {
    if (isChapter1) {
      hasAssessmentForChapter(1).then(setHasCompletedAssessment);
    }
  }, [isChapter1]);

  const { prefetchStepPages } = useChapterCache();

  // Aggressive prefetching for instant navigation (route + data)
  useEffect(() => {
    if (currentPage >= pages.length - 2) {
      // Prefetch next routes when near the end
      if (isChapter1) {
        router.prefetch(`/chapter/${chapter.chapter_number}/assessment`);
        router.prefetch(`/read/${chapter.slug}/framework`);
        // Prefetch framework data
        prefetchStepPages(chapter.slug, 'framework').catch(err => 
          console.error('[Prefetch] Framework data error:', err)
        );
      } else {
        if (nextStepSlug) {
          router.prefetch(`/read/${chapter.slug}/${nextStepSlug}`);
          // Prefetch next step data
          prefetchStepPages(chapter.slug, nextStepSlug).catch(err => 
            console.error('[Prefetch] Next step data error:', err)
          );
        }
        router.prefetch('/dashboard');
      }
    }
  }, [currentPage, pages.length, router, isChapter1, chapter.chapter_number, chapter.slug, nextStepSlug, prefetchStepPages]);

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
      // Navigate immediately
      if (isChapter1) {
        router.push(`/chapter/${chapter.chapter_number}/assessment`);
      } else {
        if (nextStepSlug) {
          router.push(`/read/${chapter.slug}/${nextStepSlug}`);
        } else {
          router.push('/dashboard');
        }
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

  // Chapter 1 specific styling (chunk-by-chunk slider)
  if (isChapter1) {
    const CHAPTER_PDF_PATH = '/chapter/Chapter 1_ From Stage Star to Silent Struggles - Printable (1).pdf';

    return (
      <div className="fixed inset-0 bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden flex flex-col">
        {/* Navbar */}
        <header className="flex-shrink-0 bg-white/95 dark:bg-[#0a1628]/95 backdrop-blur-lg border-b border-gray-200 dark:border-gray-700 z-30">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex justify-between items-center">
            <div className="relative h-10 sm:h-12 w-auto">
              <Image
                src="/TCP-logo.png"
                alt="The Communication Protocol"
                width={180}
                height={40}
                className="object-contain h-10 sm:h-12 w-auto dark:hidden"
                priority
              />
              <Image
                src="/TCP-logo-white.png"
                alt="The Communication Protocol"
                width={180}
                height={40}
                className="object-contain h-10 sm:h-12 w-auto hidden dark:block"
                priority
              />
            </div>
            <button
              onClick={handleClose}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-all"
            >
              <X className="w-5 h-5 text-gray-600 dark:text-gray-300" />
            </button>
          </div>
        </header>

        {/* Progress bar */}
        <div className="flex-shrink-0 h-2 bg-gray-200 dark:bg-gray-700 z-20">
          <motion.div
            className="h-full bg-[var(--color-blue)]"
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.2 }}
          />
        </div>

        {/* Content */}
        <div ref={contentRef} className="flex-1 overflow-y-auto">
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

              {/* Navigation + Download */}
              <div className="p-6 sm:p-8 border-t border-gray-700 bg-[#1a1a1a] relative z-10">
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6">
                  <a
                    href={CHAPTER_PDF_PATH}
                    download
                    className="inline-flex items-center gap-2 rounded-2xl border border-gray-600 px-4 py-2 text-[10px] sm:text-xs font-semibold uppercase tracking-wide text-gray-100 hover:bg-gray-800 transition-colors"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download chapter PDF</span>
                  </a>
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
            // CONTENT SLIDES - Image left, Text right on desktop
            <div className="min-h-full flex flex-col lg:flex-row lg:h-full">
              {/* Image Section */}
              <div className="w-full lg:w-1/2 h-64 sm:h-96 lg:h-full lg:min-h-[400px] flex-shrink-0 relative bg-[var(--color-offwhite)] dark:bg-[#0a1628] overflow-hidden">
                <motion.div
                  key={currentPage}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="absolute inset-0 w-full h-full"
                >
                  <Image 
                    src="/slider-work-on-quizz/chapter1/chaper1-1.jpeg"
                    alt={currentPageData?.title || 'Chapter 1'}
                    fill
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    quality={85}
                    priority
                    className="object-cover"
                  />
                </motion.div>
              </div>

              {/* Text Content Section */}
              <div className="w-full lg:w-1/2 bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col">
                <div ref={readingContentRef} className="flex-1 p-6 sm:p-8 lg:p-12 overflow-auto">
                  <motion.div
                    key={currentPage}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-3xl mx-auto"
                  >
                    {/* Heading */}
                    <h2 className="text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-6">
                      {currentPageData?.title}
                    </h2>

                    {/* Story text */}
                    {currentPageData?.content && Array.isArray(currentPageData.content) && currentPageData.content.map((block: any, index: number) => {
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
                        />
                      );
                    })}
                  </motion.div>
                </div>

                {/* Navigation - Footer */}
                <div className="p-6 border-t border-[#E5D5B0] dark:border-[#4A3B1E] bg-[#FFFAED] dark:bg-[#1A1410]">
                  <div className="flex items-center justify-between gap-4 max-w-3xl mx-auto">
                    <button
                      onClick={handlePrevious}
                      disabled={currentPage === 0}
                      className={`px-4 py-2 rounded-full font-medium transition-all ${
                        currentPage === 0
                          ? 'opacity-30 cursor-not-allowed'
                          : 'hover:bg-[#E5D5B0] dark:hover:bg-[#4A3B1E]'
                      }`}
                    >
                      <ChevronLeft className="w-6 h-6" />
                    </button>

                    <div className="text-center">
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {currentPage + 1} / {pages.length}
                      </p>
                    </div>

                    {currentPage < pages.length - 1 ? (
                      <button
                        onClick={handleNext}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        Next
                      </button>
                    ) : (
                      <button
                        onClick={handleNext}
                        disabled={isProcessing}
                        className="px-6 py-3 rounded-2xl font-bold text-sm uppercase tracking-wide transition-all bg-[var(--color-amber)] hover:opacity-90 text-[var(--color-charcoal)] shadow-md hover:shadow-lg disabled:opacity-50"
                      >
                        Complete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  // Default UI for other chapters
  const imageSrc = chapter.thumbnail_url || '/placeholder.png';
  const imageAlt = currentPageData?.title || chapter.title;

  const firstBlockIsHeading =
    firstBlock &&
    typeof firstBlock === 'object' &&
    (firstBlock as { type?: string }).type === 'heading';
  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;

  return (
    <ReadingLayout
      currentProgress={progress}
      onClose={() => router.push('/dashboard')}
      showDownloadButton={false}
    >
      <div className="h-full flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <SectionLayout
            imageSrc={imageSrc}
            imageAlt={imageAlt}
          >
            <div className="space-y-6 max-w-3xl mx-auto">
              {showPageTitle && (
                <h2 className="text-3xl font-bold text-[var(--color-charcoal)] dark:text-white mb-6">
                  {currentPageData.title}
                </h2>
              )}
              {currentPageData?.content && Array.isArray(currentPageData.content) && currentPageData.content.map((block: any, index: number) => (
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
            onComplete={handleNext}
            className="max-w-4xl mx-auto"
          />
        </div>
      </div>
    </ReadingLayout>
  );
}
