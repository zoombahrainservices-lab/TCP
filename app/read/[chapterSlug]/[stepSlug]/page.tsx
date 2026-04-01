import { redirect } from 'next/navigation';
import { getCachedChapterBundle, getCachedChapterBundleAdmin } from '@/lib/content/cache.server';
import { getStepPages, getNextStepWithContentV2 } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import { getYourTurnResponses } from '@/app/actions/yourTurn';
import { getSession } from '@/lib/auth/guards';
import DynamicStepClient from './DynamicStepClient';
import ReadingErrorBoundary from '@/components/error/ReadingErrorBoundary';
import ContentNotAvailable from '@/components/error/ContentNotAvailable';

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

  // Check if user is admin so they can access unpublished chapters
  const session = await getSession();
  const isAdmin = session?.role === 'admin';

  // Admin: use admin bundle (includes unpublished), else use public bundle (published only)
  const result = isAdmin 
    ? await getCachedChapterBundleAdmin(chapterSlug)
    : await getCachedChapterBundle(chapterSlug);
  
  if (!result || !result.chapter) redirect('/dashboard');
  
  const { chapter, steps } = result;

  const normalizedStepSlug = stepSlug.trim().toLowerCase();
  const selfCheckAliases = new Set(['assessment', 'self-check', 'selfcheck']);

  const step =
    steps.find(s => s.slug === stepSlug) ??
    (selfCheckAliases.has(normalizedStepSlug)
      ? steps.find(s => s.step_type === 'self_check')
      : undefined);
  if (!step) redirect(`/read/${chapterSlug}`);

  // Parallelize independent queries after step is known
  const [pages, nextStep, { data: savedAnswers }, yourTurnByPrompt] = await Promise.all([
    getStepPages(step.id),
    getNextStepWithContentV2(chapter.id, step.order_index),
    getChapterPromptAnswers(chapter.chapter_number),
    getYourTurnResponses(chapter.chapter_number),
  ]);
  
  // Enhanced error handling: Show user-friendly message instead of crashing
  if (!pages.length) {
    // Check if this is self-check or any other step without content
    const stepTypeLabel = step.step_type === 'self_check' 
      ? 'Self-Check' 
      : step.step_type === 'framework' 
      ? 'Framework' 
      : step.step_type === 'techniques' 
      ? 'Techniques' 
      : step.step_type === 'resolution' 
      ? 'Resolution' 
      : step.step_type === 'follow_through' 
      ? 'Follow-Through' 
      : step.title;

    // Try to find next available step
    const nextAvailableStep = nextStep;
    
    return (
      <ContentNotAvailable
        title={`${stepTypeLabel} Not Available Yet`}
        message={`The ${stepTypeLabel} content for Chapter ${chapter.chapter_number} is not ready yet. ${
          nextAvailableStep 
            ? `You can continue with ${nextAvailableStep.title}.` 
            : 'Please check back later or continue with available chapters.'
        }`}
        backUrl={nextAvailableStep ? `/read/${chapter.slug}/${nextAvailableStep.slug}` : '/dashboard'}
        backLabel={nextAvailableStep ? `Go to ${nextAvailableStep.title}` : 'Go to Dashboard'}
      />
    );
  }

  const nextStepSlug = nextStep?.slug ?? null;

  // Merge: Your Turn responses keyed by promptKey (e.g. ch1_framework_1) so blocks with matching id show saved text
  const mergedAnswers: Record<string, any> = { ...savedAnswers };
  for (const [promptKey, item] of Object.entries(yourTurnByPrompt)) {
    if (item?.responseText != null) {
      mergedAnswers[promptKey] = item.responseText;
    }
  }

  return (
    <ReadingErrorBoundary fallbackUrl="/dashboard">
      <DynamicStepClient
        chapter={chapter}
        step={step}
        pages={pages}
        nextStepSlug={nextStepSlug}
        nextStep={nextStep}
        initialAnswers={mergedAnswers}
        isAdmin={isAdmin}
      />
    </ReadingErrorBoundary>
  );
}
