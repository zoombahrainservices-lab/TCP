/**
 * Dynamic chapter & section image paths.
 *
 * Convention:
 * - Chapter 1: /slider-work-on-quizz/chapter1/ (reading, framework, technique, follow-through + subfolders)
 * - Chapter 2+: /chapter/chapter {N}/ with filenames = section key (reading.webp, framework.webp, etc.)
 *
 * Only 6 section images: reading, self-check, framework, technique, resolution, follow-through.
 */

export type SectionStepType =
  | 'read'
  | 'self_check'
  | 'framework'
  | 'techniques'
  | 'resolution'
  | 'follow_through'

/** Section keys used for image filenames in chapter 2+ folders */
const SECTION_FILE_NAMES: Record<SectionStepType, string[]> = {
  read: ['reading', 'Reading'],
  self_check: ['self-check', 'self_check', 'Self-Check'],
  framework: ['framework', 'Framework'],
  techniques: ['technique', 'techniques', 'Technique', 'Techniques'],
  resolution: ['resolution', 'Resolution'],
  follow_through: ['follow-through', 'follow_through', 'Follow-Through'],
}

/** Chapter 1 fixed paths (slider-work-on-quizz/chapter1) */
const CHAPTER_1_PATHS: Record<SectionStepType, string | null> = {
  read: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg',
  self_check: '/slider-work-on-quizz/chapter1/chaper1-1.jpeg', // reuse reading cover
  framework: '/slider-work-on-quizz/chapter1/frameworks/spark.webp',
  techniques: '/slider-work-on-quizz/chapter1/technique/Visual Progress.webp',
  resolution: '/slider-work-on-quizz/chapter1/frameworks/spark.webp', // reuse framework
  follow_through: '/slider-work-on-quizz/chapter1/follow through/90days.webp',
}

/** Base path for chapter 2+ (folder name: "chapter 2", "chapter 3", ...) */
const CHAPTER_N_BASE_PREFIX = '/chapter/chapter '

/**
 * Get the base path for a chapter's images (no trailing slash).
 * - Chapter 1: /slider-work-on-quizz/chapter1
 * - Chapter 2+: /chapter/chapter 2, /chapter/chapter 3, ...
 */
export function getChapterImageBase(chapterNumber: number): string {
  if (chapterNumber === 1) {
    return '/slider-work-on-quizz/chapter1'
  }
  return `${CHAPTER_N_BASE_PREFIX}${chapterNumber}`
}

/**
 * Get chapter cover image URL (for map or chapter picker).
 * - Chapter 1: chaper1-1.jpeg in slider-work-on-quizz/chapter1
 * - Chapter 2+: reading.webp or reading.png in chapter/chapter N/
 */
export function getChapterCoverUrl(chapterNumber: number): string {
  if (chapterNumber === 1) {
    return `${getChapterImageBase(1)}/chaper1-1.jpeg`
  }
  const base = getChapterImageBase(chapterNumber)
  return `${base}/reading.webp`
}

/**
 * Get section image URL for a given chapter and step type.
 * Prefers .webp; falls back to .png for chapter 2+.
 */
export function getSectionImageUrl(
  chapterNumber: number,
  stepType: SectionStepType,
  _sectionTitle?: string,
  preferWebp = true
): string {
  if (chapterNumber === 1) {
    const path = CHAPTER_1_PATHS[stepType]
    return path ?? ''
  }
  const base = getChapterImageBase(chapterNumber)
  const names = SECTION_FILE_NAMES[stepType]
  
  // Safety check: if stepType is not in SECTION_FILE_NAMES, return empty string
  if (!names || names.length === 0) {
    console.warn(`[chapterImages] No image names found for stepType: ${stepType}`)
    return ''
  }
  
  const ext = preferWebp ? 'webp' : 'png'
  const name = names[0]
  return `${base}/${name}.${ext}`
}

/**
 * Return [webpUrl, pngUrl] for use with <picture> or fallback on error.
 * Either can be empty string if not used for that chapter/section.
 */
export function getSectionImageCandidates(
  chapterNumber: number,
  stepType: SectionStepType,
  _sectionTitle?: string
): [string, string] {
  if (chapterNumber === 1) {
    const path = CHAPTER_1_PATHS[stepType]
    const url = path ?? ''
    return [url, url]
  }
  const base = getChapterImageBase(chapterNumber)
  const names = SECTION_FILE_NAMES[stepType]
  
  // Safety check: if stepType is not in SECTION_FILE_NAMES, return empty strings
  if (!names || names.length === 0) {
    console.warn(`[chapterImages] No image names found for stepType: ${stepType}`)
    return ['', '']
  }
  
  const name = names[0]
  return [`${base}/${name}.webp`, `${base}/${name}.png`]
}

/**
 * Primary URL for section image (prefer webp).
 */
export function getSectionImageUrlPrimary(
  chapterNumber: number,
  stepType: SectionStepType,
  sectionTitle?: string
): string {
  return getSectionImageUrl(chapterNumber, stepType, sectionTitle, true)
}
