import { redirect } from 'next/navigation';
import { getCachedChapterBundle } from '@/lib/content/cache.server';
import { getStepPages, getNextStepWithContent } from '@/lib/content/queries';
import { getChapterPromptAnswers } from '@/app/actions/prompts';
import { getYourTurnResponses } from '@/app/actions/yourTurn';
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

  // Use cached bundle (single query + 1hr cache)
  const { chapter, steps } = await getCachedChapterBundle(chapterSlug);
  if (!chapter) redirect('/dashboard');

  const step = steps.find(s => s.slug === stepSlug);
  if (!step) redirect(`/read/${chapterSlug}`);

  const pages = await getStepPages(step.id);
  
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
    const nextAvailableStep = await getNextStepWithContent(chapter.id, step.order_index);
    
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

  const nextStep = await getNextStepWithContent(chapter.id, step.order_index);
  const nextStepSlug = nextStep?.slug ?? null;

  // Load both: prompt answers (user_prompt_answers) AND Your Turn responses (artifacts)
  // so the framework/techniques/follow-through steps show real saved data
  const { data: savedAnswers } = await getChapterPromptAnswers(chapter.chapter_number);
  const yourTurnByPrompt = await getYourTurnResponses(chapter.chapter_number);

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
      />
    </ReadingErrorBoundary>
  );
}
