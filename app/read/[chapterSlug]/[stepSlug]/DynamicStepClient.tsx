'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import ReadingLayout from '@/components/content/ReadingLayout';
import BlockRenderer from '@/components/content/BlockRenderer';
import ChapterCoverPage from '@/components/content/ChapterCoverPage';
import FrameworkCoverPage from '@/components/content/FrameworkCoverPage';
import SelfCheckAssessment, { type AssessmentQuestion } from '@/components/assessment/SelfCheckAssessment';
import AdminEditButton from '@/components/admin/AdminEditButton';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { submitAssessment } from '@/app/actions/prompts';
import { celebrateSectionCompletion } from '@/lib/celebration/celebrate';
import { writeQueue } from '@/lib/queue/WriteQueue';
import { useClickSound } from '@/lib/hooks/useClickSound';

interface Props {
  chapter: Chapter;
  step: Step;
  pages: Page[];
  nextStepSlug: string | null;
  nextStep: Step | null;
  initialAnswers?: Record<string, any>;
}

export default function DynamicStepClient({ chapter, step, pages, nextStepSlug, nextStep, initialAnswers = {} }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Start at -1 to show cover page first for "read" step type
  // For framework, check if first page has framework_cover block
  const hasFrameworkCover = step.step_type === 'framework' && pages[0]?.content?.some(
    (block: any) => block && block.type === 'framework_cover'
  );
  const [currentPage, setCurrentPage] = useState(
    step.step_type === 'read' || hasFrameworkCover ? -1 : 0
  );
  const [userResponses, setUserResponses] = useState<Record<string, any>>(initialAnswers);
  const [isProcessing, setIsProcessing] = useState(false);
  const completedPagesRef = useRef<Set<string>>(new Set());

  // Build next URL - handle special case for Resolution step
  const nextUrl = nextStepSlug 
    ? nextStep?.step_type === 'resolution'
      ? `/chapter/${chapter.chapter_number}/proof`
      : `/read/${chapter.slug}/${nextStepSlug}`
    : null;

  // Chapter PDF download URL (actual reading content PDF)
  // Chapter 1 uses the exact printable PDF filename; other chapters can be added here
  const chapterPdfFilenames: Record<number, string> = {
    1: 'Chapter 1_ From Stage Star to Silent Struggles - Printable (1).pdf',
  };
  const chapterPdfUrl = chapterPdfFilenames[chapter.chapter_number]
    ? `/chapter/${encodeURIComponent(chapterPdfFilenames[chapter.chapter_number])}`
    : `/chapter/Chapter ${chapter.chapter_number}_ ${chapter.title} - Printable.pdf`;

  const handleDownloadChapterCore = () => {
    if (!chapterPdfUrl) return;
    // Open in new tab so browser download dialog appears
    window.open(chapterPdfUrl, '_blank');
  };

  const handleDownloadChapter = useClickSound(handleDownloadChapterCore);

  // Jump to specific page from URL query param (?page=3)
  // Note: For "read" steps, page param should only apply to content pages (not cover)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (!pageParam || pages.length === 0) return;

    const pageNumber = Number(pageParam);
    if (!Number.isFinite(pageNumber) || pageNumber < 1) return;

    // Find page by order_index (1-based)
    const targetIndex = pages.findIndex((p) => p.order_index === pageNumber);
    if (targetIndex >= 0 && targetIndex !== currentPage) {
      // Only apply if we're not on cover page, or if explicitly requested
      if (currentPage !== -1 || pageNumber > 1) {
        setCurrentPage(targetIndex);
      }
    }
  }, [searchParams, pages, currentPage]);

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

  const handleNextCore = async () => {
    // If on cover page (-1), just move to first actual page (0)
    if (currentPage === -1) {
      setCurrentPage(0);
      return;
    }

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
    
    if (currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
      // Clear page query param to avoid conflicts
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      window.history.replaceState({}, '', url.pathname);
    }
  };

  const handleNext = useClickSound(handleNextCore);

  const handlePreviousCore = () => {
    // Allow going back to cover page if we're on first content page and this is a step with cover page
    const canGoBackToCover = (step.step_type === 'read' || hasFrameworkCover) && currentPage === 0;
    
    if (currentPage > 0) {
      setCurrentPage(currentPage - 1);
      // Clear page query param to avoid conflicts
      const url = new URL(window.location.href);
      url.searchParams.delete('page');
      window.history.replaceState({}, '', url.pathname);
    } else if (canGoBackToCover) {
      setCurrentPage(-1);
    }
  };

  const handlePrevious = useClickSound(handlePreviousCore);

  const handleCompleteCore = async () => {
    if (isProcessing) return;
    setIsProcessing(true);

    const lastPageData = pages[currentPage];
    
    // Mark last page as complete FIRST (before navigation)
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

    // Complete the section and get XP data BEFORE navigation
    try {
      const sectionResult = await completeDynamicSection({
        chapterNumber: chapter.chapter_number,
        stepType: step.step_type,
      });
      
      if (sectionResult && sectionResult.success) {
        const sectionName = step.step_type === 'self_check' ? 'Self-Check' : step.title;
        
        // Trigger celebration FIRST (this enqueues it to show fullscreen)
        celebrateSectionCompletion({
          xpResult: (sectionResult as any).xpResult,
          reasonCode: (sectionResult as any).reasonCode,
          streakResult: (sectionResult as any).streakResult,
          chapterCompleted: (sectionResult as any).chapterCompleted,
          title: `${sectionName} Complete!`,
        });

        // Small delay to ensure celebration starts rendering, THEN navigate
        setTimeout(() => {
          if (nextUrl) {
            router.push(nextUrl);
          } else {
            router.push('/dashboard');
          }
          setIsProcessing(false);
        }, 500);
      } else {
        // If section completion failed, still navigate
        if (nextUrl) {
          router.push(nextUrl);
        } else {
          router.push('/dashboard');
        }
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Error completing section:', error);
      // Still navigate on error
      if (nextUrl) {
        router.push(nextUrl);
      } else {
        router.push('/dashboard');
      }
      setIsProcessing(false);
    }
  };

  const handleComplete = useClickSound(handleCompleteCore);

  const currentPageData = pages[currentPage >= 0 ? currentPage : 0];
  // Calculate progress including cover page for "read" steps and framework steps with cover
  const hasCoverPage = step.step_type === 'read' || hasFrameworkCover;
  const totalPages = hasCoverPage ? pages.length + 1 : pages.length;
  const currentPageIndex = hasCoverPage ? currentPage + 1 : currentPage;
  const progress = totalPages ? ((currentPageIndex + 1) / totalPages) * 100 : 0;

  // Derive hero image and content blocks so that image is on the LEFT
  // Priority: page.hero_image_url → first image block from current page → step.hero_image_url → chapter images → placeholder
  // CRITICAL: Remove ALL image blocks from content so they never appear on the right
  const rawBlocks = (currentPageData?.content ?? []) as any[];
  
  let heroImageSrc: string = currentPageData?.hero_image_url || (step.hero_image_url ?? chapter.hero_image_url ?? chapter.thumbnail_url ?? '/placeholder.png');
  let heroImageAlt: string = currentPageData?.title || step.title;
  let contentBlocks: any[] = rawBlocks;

  // Find first image block in current page (fallback if page.hero_image_url is not set)
  const firstImageBlock = rawBlocks.find(
    (block) => block && typeof block === 'object' && block.type === 'image' && block.src
  );

  // If no hero_image_url is set on the page, use the first image block as fallback
  if (!currentPageData?.hero_image_url && firstImageBlock) {
    // Use the first image found in page content as hero
    heroImageSrc = firstImageBlock.src;
    heroImageAlt = firstImageBlock.alt || currentPageData?.title || step.title;
    // Remove this image block from content
    contentBlocks = rawBlocks.filter(block => block !== firstImageBlock);
  } else {
    // Keep all blocks (since we're using the dedicated hero_image_url)
    contentBlocks = rawBlocks;
  }

  // Remove ALL framework_cover blocks from content (they're shown as full-page cover, never on right)
  contentBlocks = contentBlocks.filter(
    (block) => !(block && typeof block === 'object' && block.type === 'framework_cover')
  );

  // Avoid duplicate heading: if the first content block is already a heading, don't render page title as h1 (content will show it once).
  const firstContentBlock = contentBlocks[0];
  const firstBlockType =
    firstContentBlock && typeof firstContentBlock === 'object'
      ? (firstContentBlock as { type?: string }).type
      : undefined;
  const firstBlockIsHeading = firstBlockType === 'heading';
  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;

  // ============================================================================
  // FRAMEWORK PROGRESS STRIP (SPARK / VOICE / any framework)
  // ============================================================================
  // Algorithm: letter-based (not page-based) to ignore "Your Turn" pages
  // 
  // Multi-angle analysis:
  // 1. ROUTING: All framework pages share step_type='framework', including "Your Turn"
  // 2. STATE: Current letter must map to the framework acronym (S/P/A/R/K or V/O/I/C/E)
  // 3. INDEX MAPPING: "Your Turn" pages must NOT contribute to letter sequence
  // 4. UI RENDERING: Strip only shows on letter pages; hidden on intro/"Your Turn"
  //
  // Solution: 
  // - Letter sequence comes from chapter.framework_code (SPARK/VOICE)
  // - Current letter detection validates against that sequence
  // - If current page's letter is NOT in the sequence (e.g. 'Y' from "Your Turn"), hide strip
  // ============================================================================
  let frameworkStrip: React.ReactNode = null;
  if (step.step_type === 'framework') {
    // STEP 1: Get the canonical framework letter sequence (source of truth)
    const dbFrameworkCode = (chapter.framework_code || '').toUpperCase();
    let frameworkLetters: string[] = [];

    if (dbFrameworkCode && dbFrameworkCode.length > 0) {
      // Primary: Use chapter.framework_code (e.g., "SPARK" → ['S','P','A','R','K'])
      frameworkLetters = dbFrameworkCode.split('');
    } else {
      // Fallback: Scan pages for framework_letter blocks ONLY (ignore headings to avoid "Your Turn")
      const lettersFromFrameworkBlocks: string[] = [];
      for (const page of pages) {
        const pageBlocks = (page.content ?? []) as any[];
        const first = pageBlocks[0];
        
        // CRITICAL: Only include pages with explicit framework_letter block type
        // This excludes "Your Turn" pages (which use heading/prompt blocks)
        if (first && typeof first === 'object' && (first as any).type === 'framework_letter') {
          const letter = String((first as any).letter || '').toUpperCase();
          if (letter && !lettersFromFrameworkBlocks.includes(letter)) {
            lettersFromFrameworkBlocks.push(letter);
          }
        }
      }
      frameworkLetters = lettersFromFrameworkBlocks;
    }

    // STEP 2: Determine current letter for THIS page
    let currentLetter: string | null = null;
    
    if (firstBlockType === 'framework_letter') {
      // Explicit framework_letter block (VOICE uses this)
      currentLetter = (((firstContentBlock as any).letter as string | undefined) || '').toUpperCase() || null;
    } else if (firstBlockType === 'heading') {
      // Heading-based inference (SPARK uses this, but also matches "Your Turn")
      const headingText = ((firstContentBlock as any).text as string | undefined) || '';
      
      // Extract first letter from heading patterns like "S — Surface the Pattern"
      const match = headingText.match(/^([A-Z])\s*[—\-]/);
      if (match) {
        currentLetter = match[1].toUpperCase();
      } else {
        // Fallback: first capital letter (but we'll validate it below)
        const fallbackMatch = headingText.match(/[A-Z]/);
        currentLetter = fallbackMatch ? fallbackMatch[0].toUpperCase() : null;
      }
    }

    // STEP 3: Validate current letter against framework sequence
    // If current letter is NOT in the framework (e.g., 'Y' from "Your Turn" is not in SPARK),
    // hide the strip on this page
    const currentIndex = currentLetter && frameworkLetters.length > 0 
      ? frameworkLetters.indexOf(currentLetter) 
      : -1;

    // STEP 4: Render strip only if we have a valid framework letter match
    if (currentIndex >= 0) {
      frameworkStrip = (
        <div className="mt-3 mb-4 flex justify-start">
          <div className="inline-flex items-center gap-3 rounded-full bg-white/80 dark:bg-gray-900/80 px-4 py-2 border border-amber-100 dark:border-amber-900/40">
            {frameworkLetters.map((ch, idx) => {
              const isCurrent = idx === currentIndex;
              const isCompleted = idx < currentIndex;
              const isFuture = idx > currentIndex;

              return (
                <span
                  key={ch + idx}
                  className={[
                    'text-sm sm:text-base font-bold tracking-wide',
                    isCurrent && 'text-[#f7b418]',
                    isCompleted && !isCurrent && 'text-[#f7b418]/80',
                    isFuture && 'text-gray-400',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  {ch}
                </span>
              );
            })}
          </div>
        </div>
      );
    }
    // else: strip is null (hidden) on intro/"Your Turn"/any non-letter page
  }

  const isSelfCheck = step.step_type === 'self_check';

  // Self-check: use old-style SelfCheckAssessment component with slider questions
  if (isSelfCheck) {
    // Convert ALL self-check pages' blocks to question format
    const questions: AssessmentQuestion[] = [];
    let questionCounter = 1;

    // Extract questions from ALL pages' scale_questions blocks
    for (const page of pages) {
      const pageBlocks = (page.content ?? []) as any[];
      for (const block of pageBlocks) {
        if (block && typeof block === 'object' && block.type === 'scale_questions') {
          const scaleBlock = block as any;
          if (scaleBlock.questions && Array.isArray(scaleBlock.questions)) {
            for (const q of scaleBlock.questions) {
              // Clean up question text: remove any inline "(1 = ..., 7 = ...)" hints
              const rawText = q.text || q.question || '';
              const cleanedText = rawText.replace(/\(1\s*=\s*[^)]*\)/i, '').trim();

              // Normalize labels: always show Rarely / Always in UI
              const rawMin = (scaleBlock.scale?.minLabel as string | undefined) || '';
              const rawMax = (scaleBlock.scale?.maxLabel as string | undefined) || '';
              const lowLabel =
                rawMin.toLowerCase() === 'low' || rawMin.trim() === ''
                  ? 'Rarely'
                  : rawMin;
              const highLabel =
                rawMax.toLowerCase() === 'high' || rawMax.trim() === ''
                  ? 'Always'
                  : rawMax;

              questions.push({
                id: questionCounter++,
                question: cleanedText,
                low: lowLabel,
                high: highLabel,
              });
            }
          }
        }
      }
    }

    // Fallback: if no questions found, create 3 default questions
    if (questions.length === 0) {
      questions.push(
        {
          id: 1,
          question: 'I avoid speaking situations when possible',
          low: 'Rarely',
          high: 'Always',
        },
        {
          id: 2,
          question: 'My mind goes blank when speaking',
          low: 'Never',
          high: 'Every time',
        },
        {
          id: 3,
          question: 'Physical symptoms (shaking/racing heart) overwhelm me',
          low: 'Manageable',
          high: 'Paralyzing',
        },
      );
    }

    // Check if user has completed this self-check before
    const selfCheckKey = `ch${chapter.chapter_number}_self_check_baseline`;
    const hasCompletedBefore = !!(initialAnswers && initialAnswers[selfCheckKey]);
    
    console.log('Self-check setup:', { 
      chapterNumber: chapter.chapter_number, 
      selfCheckKey, 
      hasCompletedBefore,
      initialAnswersKeys: initialAnswers ? Object.keys(initialAnswers) : []
    });

    // Save answers callback
    const handleSaveAnswers = async (answers: Record<number, number>, totalScore: number) => {
      console.log('Saving self-check answers:', { chapterNumber: chapter.chapter_number, totalScore });
      const result = await submitAssessment(chapter.chapter_number, 'baseline', answers, totalScore);
      
      if (!result.success) {
        console.error('Failed to save self-check:', result.error);
        toast.error('Failed to save your answers. Please try again.');
        return result;
      }
      
      console.log('Self-check saved successfully');
      
      // Award XP and trigger celebration (like all other sections)
      try {
        const sectionResult = await completeDynamicSection({
          chapterNumber: chapter.chapter_number,
          stepType: 'self_check',
        });
        
        if (sectionResult && sectionResult.success) {
          // Trigger celebration in background (user sees it after results screen)
          setTimeout(() => {
            celebrateSectionCompletion({
              xpResult: (sectionResult as any).xpResult,
              reasonCode: (sectionResult as any).reasonCode,
              streakResult: (sectionResult as any).streakResult,
              chapterCompleted: (sectionResult as any).chapterCompleted,
              title: 'Self-Check Complete!',
            });
          }, 800); // Small delay so results screen appears first
        }
      } catch (error) {
        console.error('Error completing self-check section:', error);
        // Don't fail the whole flow if celebration fails
      }
      
      return result;
    };

    return (
      <SelfCheckAssessment
        chapterId={chapter.chapter_number}
        chapterSlug={chapter.slug}
        questions={questions}
        nextStepUrl={nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : '/dashboard'}
        questionsStepTitle={`Chapter ${chapter.chapter_number} Self-Check`}
        questionsStepSubtitle="Rate each statement from 1 to 7. Be honest—only you see this."
        hasCompletedBefore={hasCompletedBefore}
        onSaveAnswers={handleSaveAnswers}
      />
    );
  }

  // If we're on the cover page (currentPage === -1) for "read" step, show cover
  if (currentPage === -1 && step.step_type === 'read') {
    return (
      <ReadingLayout currentProgress={progress} onClose={() => router.push('/dashboard')}>
        <div className="relative w-full h-full">
          <ChapterCoverPage
            chapterNumber={chapter.chapter_number}
            title={chapter.title}
            subtitle={chapter.subtitle}
            onContinue={handleNext}
          />

                  {/* Download chapter PDF button – anchored near bottom center */}
                  <div className="pointer-events-none absolute inset-x-0 bottom-10 flex justify-center">
                    <button
                      type="button"
                      onClick={handleDownloadChapter}
                      className="pointer-events-auto inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-white/95 text-gray-900 text-xs sm:text-sm font-semibold shadow-lg hover:bg-white transition-colors"
                    >
                      <Download className="w-4 h-4" />
                      Download Chapter
                    </button>
                  </div>
        </div>
      </ReadingLayout>
    );
  }

  // Check if current page has framework_cover block (for framework steps)
  if (currentPage === -1 && step.step_type === 'framework') {
    const firstPageContent = pages[0]?.content as any[];
    const frameworkCoverBlock = firstPageContent?.find(
      (block: any) => block && block.type === 'framework_cover'
    );

    if (frameworkCoverBlock) {
      return (
        <ReadingLayout currentProgress={progress} onClose={() => router.push('/dashboard')}>
          <FrameworkCoverPage
            frameworkCode={frameworkCoverBlock.frameworkCode}
            frameworkTitle={frameworkCoverBlock.frameworkTitle}
            letters={frameworkCoverBlock.letters}
            accentColor={frameworkCoverBlock.accentColor}
            backgroundColor={frameworkCoverBlock.backgroundColor}
            onContinue={handleNext}
          />
        </ReadingLayout>
      );
    }
  }

  // Other steps: use image left, content right layout
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
                {frameworkStrip}
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
                  chapterId={chapter.chapter_number}
                  stepId={step.id}
                  pageId={currentPageData?.id}
                />
              ))}
            </div>
          </div>

          {/* Bottom navigation - inside right panel */}
          <div className="flex-shrink-0 p-4 sm:p-6 lg:p-8 border-t border-[#E5D5B0] dark:border-[#4A3B1E] bg-[#FFFAED] dark:bg-[#1A1410] safe-area-pb">
            <div className="flex items-center justify-center gap-4 sm:gap-6 max-w-3xl mx-auto">
              {(currentPage > 0 || (currentPage === 0 && (step.step_type === 'read' || hasFrameworkCover))) && (
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
                  stepId={step.id}
                />
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
