/**
 * Shared navigation helpers for the guided-book flow.
 * Ensures all sections use canonical URLs to avoid redirect detours.
 */

export type GuidedSectionType = 
  | 'reading' 
  | 'self_check' 
  | 'framework' 
  | 'techniques' 
  | 'resolution' 
  | 'follow_through';

/** Map step_type to URL-safe slug */
export const STEP_TYPE_TO_SLUG: Record<GuidedSectionType, string> = {
  reading: 'read',
  self_check: 'assessment',
  framework: 'framework',
  techniques: 'techniques',
  resolution: 'proof',
  follow_through: 'follow-through',
};

/** Map chapter number to slug */
export const CHAPTER_NUMBER_TO_SLUG: Record<number, string> = {
  1: 'stage-star-silent-struggles',
  2: 'genius-who-couldnt-speak',
};

/**
 * Get chapter slug from chapter number.
 * Falls back to `chapter-N` format for chapters without explicit slugs.
 */
export function getChapterSlug(chapterNumber: number): string {
  return CHAPTER_NUMBER_TO_SLUG[chapterNumber] || `chapter-${chapterNumber}`;
}

/**
 * Build canonical URL for a guided-book section.
 * Resolution always uses `/chapter/{N}/proof` to avoid redirect overhead.
 */
export function getGuidedSectionUrl(
  chapterNumber: number,
  sectionType: GuidedSectionType
): string {
  // Special case: Resolution uses dedicated route
  if (sectionType === 'resolution') {
    return `/chapter/${chapterNumber}/proof`;
  }

  const chapterSlug = getChapterSlug(chapterNumber);
  const stepSlug = STEP_TYPE_TO_SLUG[sectionType];

  // Reading is at chapter root
  if (sectionType === 'reading') {
    return `/read/${chapterSlug}`;
  }

  return `/read/${chapterSlug}/${stepSlug}`;
}

/**
 * Build URL for the reading hub (all chapters).
 */
export function getReadingHubUrl(): string {
  return '/read';
}

/**
 * Build URL for the dashboard.
 */
export function getDashboardUrl(): string {
  return '/dashboard';
}

/**
 * Get follow-through URL for a chapter (legacy compat for Ch1).
 */
export function getFollowThroughUrl(chapterNumber: number): string {
  if (chapterNumber === 1) {
    return '/chapter/1/follow-through';
  }
  return getGuidedSectionUrl(chapterNumber, 'follow_through');
}

/**
 * Determine section type from step_type string.
 */
export function normalizeSectionType(stepType: string): GuidedSectionType | null {
  const normalized = stepType.trim().toLowerCase();
  
  switch (normalized) {
    case 'read':
    case 'reading':
      return 'reading';
    case 'self_check':
    case 'assessment':
      return 'self_check';
    case 'framework':
      return 'framework';
    case 'techniques':
      return 'techniques';
    case 'resolution':
    case 'proof':
      return 'resolution';
    case 'follow_through':
    case 'follow-through':
      return 'follow_through';
    default:
      return null;
  }
}

/**
 * Build next-step URL from step data.
 * Handles resolution redirect and fallback to dashboard.
 */
export function getNextStepUrl(
  chapterNumber: number,
  nextStepType: string | null | undefined
): string {
  if (!nextStepType) {
    return getDashboardUrl();
  }

  const sectionType = normalizeSectionType(nextStepType);
  if (!sectionType) {
    return getDashboardUrl();
  }

  return getGuidedSectionUrl(chapterNumber, sectionType);
}
