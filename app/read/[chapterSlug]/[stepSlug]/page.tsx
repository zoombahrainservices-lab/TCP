import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages, getNextStep } from '@/lib/content/queries';
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

  // For self-check steps, always use the canonical chapter assessment route
  // so we get the full-page SelfCheckAssessment experience.
  if (step.step_type === 'self_check' || stepSlug === 'assessment') {
    redirect(`/chapter/${chapter.chapter_number}/assessment`);
  }

  // For proof / resolution steps, always use the dedicated proof route
  // so we get the full Chapter Proof / Resolution experience.
  if (step.step_type === 'resolution' || stepSlug === 'proof') {
    redirect(`/chapter/${chapter.chapter_number}/proof`);
  }

  const pages = await getStepPages(step.id);
  if (!pages.length) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-[var(--color-offwhite)] dark:bg-[#0a1628]">
        <div className="text-center">
          <p className="text-gray-700 dark:text-gray-300 mb-4">No content available for this step yet.</p>
          <a href="/dashboard" className="inline-block px-6 py-3 bg-[#ff6a38] text-white rounded-lg hover:bg-[#ff8c38]">
            Return to Dashboard
          </a>
        </div>
      </div>
    );
  }

  const nextStep = await getNextStep(chapter.id, step.order_index);
  const nextStepSlug = nextStep?.slug ?? null;

  return (
    <DynamicStepClient
      chapter={chapter}
      step={step}
      pages={pages}
      nextStepSlug={nextStepSlug}
    />
  );
}
