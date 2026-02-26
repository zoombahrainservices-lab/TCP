import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
import { createClient } from '@/lib/supabase/server'
import MapClient, { type MapChapter } from './MapClient'

export default async function MapPage() {
  const user = await requireAuth()

  const [chapterReports, allChapters] = await Promise.all([
    getChapterReportsData(user.id),
    getCachedAllChapters(),
  ])
  const supabase = await createClient()

  const publishedChapters = Array.isArray(allChapters) ? allChapters : []
  const progressList = Array.isArray(chapterReports) ? chapterReports : []

  const progressByNumber = new Map<number, (typeof progressList)[0]>()
  for (const row of progressList) {
    if (typeof row.chapter_id === 'number') {
      progressByNumber.set(row.chapter_id, row)
    }
  }

  let currentChapterNumber: number | null = null
  for (const chapter of publishedChapters) {
    const chapterNum = chapter.chapter_number as number
    const progress = progressByNumber.get(chapterNum)
    const totalSections = progress?.totalSections ?? 6
    const completedCount = progress?.completedCount ?? 0

    if (!progress || completedCount < totalSections) {
      currentChapterNumber = chapterNum
      break
    }
  }

  if (currentChapterNumber == null && publishedChapters.length > 0) {
    currentChapterNumber = publishedChapters[publishedChapters.length - 1].chapter_number as number
  }

  const [{ data: allSteps }, { data: allPages }, { data: completedPages }] = await Promise.all([
    supabase
      .from('chapter_steps')
      .select('id, chapter_id, step_type, title, slug, order_index')
      .order('order_index', { ascending: true }),
    supabase
      .from('step_pages')
      .select('id, step_id, title, slug, order_index')
      .order('order_index', { ascending: true }),
    supabase
      .from('step_completions')
      .select('page_id')
      .eq('user_id', user.id),
  ])

  const completedPageIds = new Set(completedPages?.map((c) => c.page_id) ?? [])

  const mapChapters: MapChapter[] = publishedChapters.map((ch) => {
    const chapterNum = ch.chapter_number as number
    const progress = progressByNumber.get(chapterNum)
    const totalSections = progress?.totalSections ?? 6
    const completedCount = progress?.completedCount ?? 0
    const isCompleted = completedCount >= totalSections

    const idx = publishedChapters.findIndex((c) => c.chapter_number === chapterNum)
    const prevChapter = idx > 0 ? publishedChapters[idx - 1] : null
    const prevProgress = prevChapter ? progressByNumber.get(prevChapter.chapter_number as number) : null
    const prevCompleted =
      prevProgress && (prevProgress.completedCount ?? 0) >= (prevProgress.totalSections ?? 6)

    let status: MapChapter['status'] = 'locked'
    if (isCompleted) {
      status = 'completed'
    } else if (idx === 0 || prevCompleted) {
      status = 'unlocked'
    }

    const chapterSteps = (allSteps ?? [])
      .filter((step) => step.chapter_id === ch.id)
      .sort((a, b) => a.order_index - b.order_index)

    const sections = chapterSteps.map((step) => {
      const pages = (allPages ?? [])
        .filter((page) => page.step_id === step.id)
        .sort((a, b) => a.order_index - b.order_index)
        .map((page) => ({
          id: page.id,
          slug: page.slug,
          title: page.title ?? `Page ${page.order_index}`,
          order_index: page.order_index,
          isCompleted: completedPageIds.has(page.id),
        }))

      return {
        id: step.id,
        step_type: step.step_type,
        title: step.title,
        slug: step.slug,
        order_index: step.order_index,
        pages,
      }
    })

    return {
      id: ch.id,
      chapter_number: chapterNum,
      slug: ch.slug,
      title: ch.title,
      framework_code: ch.framework_code ?? null,
      status,
      completed_count: completedCount,
      total_sections: totalSections,
      sections,
    }
  })

  return (
    <MapClient chapters={mapChapters} currentChapterNumber={currentChapterNumber} />
  )
}
