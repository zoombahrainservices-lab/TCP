import { redirect } from 'next/navigation'
import { getCachedChapterByNumber } from '@/lib/content/cache.server'

/** Map URL section key to step slug for /read/[chapterSlug]/[stepSlug]. Step slugs match section keys except reading->read. */
const SECTION_TO_STEP_SLUG: Record<string, string> = {
  'reading': 'read',
  'assessment': 'assessment',
  'framework': 'framework',
  'techniques': 'techniques',
  'proof': 'proof',
  'follow-through': 'follow-through',
}

export default async function ChapterSectionRedirect({
  params,
}: {
  params: Promise<{ chapterId: string; sectionKey: string }>;
}) {
  const { chapterId, sectionKey } = await params

  const chapterNum = parseInt(chapterId, 10)
  if (isNaN(chapterNum)) {
    redirect('/dashboard')
  }

  const chapter = await getCachedChapterByNumber(chapterNum)
  if (!chapter?.slug) {
    redirect('/dashboard')
  }

  const stepSlug = SECTION_TO_STEP_SLUG[sectionKey]
  if (!stepSlug) {
    redirect(`/read/${chapter.slug}`)
  }

  redirect(`/read/${chapter.slug}/${stepSlug}`)
}
