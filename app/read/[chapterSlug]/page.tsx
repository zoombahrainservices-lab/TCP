import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages, getNextStep } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import { getYourTurnResponses } from '@/app/actions/yourTurn';
import { getLastCompletedPageIndex } from '@/app/actions/chapters';
import { getSession } from '@/lib/auth/guards';
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

  // Use cached bundle (single query + 1hr cache)
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
  const [pages, nextStep, { data: savedAnswers }, yourTurnByPrompt, session, resumePageIndex] = await Promise.all([
    getStepPages(readStep.id),
    getNextStep(chapter.id, readStep.order_index),
    getChapterPromptAnswers(chapter.chapter_number),
    getYourTurnResponses(chapter.chapter_number),
    getSession(),
    getStepPages(readStep.id).then(stepPages => 
      getLastCompletedPageIndex(readStep.id, stepPages.map(p => p.id))
    ),
  ]);

  const isAdmin = session?.role === 'admin';

  // Merge saved answers with yourTurn responses
  const mergedAnswers = {
    ...(savedAnswers || {}),
    ...(yourTurnByPrompt || {}),
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
