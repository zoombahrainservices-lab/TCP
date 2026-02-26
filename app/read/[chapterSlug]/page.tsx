import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import DynamicChapterReadingClient from './DynamicChapterReadingClient';

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
  if (!readStep) redirect('/dashboard');

  const pages = await getStepPages(readStep.id);
  if (!pages.length) {
    redirect('/dashboard');
  }

  const nextStep = steps.find(s => s.order_index === readStep.order_index + 1);
  const nextStepSlug = nextStep?.slug ?? null;

  const { data: savedAnswers } = await getChapterPromptAnswers(chapter.chapter_number);

  return (
    <DynamicChapterReadingClient
      chapter={chapter}
      readingStep={readStep}
      pages={pages}
      nextStepSlug={nextStepSlug}
      initialAnswers={savedAnswers}
    />
  );
}
