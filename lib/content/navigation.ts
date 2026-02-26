import { getChapterBySlug, getChapterSteps } from './queries';

export const STEP_ORDER = [
  'read',
  'self_check',
  'framework',
  'techniques',
  'resolution',
  'follow_through',
] as const;

export interface StepNavItem {
  stepType: string;
  slug: string;
  title: string;
  href: string;
  isActive: boolean;
  isCompleted: boolean;
}

export async function getStepNavForChapter(
  chapterSlug: string,
  chapterNumber: number,
  currentStepType?: string,
  completedStepTypes?: string[]
): Promise<StepNavItem[]> {
  const chapter = await getChapterBySlug(chapterSlug);
  if (!chapter) return [];
  
  const steps = await getChapterSteps(chapter.id);
  const stepMap = new Map(steps.map(s => [s.step_type, s]));
  
  return STEP_ORDER.map(stepType => {
    const step = stepMap.get(stepType);
    if (!step) return null;
    
    const href =
      stepType === 'read'
        ? `/read/${chapterSlug}`
        : `/read/${chapterSlug}/${step.slug}`;
    
    return {
      stepType,
      slug: step.slug,
      title: step.title,
      href,
      isActive: stepType === currentStepType,
      isCompleted: completedStepTypes?.includes(stepType) ?? false,
    };
  }).filter(Boolean) as StepNavItem[];
}
