import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages } from '@/lib/content/queries';
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
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">No content available for this chapter yet.</p>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-[#ff6a38] text-white rounded-lg hover:bg-[#ff8c38]">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const nextStep = steps.find(s => s.order_index === readStep.order_index + 1);
  const nextStepSlug = nextStep?.slug ?? null;

  return (
    <DynamicChapterReadingClient
      chapter={chapter}
      readingStep={readStep}
      pages={pages}
      nextStepSlug={nextStepSlug}
    />
  );
}
