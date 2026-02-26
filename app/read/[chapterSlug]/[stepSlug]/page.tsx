import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages, getNextStep } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import DynamicStepClient from './DynamicStepClient';

// ISR: Cache this page for 1 hour (instant subsequent loads)
export const revalidate = 3600;

// Force Node runtime (required for service role caching)
export const runtime = 'nodejs';

export default async function DynamicStepPage({
  params,
}: {
  params: Promise<{ chapterSlug: string; stepSlug: string }>;
}) {
  const { chapterSlug, stepSlug } = await params;

  // Use cached bundle (single query + 1hr cache)
  const { chapter, steps } = await getCachedChapterBundle(chapterSlug);
  if (!chapter) redirect('/dashboard');

  const step = steps.find(s => s.slug === stepSlug);
  if (!step) redirect(`/read/${chapterSlug}`);

  const pages = await getStepPages(step.id);
  if (!pages.length) {
    // No content yet for this step – show a simple, hook-free "Coming Soon" screen
    const stepName =
      step.step_type === 'read' ? 'Reading' :
      step.step_type === 'self_check' ? 'Self-Check' :
      step.step_type === 'framework' ? 'Framework' :
      step.step_type === 'techniques' ? 'Techniques' :
      step.step_type === 'resolution' ? 'Resolution' :
      step.step_type === 'follow_through' ? 'Follow-Through' :
      step.title;

    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--color-offwhite)] dark:bg-[#0a1628] px-4">
        <div className="max-w-xl text-center bg-white dark:bg-gray-900 rounded-2xl shadow-lg p-8 border border-gray-200 dark:border-gray-700">
          <p className="text-sm uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-2">
            Chapter {chapter.chapter_number}
          </p>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-3">
            {chapter.title}
          </h1>
          <h2 className="text-lg md:text-xl font-semibold text-gray-800 dark:text-gray-100 mb-4">
            {stepName} section coming soon
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            This part of the chapter isn&apos;t ready yet. Check back later while we finish building it.
          </p>
          <div className="flex justify-center">
            <a
              href="/dashboard"
              className="inline-flex items-center px-6 py-3 rounded-full bg-[#FF6B35] text-white font-semibold text-sm shadow-md hover:bg-[#FF5722] transition-colors"
            >
              Go to dashboard
            </a>
          </div>
        </div>
      </div>
    );
  }

  const nextStep = await getNextStep(chapter.id, step.order_index);
  const nextStepSlug = nextStep?.slug ?? null;

  const { data: savedAnswers } = await getChapterPromptAnswers(chapter.chapter_number);

  return (
    <DynamicStepClient
      chapter={chapter}
      step={step}
      pages={pages}
      nextStepSlug={nextStepSlug}
      initialAnswers={savedAnswers}
    />
  );
}
