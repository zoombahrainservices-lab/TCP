import { redirect } from 'next/navigation';
import { getCachedChapterBundle, getCachedStepPages } from '@/lib/content/cache.server';
import { getNextStep } from '@/lib/content/queries';
import { getCachedGuidedFlowUserState, getCachedResumePosition } from '@/lib/content/guided-flow-loader.server';
import DynamicChapterReadingClient from './DynamicChapterReadingClient';
import ReadingErrorBoundary from '@/components/error/ReadingErrorBoundary';
import ContentNotAvailable from '@/components/error/ContentNotAvailable';

// Force dynamic rendering for user-specific data
export const dynamic = 'force-dynamic';

// Force Node runtime (required for service role caching)
export const runtime = 'nodejs';

export default async function DynamicChapterReadingPage({
  params,
}: {
  params: Promise<{ chapterSlug: string }>;
}) {
  const { chapterSlug } = await params;

  // Use cached bundle (single query + 5min cache)
  const { chapter, steps } = await getCachedChapterBundle(chapterSlug);
  if (!chapter) redirect('/dashboard');

  const readStep = steps.find(s => s.step_type === 'read');
  if (!readStep) {
    return (
      <ContentNotAvailable
        title="Reading Content Not Available"
        message={`The reading content for ${chapter.title} is not ready yet. Please check back later or continue with available chapters.`}
        backUrl="/dashboard"
        backLabel="Go to Dashboard"
      />
    );
  }

  // Parallelize independent queries after chapter/step is known
  // Use cached step pages instead of uncached getStepPages
  const [pages, nextStep, userState] = await Promise.all([
    getCachedStepPages(readStep.id),
    getNextStep(chapter.id, readStep.order_index),
    getCachedGuidedFlowUserState(chapter.chapter_number),
  ]);

  // Get resume position using already-loaded pages
  const resumePageIndex = await getCachedResumePosition(readStep.id, pages.map(p => p.id));

  const { isAdmin, savedAnswers, yourTurnByPrompt } = userState;

  // Merge saved answers with yourTurn responses
  const mergedAnswers = {
    ...savedAnswers,
    ...yourTurnByPrompt,
  };

  if (!pages.length) {
    return (
      <ContentNotAvailable
        title="Reading Content Not Available"
        message={`The reading content for Chapter ${chapter.chapter_number}: ${chapter.title} is not ready yet. Please check back later or continue with available chapters.`}
        backUrl="/dashboard"
        backLabel="Go to Dashboard"
      />
    );
  }

  const nextStepSlug = nextStep?.slug ?? null;

  return (
    <ReadingErrorBoundary fallbackUrl="/dashboard">
      <DynamicChapterReadingClient
        chapter={chapter}
        readingStep={readStep}
        pages={pages}
        nextStepSlug={nextStepSlug}
        initialAnswers={mergedAnswers}
        resumePageIndex={resumePageIndex}
        isAdmin={isAdmin}
      />
    </ReadingErrorBoundary>
  );
}
