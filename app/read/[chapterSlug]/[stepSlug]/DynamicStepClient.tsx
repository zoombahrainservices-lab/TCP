'use client';

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Download } from 'lucide-react';
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';
import ReadingLayout from '@/components/content/ReadingLayout';
import BlockRenderer from '@/components/content/BlockRenderer';
import ChapterCoverPage from '@/components/content/ChapterCoverPage';
import FrameworkCoverPage from '@/components/content/FrameworkCoverPage';
import AdminEditButton from '@/components/admin/AdminEditButton';
import type { Chapter, Step, Page } from '@/lib/content/types';
import { completeDynamicPage, completeDynamicSection } from '@/app/actions/chapters';
import { submitAssessment } from '@/app/actions/prompts';
import { celebrateSectionCompletion } from '@/lib/celebration/celebrate';
import { writeQueue } from '@/lib/queue/WriteQueue';
import { useClickSound } from '@/lib/hooks/useClickSound';
import { playClickSound } from '@/lib/celebration/sounds';
import { getSectionImageUrlPrimary, type SectionStepType } from '@/lib/chapterImages';
import { usePrefetchImages } from '@/lib/hooks/usePrefetchImage';

// Lazy load self-check components (only used on assessment steps)
const SelfCheckAssessment = dynamic(() => import('@/components/assessment/SelfCheckAssessment'), {
  ssr: false,
});
const SelfCheckMCQAssessment = dynamic(() => import('@/components/assessment/SelfCheckMCQAssessment'), {
  ssr: false,
});
const SelfCheckYesNoAssessment = dynamic(() => import('@/components/assessment/SelfCheckYesNoAssessment'), {
  ssr: false,
});

import type { AssessmentQuestion } from '@/components/assessment/SelfCheckAssessment';
import type { MCQAssessmentQuestion } from '@/components/assessment/SelfCheckMCQAssessment';
import type { YesNoAssessmentQuestion, YesNoScoreBand } from '@/components/assessment/SelfCheckYesNoAssessment';

interface Props {
  chapter: Chapter;
  step: Step;
  pages: Page[];
  nextStepSlug: string | null;
  nextStep: Step | null;
  initialAnswers?: Record<string, any>;
  isAdmin?: boolean;
}

export default function DynamicStepClient({ chapter, step, pages, nextStepSlug, nextStep, initialAnswers = {}, isAdmin = false }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Redirect any legacy "resolution" step in the reading flow to the
  // unified proof page so there is only ONE Resolution experience.
  useEffect(() => {
    if (step.step_type === 'resolution') {
      router.replace(`/chapter/${chapter.chapter_number}/proof`);
    }
  }, [step.step_type, chapter.chapter_number, router]);

  // Don't render the old in-flow resolution UI at all
  if (step.step_type === 'resolution') {
    return null;
  }

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
  const continueButtonRef = useRef<HTMLButtonElement>(null);

  // Build next URL - handle special case for Resolution step
  const nextUrl = nextStepSlug 
    ? nextStep?.step_type === 'resolution'
      ? `/chapter/${chapter.chapter_number}/proof`
      : `/read/${chapter.slug}/${nextStepSlug}`
    : null;

  // Chapter reading PDF download URL
  // Priority:
  // 1) admin-configured chapter.pdf_url
  // 2) chapter 1 legacy printable PDF in public/chapter
  const chapterPdfUrl =
    (typeof chapter.pdf_url === 'string' && chapter.pdf_url.trim().length > 0
      ? chapter.pdf_url.trim()
      : null) ??
    (chapter.chapter_number === 1
      ? `/chapter/${encodeURIComponent('Chapter 1_ From Stage Star to Silent Struggles - Printable (1).pdf')}`
      : null);

  const handleDownloadChapterCore = () => {
    if (!chapterPdfUrl) return;
    // Open in new tab so browser download dialog appears
    window.open(chapterPdfUrl, '_blank');
  };

  const handleDownloadChapter = useClickSound(handleDownloadChapterCore);

  // Jump to specific page from URL query param (?page=3)
  // Note: page param is the array index (0-based in state, but passed as 1-based in URL for readability)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (!pageParam || pages.length === 0) return;

    const pageNumber = Number(pageParam);
    if (!Number.isFinite(pageNumber) || pageNumber < 0) return;

    // Page param is the actual array index
    if (pageNumber >= 0 && pageNumber < pages.length && pageNumber !== currentPage) {
      setCurrentPage(pageNumber);
    }
  }, [searchParams, pages.length]); // Removed currentPage from deps to avoid loops

  // When returning from edit (?page= in URL): focus Continue button so first tap activates it (fixes double-tap)
  useEffect(() => {
    const pageParam = searchParams.get('page');
    if (!pageParam) return;

    const t = setTimeout(() => {
      continueButtonRef.current?.focus({ preventScroll: true });
    }, 100);
    return () => clearTimeout(t);
  }, [searchParams]);

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

  const handledNavRef = useRef<'prev' | 'next' | null>(null);

  const onPreviousPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch') return; // handled by onTouchStart
    e.preventDefault();
    e.stopPropagation();
    handledNavRef.current = 'prev';
    playClickSound();
    handlePreviousCore();
  };
  const onPreviousTouchStart = (e: React.TouchEvent) => {
    handledNavRef.current = 'prev';
    playClickSound();
    handlePreviousCore();
    e.preventDefault();
  };
  const onPreviousClick = (e: React.MouseEvent) => {
    if (handledNavRef.current === 'prev') {
      e.preventDefault();
      handledNavRef.current = null;
      return;
    }
    playClickSound();
    handlePreviousCore();
  };

  const onNextPointerDown = (e: React.PointerEvent) => {
    if (e.button !== 0) return;
    if (e.pointerType === 'touch') return; // handled by onTouchStart
    e.preventDefault();
    e.stopPropagation();
    handledNavRef.current = 'next';
    playClickSound();
    if (currentPage === pages.length - 1) {
      handleCompleteCore();
    } else {
      handleNextCore();
    }
  };
  const onNextTouchStart = (e: React.TouchEvent) => {
    handledNavRef.current = 'next';
    playClickSound();
    if (currentPage === pages.length - 1) {
      handleCompleteCore();
    } else {
      handleNextCore();
    }
    e.preventDefault();
  };
  const onNextClick = (e: React.MouseEvent) => {
    if (handledNavRef.current === 'next') {
      e.preventDefault();
      handledNavRef.current = null;
      return;
    }
    playClickSound();
    if (currentPage === pages.length - 1) {
      handleCompleteCore();
    } else {
      handleNextCore();
    }
  };

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

  const currentPageData = pages[currentPage >= 0 ? currentPage : 0];
  // Calculate progress including cover page for "read" steps and framework steps with cover
  const hasCoverPage = step.step_type === 'read' || hasFrameworkCover;
  const totalPages = hasCoverPage ? pages.length + 1 : pages.length;
  const currentPageIndex = hasCoverPage ? currentPage + 1 : currentPage;
  const progress = totalPages ? ((currentPageIndex + 1) / totalPages) * 100 : 0;
  const sectionLabel =
    step.step_type === 'read'
      ? 'Reading'
      : step.step_type === 'self_check'
        ? 'Self-Check'
        : step.step_type === 'follow_through'
          ? 'Follow-Through'
          : step.title;
  const pageLabel = currentPage < 0 ? 'Cover' : `${currentPage + 1}/${pages.length}`;
  const locationIndicator = `Ch. ${chapter.chapter_number} • ${sectionLabel} • ${pageLabel}`;

  // Derive hero image and content blocks so that image is on the LEFT
  // Priority: page.hero_image_url → first image block from current page → step.hero_image_url → chapter images → placeholder
  // CRITICAL: Remove ALL image blocks from content so they never appear on the right
  const normalizePageBlocks = (content: unknown): any[] => {
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

  const rawBlocks = normalizePageBlocks(currentPageData?.content);
  
  // Title style: from page_meta block (stored in content) or from page.title_style column
  const pageMetaBlock = rawBlocks[0]?.type === 'page_meta' ? rawBlocks[0] : null;
  const titleStyleResolved = (pageMetaBlock as any)?.title_style || currentPageData?.title_style || null;

  const getSafeImageSrc = (value: unknown): string | null => {
    if (typeof value !== 'string') return null;
    const trimmed = value.trim();
    if (!trimmed) return null;
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

  const getHeroImageSrcForPage = (pageData: Page | undefined): string | null => {
    if (!pageData) return null;

    const pageLevelImage = getSafeImageSrc(pageData.hero_image_url);
    if (pageLevelImage) return pageLevelImage;

    const pageBlocks = normalizePageBlocks(pageData.content);
    const firstImageBlock = pageBlocks.find(
      (block) => block && typeof block === 'object' && block.type === 'image' && block.src
    );
    const blockImage = getSafeImageSrc(firstImageBlock?.src);
    if (blockImage) return blockImage;

    return (
      getSafeImageSrc(step.hero_image_url) ??
      getSafeImageSrc(chapter.hero_image_url) ??
      getSafeImageSrc(chapter.thumbnail_url)
    );
  };

  let heroImageSrc: string | null =
    getSafeImageSrc(currentPageData?.hero_image_url) ??
    getSafeImageSrc(step.hero_image_url) ??
    getSafeImageSrc(chapter.hero_image_url) ??
    getSafeImageSrc(chapter.thumbnail_url);
  let heroImageAlt: string = currentPageData?.title || step.title;
  let contentBlocks: any[] = rawBlocks;

  const stepTypeForImage = step.step_type as SectionStepType;
  const sectionFallbackImage =
    chapter.chapter_number && stepTypeForImage
      ? getSectionImageUrlPrimary(chapter.chapter_number, stepTypeForImage)
      : '';

  // Find first image block in current page (fallback if page.hero_image_url is not set)
  const firstImageBlock = rawBlocks.find(
    (block) => block && typeof block === 'object' && block.type === 'image' && block.src
  );

  // If no hero_image_url is set on the page, use the first image block as fallback
  if (!getSafeImageSrc(currentPageData?.hero_image_url) && firstImageBlock) {
    // Use the first image found in page content as hero
    heroImageSrc = getSafeImageSrc(firstImageBlock.src) ?? heroImageSrc;
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
  // Remove page_meta blocks (they only hold title_style; not rendered)
  contentBlocks = contentBlocks.filter(
    (block) => !(block && typeof block === 'object' && block.type === 'page_meta')
  );

  // Avoid duplicate heading: if the first content block is already a heading, don't render page title as h1 (content will show it once).
  const firstContentBlock = contentBlocks[0];
  const firstBlockType =
    firstContentBlock && typeof firstContentBlock === 'object'
      ? (firstContentBlock as { type?: string }).type
      : undefined;
  const firstBlockIsHeading = firstBlockType === 'heading';
  const showPageTitle = currentPageData?.title && !firstBlockIsHeading;
  const isFollowThroughChecklistPage =
    step.step_type === 'follow_through' &&
    Array.isArray(contentBlocks) &&
    contentBlocks.some(
      (block) => block && typeof block === 'object' && (block as { type?: string }).type === 'checklist'
    );

  const heroImageStateKey = currentPageData?.id ?? `page-${currentPage}`;
  const [displayHeroImageSrc, setDisplayHeroImageSrc] = useState<string | null>(heroImageSrc);

  useEffect(() => {
    setDisplayHeroImageSrc(heroImageSrc);
  }, [heroImageSrc, heroImageStateKey]);

  const handleHeroImageError = () => {
    if (sectionFallbackImage && displayHeroImageSrc !== sectionFallbackImage) {
      setDisplayHeroImageSrc(sectionFallbackImage);
      return;
    }
    setDisplayHeroImageSrc(null);
  };

  // Keep a rolling lookahead window warm as the user advances through pages.
  const lookaheadImageSrcs = [
    getHeroImageSrcForPage(pages[Math.max(currentPage + 1, 0)]),
    getHeroImageSrcForPage(pages[Math.max(currentPage + 2, 1)]),
  ];
  usePrefetchImages(lookaheadImageSrcs, {
    priority: 'low',
    defer: true,
  });

  // Prefetch next step route as early as possible.
  useEffect(() => {
    if (nextUrl) {
      router.prefetch(nextUrl);
    }
  }, [router, nextUrl]);

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
  const selfCheckAnalysis = useMemo(() => {
    if (!isSelfCheck) {
      return {
        hasScaleBlocks: false,
        hasMcqBlocks: false,
        hasYesNoBlocks: false,
        questions: [] as AssessmentQuestion[],
        mcqQuestions: [] as MCQAssessmentQuestion[],
        yesNoQuestions: [] as YesNoAssessmentQuestion[],
        yesNoScoreBands: [] as YesNoScoreBand[],
      };
    }

    const questions: AssessmentQuestion[] = [];
    const mcqQuestions: MCQAssessmentQuestion[] = [];
    const yesNoQuestions: YesNoAssessmentQuestion[] = [];
    const yesNoScoreBands: YesNoScoreBand[] = [];
    let questionCounter = 1;
    let hasScaleBlocks = false;
    let hasMcqBlocks = false;
    let hasYesNoBlocks = false;

    for (const page of pages) {
      const pageBlocks = (page.content ?? []) as any[];
      for (const block of pageBlocks) {
        if (!block || typeof block !== 'object') continue;

        if (block.type === 'mcq') {
          hasMcqBlocks = true;
          const blockQuestions = Array.isArray((block as any).questions) ? (block as any).questions : [];
          for (const q of blockQuestions) {
            const qId = String(q?.id || `mcq_q_${mcqQuestions.length + 1}`);
            const qText = String(q?.text || '').trim();
            const qOptions = Array.isArray(q?.options)
              ? q.options.map((opt: any, idx: number) => ({
                  id: String(opt?.id || `opt_${idx + 1}`),
                  text: String(opt?.text || `Option ${idx + 1}`),
                }))
              : [];
            if (!qText || qOptions.length === 0) continue;
            mcqQuestions.push({
              id: qId,
              question: qText,
              options: qOptions,
              ...(q?.correctOptionId ? { correctOptionId: String(q.correctOptionId) } : {}),
            });
          }
        }

        if (block.type === 'scale_questions') {
          hasScaleBlocks = true;
          const scaleBlock = block as any;
          if (scaleBlock.questions && Array.isArray(scaleBlock.questions)) {
            for (const q of scaleBlock.questions) {
              const rawText = q.text || q.question || '';
              const cleanedText = rawText.replace(/\(1\s*=\s*[^)]*\)/i, '').trim();

              const rawMin = (scaleBlock.scale?.minLabel as string | undefined) || '';
              const rawMax = (scaleBlock.scale?.maxLabel as string | undefined) || '';
              const lowLabel = rawMin.toLowerCase() === 'low' || rawMin.trim() === '' ? 'Rarely' : rawMin;
              const highLabel = rawMax.toLowerCase() === 'high' || rawMax.trim() === '' ? 'Always' : rawMax;

              questions.push({
                id: questionCounter++,
                question: cleanedText,
                low: lowLabel,
                high: highLabel,
              });
            }
          }
        }

        if (block.type === 'yes_no_check') {
          hasYesNoBlocks = true;
          const yesNoBlock = block as any;
          
          // Parse statements/questions
          if (yesNoBlock.statements && Array.isArray(yesNoBlock.statements)) {
            for (const statement of yesNoBlock.statements) {
              if (statement && statement.id && statement.text) {
                yesNoQuestions.push({
                  id: String(statement.id),
                  text: String(statement.text),
                });
              }
            }
          }
          
          // Parse score bands if present
          if (yesNoBlock.scoring && yesNoBlock.scoring.bands && Array.isArray(yesNoBlock.scoring.bands)) {
            for (const band of yesNoBlock.scoring.bands) {
              if (band && Array.isArray(band.range) && band.range.length === 2) {
                yesNoScoreBands.push({
                  range: [band.range[0], band.range[1]],
                  label: String(band.label || ''),
                  description: band.description ? String(band.description) : undefined,
                });
              }
            }
          }
        }
      }
    }

    return { hasScaleBlocks, hasMcqBlocks, hasYesNoBlocks, questions, mcqQuestions, yesNoQuestions, yesNoScoreBands };
  }, [isSelfCheck, pages]);

  // Use legacy slider UI only for pure scale-based self-check steps.
  // If MCQ exists (or mixed content), fall back to normal block rendering below.
  const selfCheckPageId = pages[0]?.id;
  const selfCheckReturnUrl = `/read/${chapter.slug}/${step.slug}`;

  if (isSelfCheck && selfCheckAnalysis.hasScaleBlocks && !selfCheckAnalysis.hasMcqBlocks) {
    const questions = selfCheckAnalysis.questions;
    if (questions.length === 0) {
      return (
        <ReadingLayout
          currentProgress={progress}
          onClose={() => router.push('/dashboard')}
          locationIndicator={locationIndicator}
          serverCurrentChapter={chapter.chapter_number}
          collapseSidebarByDefault={true}
          isAdmin={isAdmin}
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Self-Check Not Configured</h2>
              <p className="text-amber-800">
                This self-check has scale blocks but no questions configured yet. Please add questions in the admin editor.
              </p>
            </div>
          </div>
        </ReadingLayout>
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
      const result = await submitAssessment(
        chapter.chapter_number,
        'baseline',
        answers as any,
        totalScore
      );
      
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
        adminEditChapterId={chapter.id}
        adminEditPageId={selfCheckPageId}
        adminEditStepId={step.id}
        adminEditReturnUrl={selfCheckReturnUrl}
      />
    );
  }

  // Self-check MCQ (or mixed assessment content): render full-page MCQ flow, one question per page.
  if (isSelfCheck && selfCheckAnalysis.hasMcqBlocks) {
    const mcqQuestions = selfCheckAnalysis.mcqQuestions;
    if (mcqQuestions.length === 0) {
      return (
        <ReadingLayout
          currentProgress={progress}
          onClose={() => router.push('/dashboard')}
          locationIndicator={locationIndicator}
          serverCurrentChapter={chapter.chapter_number}
          collapseSidebarByDefault={true}
          isAdmin={isAdmin}
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Self-Check MCQ Not Configured</h2>
              <p className="text-amber-800">
                MCQ blocks were found, but no valid MCQ questions/options are configured yet.
              </p>
            </div>
          </div>
        </ReadingLayout>
      );
    }

    const selfCheckKey = `ch${chapter.chapter_number}_self_check_baseline`;
    const hasCompletedBefore = !!(initialAnswers && initialAnswers[selfCheckKey]);

    const handleSaveMcqAnswers = async (answers: Record<string, string>, totalScore: number) => {
      const result = await submitAssessment(
        chapter.chapter_number,
        'baseline',
        answers as any,
        totalScore
      );
      if (!result.success) {
        toast.error('Failed to save your answers. Please try again.');
        return result;
      }

      try {
        const sectionResult = await completeDynamicSection({
          chapterNumber: chapter.chapter_number,
          stepType: 'self_check',
        });

        if (sectionResult && sectionResult.success) {
          setTimeout(() => {
            celebrateSectionCompletion({
              xpResult: (sectionResult as any).xpResult,
              reasonCode: (sectionResult as any).reasonCode,
              streakResult: (sectionResult as any).streakResult,
              chapterCompleted: (sectionResult as any).chapterCompleted,
              title: 'Self-Check Complete!',
            });
          }, 600);
        }
      } catch (error) {
        console.error('Error completing self-check section:', error);
      }

      return result;
    };

    return (
      <SelfCheckMCQAssessment
        chapterId={chapter.chapter_number}
        chapterSlug={chapter.slug}
        questions={mcqQuestions}
        nextStepUrl={nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : '/dashboard'}
        questionsStepTitle={`Chapter ${chapter.chapter_number} Self-Check`}
        questionsStepSubtitle="Answer one question at a time. Be honest—only you see this."
        hasCompletedBefore={hasCompletedBefore}
        onSaveAnswers={handleSaveMcqAnswers}
        adminEditChapterId={chapter.id}
        adminEditPageId={selfCheckPageId}
        adminEditStepId={step.id}
        adminEditReturnUrl={selfCheckReturnUrl}
      />
    );
  }

  // Self-check Yes/No: render full-page Yes/No assessment flow
  if (isSelfCheck && selfCheckAnalysis.hasYesNoBlocks) {
    const yesNoQuestions = selfCheckAnalysis.yesNoQuestions;
    if (yesNoQuestions.length === 0) {
      return (
        <ReadingLayout
          currentProgress={progress}
          onClose={() => router.push('/dashboard')}
          locationIndicator={locationIndicator}
          serverCurrentChapter={chapter.chapter_number}
          collapseSidebarByDefault={true}
          isAdmin={isAdmin}
        >
          <div className="mx-auto w-full max-w-3xl px-6 py-10">
            <div className="rounded-xl border border-amber-200 bg-amber-50 p-6">
              <h2 className="text-2xl font-bold text-amber-900 mb-2">Self-Check Not Configured</h2>
              <p className="text-amber-800">
                Yes/No blocks were found, but no statements are configured yet.
              </p>
            </div>
          </div>
        </ReadingLayout>
      );
    }

    const selfCheckKey = `ch${chapter.chapter_number}_self_check_baseline`;
    const hasCompletedBefore = !!(initialAnswers && initialAnswers[selfCheckKey]);

    const handleSaveYesNoAnswers = async (answers: Record<string, 'yes' | 'no' | 'not_sure'>, yesCount: number) => {
      // Convert Yes/No answers to the assessment format expected by submitAssessment
      const result = await submitAssessment(
        chapter.chapter_number,
        'baseline',
        answers as any,
        yesCount
      );
      if (!result.success) {
        toast.error('Failed to save your answers. Please try again.');
        return result;
      }

      try {
        const sectionResult = await completeDynamicSection({
          chapterNumber: chapter.chapter_number,
          stepType: 'self_check',
        });

        if (sectionResult && sectionResult.success) {
          setTimeout(() => {
            celebrateSectionCompletion({
              xpResult: (sectionResult as any).xpResult,
              reasonCode: (sectionResult as any).reasonCode,
              streakResult: (sectionResult as any).streakResult,
              chapterCompleted: (sectionResult as any).chapterCompleted,
              title: 'Self-Check Complete!',
            });
          }, 600);
        }
      } catch (error) {
        console.error('Error completing self-check section:', error);
      }

      return result;
    };

    return (
      <SelfCheckYesNoAssessment
        chapterId={chapter.chapter_number}
        chapterSlug={chapter.slug}
        questions={yesNoQuestions}
        scoreBands={selfCheckAnalysis.yesNoScoreBands}
        nextStepUrl={nextStepSlug ? `/read/${chapter.slug}/${nextStepSlug}` : '/dashboard'}
        questionsStepTitle={`Chapter ${chapter.chapter_number} Self-Check`}
        questionsStepSubtitle="Answer each statement honestly. Only you see this."
        hasCompletedBefore={hasCompletedBefore}
        onSaveAnswers={handleSaveYesNoAnswers}
        adminEditChapterId={chapter.id}
        adminEditPageId={selfCheckPageId}
        adminEditStepId={step.id}
        adminEditReturnUrl={selfCheckReturnUrl}
      />
    );
  }

  // Explicit empty-state for self-check steps with no supported assessment blocks.
  if (isSelfCheck && !selfCheckAnalysis.hasScaleBlocks && !selfCheckAnalysis.hasMcqBlocks && !selfCheckAnalysis.hasYesNoBlocks) {
    return (
      <ReadingLayout
        currentProgress={progress}
        onClose={() => router.push('/dashboard')}
        locationIndicator={locationIndicator}
        serverCurrentChapter={chapter.chapter_number}
        collapseSidebarByDefault={true}
        isAdmin={isAdmin}
      >
        <div className="mx-auto w-full max-w-3xl px-6 py-10">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6">
            <h2 className="text-2xl font-bold text-red-900 mb-2">Self-Check Content Missing</h2>
            <p className="text-red-800">
              No `scale_questions`, `mcq`, or `yes_no_check` blocks were found for this chapter&apos;s self-check step.
            </p>
          </div>
        </div>
      </ReadingLayout>
    );
  }

  // If we're on the cover page (currentPage === -1) for "read" step, show cover
  if (currentPage === -1 && step.step_type === 'read') {
    return (
    <ReadingLayout
      currentProgress={progress}
      onClose={() => router.push('/dashboard')}
      locationIndicator={locationIndicator}
      serverCurrentChapter={chapter.chapter_number}
      collapseSidebarByDefault={true}
      isAdmin={isAdmin}
    >
        <ChapterCoverPage
          chapterNumber={chapter.chapter_number}
          title={chapter.title}
          subtitle={chapter.subtitle}
          onContinue={handleNext}
          onDownload={handleDownloadChapter}
          showDownloadButton={!!chapterPdfUrl}
        />
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
    <ReadingLayout
      currentProgress={progress}
      onClose={() => router.push('/dashboard')}
      locationIndicator={locationIndicator}
      serverCurrentChapter={chapter.chapter_number}
      collapseSidebarByDefault={true}
      isAdmin={isAdmin}
    >
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
    <ReadingLayout
      currentProgress={progress}
      onClose={() => router.push('/dashboard')}
      locationIndicator={locationIndicator}
      serverCurrentChapter={chapter.chapter_number}
      collapseSidebarByDefault={true}
      isAdmin={isAdmin}
    >
      <div className="flex-1 min-h-0 flex flex-col lg:flex-row">
        {!isFollowThroughChecklistPage && (
          <div className="w-full lg:w-1/2 h-48 sm:h-64 lg:h-full lg:min-h-[400px] flex-shrink-0 relative overflow-hidden bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
            {displayHeroImageSrc ? (
              <img
                key={heroImageStateKey}
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
        )}

        <div className={`${isFollowThroughChecklistPage ? 'w-full' : 'w-full lg:w-1/2'} bg-[#FFF8E7] dark:bg-[#2A2416] flex flex-col flex-1 min-h-0 overflow-hidden`}>
          {/* Content - scrollable on mobile */}
          <div className={`flex-1 ${isFollowThroughChecklistPage ? 'p-6 sm:p-8' : 'p-6 sm:p-8 lg:p-12'} min-h-0 reading-scroll`}>
            <div className={`${isFollowThroughChecklistPage ? 'max-w-[980px] mx-auto w-full' : ''} space-y-6`}>
              <div className="mb-6">
                <p className="text-sm text-[#ff6a38] font-semibold uppercase tracking-wide mb-2">
                  {step.title}
                </p>
                {frameworkStrip}
                {showPageTitle && (
                  <h1
                    className="text-3xl md:text-4xl font-bold text-[#2a2416] dark:text-white"
                    style={{
                      ...(titleStyleResolved?.color && { color: titleStyleResolved.color }),
                      ...(titleStyleResolved?.fontSize && {
                        fontSize:
                          titleStyleResolved.fontSize === 'sm'
                            ? '1.25rem'
                            : titleStyleResolved.fontSize === 'md'
                              ? '1.5rem'
                              : titleStyleResolved.fontSize === 'lg'
                                ? '1.875rem'
                                : titleStyleResolved.fontSize === 'xl'
                                  ? '2.25rem'
                                  : undefined,
                      }),
                      ...(titleStyleResolved?.fontWeight && {
                        fontWeight:
                          titleStyleResolved.fontWeight === 'normal'
                            ? 400
                            : titleStyleResolved.fontWeight === 'semibold'
                              ? 600
                              : titleStyleResolved.fontWeight === 'bold'
                                ? 700
                                : undefined,
                      }),
                    }}
                  >
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
                  type="button"
                  onPointerDown={onPreviousPointerDown}
                  onTouchStart={onPreviousTouchStart}
                  onClick={onPreviousClick}
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
                  returnUrl={`/read/${chapter.slug}/${step.slug}?page=${currentPage}`}
                />
              )}
              <button
                ref={continueButtonRef}
                type="button"
                onPointerDown={onNextPointerDown}
                onTouchStart={onNextTouchStart}
                onClick={onNextClick}
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
