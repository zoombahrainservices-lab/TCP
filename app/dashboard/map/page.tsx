import { requireAuth } from '@/lib/auth/guards'
import { getCachedAllChapters } from '@/lib/content/cache.server'
import { getChapterReportsData } from '@/app/actions/gamification'
import MapClient, { type MapChapter } from './MapClient'

export default async function MapPage() {
  const user = await requireAuth()

  const [chapterReports, allChapters] = await Promise.all([
    getChapterReportsData(user.id),
    getCachedAllChapters(),
  ])

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

    return {
      id: ch.id,
      chapter_number: chapterNum,
      slug: ch.slug,
      title: ch.title,
      framework_code: ch.framework_code ?? null,
      status,
    }
  })

  return (
    <MapClient chapters={mapChapters} currentChapterNumber={currentChapterNumber} />
  )
}
