import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages, getNextStep } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import DynamicChapterReadingClient from './DynamicChapterReadingClient';
import ReadingErrorBoundary from '@/components/error/ReadingErrorBoundary';
import ContentNotAvailable from '@/components/error/ContentNotAvailable';

// ISR: Cache this page for 1 hour (instant subsequent loads)
export const revalidate = 3600;

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

  const pages = await getStepPages(readStep.id);
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

  const nextStep = await getNextStep(chapter.id, readStep.order_index);
  const nextStepSlug = nextStep?.slug ?? null;

  const { data: savedAnswers } = await getChapterPromptAnswers(chapter.chapter_number);

  return (
    <ReadingErrorBoundary fallbackUrl="/dashboard">
      <DynamicChapterReadingClient
        chapter={chapter}
        readingStep={readStep}
        pages={pages}
        nextStepSlug={nextStepSlug}
        initialAnswers={savedAnswers}
      />
    </ReadingErrorBoundary>
  );
}
